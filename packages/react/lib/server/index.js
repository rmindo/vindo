/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const path = require('path')
const React = require('react')
const ReactDom = require('react-dom/server')
const {isArr, isFunc, isStr, merge, reducer} = require('@vindo/react/util')

/**
 * Shorthand
 */
const clone = React.cloneElement
const create = React.createElement


/**
 * Create event ID
 * @param {string} prefix 
 * @param {string} string 
 */
function make(prefix, string) {
  return encode(prefix.concat(string)).replace(/=/g, '')
}

/**
 * Encode string to base64
 * @param {string} string
 */
function encode(string) {
  return Buffer.from(string).toString('base64')
}

/**
 * Decode base64 string
 * @param {string} string
 */
function decode(string) {
  const data = Buffer.from(string, 'base64').toString('utf8')
  try {
    return JSON.parse(data)
  }
  catch(e) {
    return data
  }
}

/**
 * Resolve working directory
 */
function resolve(...sub) {
  return path.resolve(require.main.path, ...sub)
}

/**
 * Set DOCTYPE
 * @param {object} html 
 */
function html(obj) {
  const str = ReactDom.renderToString(obj)
  /**
   * Capture unchanged charSet attribute
   */
  const charset = /(charSet)=("utf-8")/
  /**
   * renderToString() failed to convert JSX charSet attribute to lower case.
   * 
   * We'll convert the charset to lowe case manually to avoid W3C validation errors and
   * potential parsing issues for strict crawlers, impacting SEO.
   */
  return {
    html: '<!DOCTYPE html>'.concat(
      str.replace(charset, (_, g1, g2) => g1.toLowerCase().concat(`=${g2}`))
    )
  }
}


/**
 * Add a bundle script to head
 * @param children
 * @param data
 * @param bundle
 */
function head(children, data, bundle) {
  const meta = data.meta

  if(!isArr(children)) {
    children = [children]
  }

  /**
   * Show script only on development
   */
  if(process.env.NODE_ENV == 'development') {
    children = children.concat(
      create('script', {key: 0, src: process.env.DEV_SERVER}
    ))
  }


  if(meta.bundle) {
    if(data.children) {
      meta.hydrate = true
    }
    /**
     * Inject bundle script by default. It can be disabled using meta.bundle = false
     */
    if(bundle.file) {
      children = children.concat(
        create('script', {key: 1, id: 'bundle', type: 'module', src: bundle.file})
      )
    }
    /**
     * Metadata
     */
    children = children.concat(
      create('script', {key: 1, id: 'hydrate', type: 'application/json'}, JSON.stringify({meta}))
    )
  }
  return children
}


/**
 * Set meta data to the first level children of the body
 * @param {array} children 
 * @param {object} args
 */
function body(children, data) {
  if(!children) {
    return
  }

  if(!isArr(children)) {
    children = [children]
  }

  /**
   * Add meta data
   */
  return children.map((child, key) => {
    if(child) {
      if(!isFunc(child.type)) {
        return child
      }
      
      if(child.type.name === 'Content') {
        return clone(child, {key, meta: data.meta}, child.props.children.concat(
          create(React.Fragment, {
            key: null,
            path: data.meta.path,
            component: data.children
          })
        ))
      }

      return clone(child, {key, meta: data.meta})
    }
  })
}


/**
 * Get main component from react directory (src/react/index)
 * @param {string} entrypoint
 * @param {object} data
 */
function getRoot(entrypoint, data) {
  /**
   * Resolve if the endpoint is from a package
   */
  var file = resolve('node_modules', entrypoint)
  
  if(!fs.existsSync(file)) {
    file = resolve(entrypoint)
  }

  if(!fs.existsSync(file)) {
    throw Error(`No entrypoint found at '${file}'`)
  }

  return require(file).default(data)
}


/**
 * Use bundle on specific basename if has one
 */
