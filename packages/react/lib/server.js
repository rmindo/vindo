/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const path = require('path')
const React = require('react')
const config = require('@vindo/core/config')
const ReactDom = require('react-dom/server')
const {isObj, isArr, isStr, isNum, isFunc, merge} = require('@vindo/react/util')

/**
 * Shorthand
 */
const clone = React.cloneElement
const create = React.createElement
const isValid = React.isValidElement


var build = config.get('buildOption')
var manif = require(path.resolve(build.output, 'manifest.json'))



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
  return JSON.parse(
    Buffer.from(string, 'base64').toString('utf8')
  )
}

/**
 * Require main component from react directory
 * @param {string} point 
 * @param {object} data
 */
function entry(data) {
  const app = require(path.resolve(path.dirname(build.entry)))
  if(app) {
    return app.default(data)
  }
}


/**
 * React DOM
 * @param {object} data 
 */
function dom(data) {
  return (item, key) => {
    if(item.type == 'head') {
      return clone(item, {key}, head(item.props.children, data))
    }
    if(item.type == 'body') {
      return clone(item, {key}, body(item.props.children, data))
    }
  }
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
 * @param args
 */
function head(children, {meta}) {
  const env = process.env
  
  /**
   * Show script only on development
   */
  if(env.NODE_ENV == 'dev' || env.NODE_ENV == 'develop' || env.NODE_ENV == 'development') {
    children = children.concat(
      create('script', {key: 0, src: env.DEV_SERVER}
    ))
  }

  /**
   * Inject bundle script by default. It can be disabled using meta.bundle = false
   */
  return children.concat(
    meta.bundle && create('script', {
      key: 1,
      id: 'bundle',
      type: 'module',
      src: manif.bundle
    })
  )
}


/**
 * Set meta data to children
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
  return children.map((child, key) => clone(child, {key, ...data}))
}


/**
 * Reduce object to necessary props
 * @param {array|object} children 
 */
function reducer(children) {
  if(!children) {
    return []
  }
  if(!isArr(children)) {
    children = [children]
  }

	return children.map(({type, props}) => {
    var p = {}

    if(!props) {
      return
    }
    /**
     * Component function
     */
    if(isFunc(type)) {
      if(/^default_1/.test(type.name)) {
        throw new ReferenceError(`Component function requires a name. Currently have a default name of '${type.name}'.`)
      }
      type = [type.name]
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isArr(v)) {
        p.children = v.map((v) => {
          if(isObj(v)) {
            return reducer(v)[0]
          }
          return v
        })
      }
      if(isObj(v)) {
        if(i == 'style') {
          p.style = v
        }
        if(i == 'children') {
          p.children = reducer(v)
        }
      }
      if(isFunc(v)) {
        var f = v.toString()
        var m = [
          ...f.matchAll(/\((.*)\)(\s{|\s=>\s{|{)((.|\n)*)\}/g)
        ][0]
        p[i] = {
          name: i,
          mouseevent: true,
          code: m[3].trim(),
          args: m[1].split(',').filter(v => v),
          refs: ['state','meta']
        }
      }
    }

    return {type, props: p}
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
 * Prepare data
 * @param {object} component 
 * @param {object} context
 */
function prepare(component, {meta, store, state}) {
  const name = component.props.name ?? component.props.id
  /**
   * Metadata and component
   */
  const {children, ...props} = component.props
  const data = {
    meta: {name, bundle: true, ...meta},
    data: {
      props,
      children: isFunc(component.type) ? null : component
    },
    store
  }

  /**
   * Get entry component
   */
  var app = entry(data.meta)
  return {
    name,
    data: merge(data, {state}),
    html: html(
      clone(app, {
        children: app.props.children.map(dom(data))
      })
    )
  }
}


/**
 * Middleware
 */
exports.server = function server() {
  var data = {}
  // TODO: Move to more reliable storage
  var store = {}


  /**
   * Persist data
   */
  function persist(type, {action, data}) {
    if(type == 'store') {
      switch(action) {
        case 'clear':
          return {}
        case 'remove':
          delete store[data]
        default:
          // TODO: Limit adding data
          return merge(store, data)
      }
    }
    return store
  }
  

  return function(req, res, next, {meta, events}) {
    const state = HTTPState(req, events)
    const store = persist(state.type, req.body)
    /**
     * Emit state request event
     */
    async function emit(name) {
      return await events.emit(mkId(name, state.page), state.data)
    }

    /**
     * Dispatch data and clear
     */
    async function dispatch(obj = {}) {
      data = {}

      if(state.type == 'fetch') {
        return res.json(await emit(req.method))
      }

      if(obj.data) {
        return res.json(reduce(obj))
      }
      res.json(obj)
    }

    /**
     * Render on first request
     */
    events.on('__render', function(comp) {
      if(!isValid(comp)) {
        return
      }
      
      var args = prepare(comp, {
        meta,
        store,
        state: state.data,
      })
      /**
       * Initial content
       */
      if(state.type == 'initial') {
        data[manif.hash] = args.data
      }
      /**
       * Update content
       */
      if(state.type == 'route' || state.type == 'update' || state.type == 'store') {
        return dispatch(args.data)
      }
      
      return args
    })

    if(req.is(manif.hash)) {
      return dispatch(data[manif.hash])
    }
    
    next({state, store})
  }
}