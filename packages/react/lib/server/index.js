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
 * @param bundle
 */
function head(children, bundle) {
  const env = process.env
  
  if(!isArr(children)) {
    children = [children]
  }
  
  /**
   * Show script only on development
   */
  if(env.NODE_ENV == 'development') {
    children = children.concat(
      create('script', {key: 0, src: env.DEV_SERVER}
    ))
  }

  /**
   * Inject bundle script by default. It can be disabled using meta.bundle = false
   */
  if(bundle) {
    return children.concat(
      create('script', {key: 1, id: 'bundle', type: 'module', src: bundle})
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
      return clone(child, {key, ...data})
    }
  })
}


/**
 * Require main component from react directory
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
  return require(file).default(data)
}


/**
 * Get only relevant info
 * @param {object} req
 */
function getRoute(req) {
  return {
    url: req.url,
    base: req.base,
    name: req.name,
    query: req.query,
    path: req.pathname
  }
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
        children: head(child.props.children, data.meta.bundle && bundle.file)
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
    state.eventId = make(request.method, request.pathname)
  }

  return state
}


/**
 * Middleware
 */
exports.server = function server() {
  return async function(request, response, next, {meta, vindo, events}) {
    /**
     * Exclude path with extensions
     */
    if(request.extension) {
      return next()
    }

    const route = getRoute(request)
    const state = getState(request)
    const bundle = getBundle(request, vindo)

    meta.create(route)
    meta.create({bundle: true})


    /**
     * Create fetch event
     */
    function fetchEvent(method, args) {
      if(isStr(args[0])) {
        events.on(make(method, args[0]), args[1])
      }
      if(isFunc(args[0])) {
        events.on(make(method, meta.path), args[0])
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
          var data = await events.emit(state.eventId, state.data)
          if(!data) {
            if(events.has(state.eventId)) {
              data = {}
            }
            else {
              throw new Error(`No response initiated for ${request.method} request of ${request.pathname}.`)
            }
          }
          return response.json(data)
        /**
         * Update page
         */
        case 'route':
        case 'update':
        case 'hydrate':
          if(data) {
            if(meta.bundle && data.component) {
              data.component = reducer(data.component)[0]
            }
            return response.json(data)
          }
          break
      }
      next({state: state.data})
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
    events.on('__render', function(component) {
      return dispatch(state.type, {component, meta: meta.data})
    })

    await dispatch(state.type)
  }
}