function getBundle(req, vindo) {
  if(!vindo.bundles) {
    throw new ReferenceError('No bundles found in vindo config.')
  }

  const bundles = {}
  for(var pkg in vindo.bundles) {
    const entry = [pkg].concat('src', 'react')

    const [hash, name] = decode(vindo.bundles[pkg])
    bundles[name] = {
      hash,
      entry,
      file: `/${name}-${hash}.js`,
      pages: entry.concat('pages')
    }
  }
  /**
   * Get specific bundle using base path
   */
  const bundle = bundles[req.base]
  if(bundle) {
    return bundle
  }
  /**
   * Use main entry point if bundle not exists
   */
  if(bundles.main) {
    bundles.main.entry = 'react'
    bundles.main.pages = 'react/pages'
    return bundles.main
  }
}


/**
 * React DOM
 * @param {object} data 
 */
function getReactDOM(bundle, data) {
  if(!data) {
    return
  }
  const app = getRoot(bundle.entry, data.meta)
  

  function children(child, key) {
    /**
     * Add script and bundle to the head component
     */
    if(child.type == 'head') {
      return clone(child, {
        key,
        children: head(child.props.children, data, bundle)
      })
    }
    /**
     * Add props to each children of the body component
     */
    if(child.type == 'body') {
      return clone(child, {
        key,
        ...child.props,
        children: body(child.props.children, data)
      })
    }
  }

  return html(
    clone(app, {
      lang: 'en',
      children: app.props.children.map(children)
    })
  )
}


/**
 * State response
 * 
 * @param {object} request
 */
function getState(request) {
  const state = {
    data: {},
    type: 'initial',
  }

  const type = request.get('x-request-type')
  if(type) {
    state.type = type
  }

  if(['fetch', 'update'].includes(type)) {
    switch(request.method) {
      case 'GET':
        merge(state.data, request.query)
        break
      case 'POST':
        merge(state.data, request.body)
        break
    }
    state.eventId = make(request.method, request.pathname.slice(1))
  }

  return state
}


/**
 * Middleware
 */
exports.server = function server(conf = {}) {
  return async function(request, response, next, {meta, vindo, events}) {
    meta.create({
      bundle: true,
      path: request.pathname
    })
    /**
     * Exclude path with extensions
     */
    if(request.extension) {
      return next()
    }

    const state = getState(request)
    const bundle = getBundle(request, vindo)


    /**
     * Create fetch event
     */
    function fetchEvent(method, args) {
      if(isStr(args[0])) {
        events.on(make(method, args[0]), args[1])
      }
      
      if(isFunc(args[0])) {
        const eventId = make(method, meta.path.slice(1))
        if(!events.has(eventId)) {
          events.on(eventId, args[0])
        }
      }
    }

    /**
     * Send data to client
     */
    async function dispatch(type, data = null) {
      switch(type) {
        /**
         * Initial render
         */
        case 'initial':
          if(data) {
            return getReactDOM(bundle, data)
          }
          break
        /**
         * HTTP request
         */
        case 'fetch':
          if(!events.has(state.eventId)) {
            throw new Error(`No ${request.method} response initiated for ${request.pathname}.`)
          }
          var data = await events.emit(state.eventId, state.data)

          return response.json(data)
        /**
         * Update page
         */
        case 'route':
        case 'update':
          if(data) {
            if(meta.bundle && data.children) {
              data.children = ReactDom.renderToString(reducer(data.children))
            }
            return response.json(data)
          }
          break
      }
      next({state: state.data, wildcard: conf.wildcard})
    }

    /**
     * Response for 'fetch' event from client
     */
    response.get = function get() {
      fetchEvent('GET', arguments)
    }
    /**
     * Response for 'fetch' event from client
     */
    response.post = function post() {
      fetchEvent('POST', arguments)
    }

    /**
     * Render on first request
     */
    events.on('__render', function(children) {
      return dispatch(state.type, {children, meta: meta.data})
    })

    await dispatch(state.type)
  }
}