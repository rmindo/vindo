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
const {isArr, isFunc, merge, reducer} = require('@vindo/react/util')

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
  return '<!DOCTYPE html>'.concat(
    str.replace(charset, (_, g1, g2) => g1.toLowerCase().concat(`=${g2}`))
  )
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
  if(!isArr(children)) {
    children = [children]
  }
  /**
   * Add meta data
   */
  return children.map((child, key) => {
    if(child) {
      return clone(child, {key, ...data})
    }
  })
}


/**
 * Reduce to fewer object props before sending to client
 * 
 * @param {string} name 
 */
function reduce(args) {
  if(!args) {
    return
  }
  const {children} = args.data
  if(children) {
    args.data.children = reducer(children)[0]
  }
  return args
}



/**
 * Get state
 * @param {object} req 
 */
function getState(req) {
  const state = {
    data: {},
    type: 'initial',
  }

  var token = req.get('x-state-request')
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
  }
  return state
}


/**
 * State response
 * 
 * @param {object} req 
 * @param {object} events
 */
function HTTPState(req, events) {
  var exert = {}
  var state = getState(req)


  state.on = function on(name, cb) {
    events.on(mkId(name, req.name), async function(data) {
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
   * Initial state
   */
  state.use = async function use(initial = {}) {
    if(isFunc(initial)) {
      initial = await initial()
    }
    if(state.type == 'route' || state.type == 'initial') {
      merge(state.data, initial)
    }
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

  return new Proxy(state, {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      if(exert[key]) {
        return exert[key]
      }
      return target.data[key]
    },
    set() {
      throw new TypeError(`Cannot assign to read only object.`)
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
 * Set bundle on specific basename
 * @param {object} vindo  
 */
function getBundles(vindo) {
  var data = {}
  for(var pkg in vindo.bundles) {
    var [hash, name] = decode(vindo.bundles[pkg])
    
    data[name] = {
      hash,
      file: `/${name}-${hash}.js`,
      entry: [pkg].concat('src', 'react')
    }
  }
  return data
}


/**
 * Use bundle on specific basename if has one
 */
function useBundle(req, vindo) {
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
    return bundles.main
  }
}


/**
 * React DOM
 * @param {object} data 
 */
function reactDOM(bundle, data) {
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

  return clone(app, {lang: 'en'}, app.props.children.map(children))
}


/**
 * Prepare data
 * @param {object} component 
 * @param {object} context
 */
function getDom(component, {meta, store, state, bundle}) {
  const props = {...component?.props}

  if(props) {
    delete props.children
  }
  /**
   * Metadata and component
   */
  const data = {
    meta,
    store,
    data: {props}
  }
  const dom = reactDOM(bundle, data)

  if(component) {
    data.data.children = isFunc(component.type) ? null : component
  }
  /**
   * Get HTML root component
   */
  return {data: merge(data, {state}), html: html(dom)}
}


/**
 * Middleware
 */
exports.server = function server() {
  var data = {}
  

  return async function(req, res, next, {meta, vindo, events}) {
    const state = HTTPState(req, events)
    const bundle = useBundle(req, vindo)
    
    const protocol = req.socket.encrypted ? 'https:' : 'http:'
    const host = req.headers.host
    const origin = protocol.concat('//', host)
    const href = origin.concat(req.url)


    const pathname = req.url.split('?')[0]

    meta.url = req.url
    meta.path = pathname
    meta.base = req.base
    meta.name = req.name
    meta.query = req.query

    global.window = {}
    global.location = {
      host,
      href,
      origin,
      protocol,
      pathname
    }
    global.document = {
      scripts: {
        bundle: {
          src: origin.concat(bundle.file)
        }
      }
    }

    /**
     * Emit fetch event
     */
    async function getEvent(name) {
      return await events.emit(mkId(name, state.page), state.data)
    }

    /**
     * Dispatch data and clear
     */
    async function dispatch(obj = {}) {
      data = {}
      if(obj.data) {
        obj = reduce(obj)
      }
      res.json(obj)
    }

    /**
     * Render on first request
     */
    events.on('__render', function(component) {
      const args = getDom(component, {
        meta,
        bundle,
        state: state.data,
      })
      /**
       * Initial content
       */
      if(state.type == 'initial') {
        data[bundle.hash] = args.data
      }
      /**
       * Update content
       */
      if(state.type == 'route' || state.type == 'update') {
        return dispatch(args.data)
      }
      
      return args
    })
    
    if(state.type == 'fetch') {
      return dispatch(await getEvent(req.method))
    }

    if(state.type == 'hydrate') {
      return dispatch(data[bundle.hash])
    }
    
    next({state})
  }
}