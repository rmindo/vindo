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
const {isArr, isObj, isFunc, merge, reducer} = require('@vindo/react/util')

/**
 * Shorthand
 */
const clone = React.cloneElement
const create = React.createElement


/**
 * Create HTTP state event ID
 * @param {string} prefix 
 * @param {string} name 
 */
function mkId(prefix, name) {
  if(!name) {
    name = 'root'
  }
  return encode(prefix.concat(name)).replace(/=/, '')
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
  return path.resolve(process.cwd(), ...sub)
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
 * Set meta data to first level children in the DOM
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
  var file = resolve('node_modules', entrypoint)

  if(!fs.existsSync(file)) {
    file = path.resolve(entrypoint)
  }

  return require(file).default(data)
}


/**
 * Get current location
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
 * Set bundle on specific basename
 * @param {object} vindo  
 */
function getBundles(vindo) {
  var data = {}

  for(var pkg in vindo.bundles) {
    var entry = [pkg].concat('src', 'react')

    var [hash, name] = decode(vindo.bundles[pkg])
    data[name] = {
      hash,
      file: `/${name}-${hash}.js`,
      entry,
      pages: entry.concat('pages')
    }
  }
  return data
}


/**
 * Use bundle on specific basename if has one
 */
function getBundle(req, vindo) {
  if(!vindo.bundles) {
    throw new ReferenceError('No bundles found in vindo config.')
  }

  const bundles = getBundles(vindo)
  const bundle = bundles[req.base]
  if(bundle) {
    return bundle
  }
  /**
   * Use main entry point if bundle not exists
   */
  if(bundles.main) {
    bundles.main.entry = 'src/react'
    bundles.main.pages = 'src/react/pages'
    return bundles.main
  }
}


/**
 * React DOM
 * @param {object} data 
 */
function getReactDOM(bundle, data) {
  var app = getRoot(bundle.entry, data.meta)
  
  function children(item, key) {
    /**
     * Add script and bundle to the head component
     */
    if(item.type == 'head') {
      return clone(item, {
        key,
        children: head(item.props.children, data.meta.bundle && bundle.file)
      })
    }
    /**
     * Add props to each children of the body component
     */
    if(item.type == 'body') {
      return clone(item, {
        key,
        ...item.props,
        children: body(item.props.children, data)
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
 * Get state request
 * @param {object} req 
 */
function getStateRequest(req) {
  const state = {
    data: {},
    type: 'initial',
  }

  const token = req.get('x-state-request')
  if(token) {
    merge(state, decode(token))
  }

  if(state.type == 'fetch' || state.type == 'update') {
    if(req.method == 'GET') {
      merge(state.data, req.query)
    }
    if(req.method == 'POST') {
      merge(state.data, req.body)
    }
    state.eventId = mkId(req.method, state.page)
  }

  return state
}


/**
 * State response
 * 
 * @param {object} req 
 * @param {object} events
 */
function getState(req, events) {
  var exert = {}
  var state = getStateRequest(req)


  state.on = function on(name, cb) {
    const id = mkId(name, req.name)

    events.on(id, async function(data) {
      if(typeof cb !== 'function') {
        throw new ReferenceError('Callback function is required.')
      }
      return await cb(data)
    })
  }

  state.set = function set(data) {
    merge(exert, data)
  }
  /**
   * Response for 'fetch' event from client
   */
  state.get = function get(cb) {
    state.on('GET', cb)
  }
  /**
   * Response for 'fetch' event from client
   */
  state.post = function post(cb) {
    state.on('POST', cb)
  }
  /**
   * Apply and update the current state
   */
  state.apply = async function apply(cb) {
    if(!isFunc(cb)) {
      return
    }
    if(state.type == 'update') {
      var data = await cb(state.data)
      if(data) {
        exert = data
      }
    }
  }

  state.initialize = function(initialState) {
    if(state.type == 'route' || state.type == 'initial') {
      merge(state.data, initialState)
    }

    return new Proxy(state, {
      get(target, key) {
        if(key == 'initialize') {
          throw new TypeError(`You can't initialize an already initialized state.`)
        }

        if(key in target) {
          return target[key]
        }
        if(key in exert) {
          return exert[key]
        }
        return target.data[key]
      },
      set() {
        throw new TypeError(`Cannot assign to read only object.`)
      }
    })
  }

  return state
}


/**
 * Middleware
 */
exports.server = function server() {
  var context = {}
  
  return async function(req, res, next, {meta, vindo, events}) {
    const route = getRoute(req)
    const state = getState(req, events)
    const bundle = getBundle(req, vindo)
    

    meta.create({
      route,
      bundle: true,
      state: state.initialize
    })

    /**
     * Dispatch data and clear
     */
    async function response(type, data = null) {
      /**
       * Exclude files
       */
      if(req.extension) {
        return next()
      }

      switch(type) {
        /**
         * HTTP request
         */
        case 'fetch':
          if(state.eventId) {
            data = await events.emit(state.eventId, state.data)
            if(!isObj(data)) {
              throw new TypeError(`State response must be of type object.`)
            }
            return res.json(data)
          }
        /**
         * Update page
         */
        case 'route':
        case 'update':
        case 'hydrate':
          context = {}
          if(data) {
            if(data.component) {
              data.component = reducer(data.component)[0]
            }
            return res.json(data)
          }
        default:
          if(data) {
            if(meta.bundle) {
              context[bundle.hash] = data
            }
            return getReactDOM(bundle, data)
          }
      }
      next()
    }


    /**
     * Render on first request
     */
    events.on('__render', function(component) {
      const data = {
        component,
        meta: meta.data,
        state: state.data,
      }
      return response(state.type, data)
    })

    await response(state.type, context[bundle.hash])
  }
}