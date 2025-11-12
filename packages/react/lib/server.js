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
const {isObj, isArr, isStr, isNum, isFunc} = require('@vindo/react/util')

/**
 * Shorthand
 */
const clone = React.cloneElement
const create = React.createElement
const isValid = React.isValidElement


var build = config.get('buildOption')
var manif = require(path.resolve(build.output, 'manifest.json'))


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
 * Set data
 * @param {object} e 
 * @param {object} context 
 */
function set(e, {type, meta, state}) {
  const name = e.props.name ?? e.props.id
  /**
   * Metadata and component
   */
  const {children, ...props} = e.props
  const data = {
    meta: {
      name,
      bundle: true,
      ...meta
    },
    data: {
      props,
      children: isFunc(e.type) ? null : e
    },
    type,
    state,
  }

  /**
   * Get entry component
   */
  var app = entry(data.meta)
  return {
    name,
    data,
    html: html(
      clone(app, {
        children: app.props.children.map(dom(data))
      })
    )
  }
}

/**
 * Set DOCTYPE
 * @param {object} html 
 */
function html(obj) {
  return '<!DOCTYPE html>'.concat(ReactDom.renderToString(obj))
}


/**
 * Add a bundle script to head
 * @param children
 * @param args
 */
function head(children, {meta}) {
  const env = process.env
  
  if(env.NODE_ENV == 'dev' || env.NODE_ENV == 'develop' || env.NODE_ENV == 'development') {
    children = children.concat(
      create('script', {key: 0, src: env.DEV_SERVER}
    ))
  }

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
        p.children = reducer(v)
      }
      if(isFunc(v)) {
        var f = v.toString()
        var m = [
          ...f.matchAll(/\((.*)\)(\s{|{)((.|\n)*)\}/g)
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
 * Create HTTP state event ID
 * @param {string} method 
 * @param {string} name 
 */
function mkId(method, name) {
  if(!name) {
    name = 'root'
  }
  return Buffer.from(method.concat(name)).toString('base64')
}


/**
 * Get query and body request as state
 * @param {object} req
 */
function merge() {
  return Object.assign(...arguments)
}


function decode(data) {
  return JSON.parse(
    Buffer.from(data, 'base64').toString('utf8')
  )
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
    merge(state.data, req.body, req.query)
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
    events.on(mkId(name, req.name), function(data) {
      return cb(data)
    })
  }

  state.set = function set(data) {
    merge(exert, data)
  }

  state.get = function get(cb) {
    state.on('GET', cb)
  }

  state.post = function post(cb) {
    state.on('POST', cb)
  }

  state.use = function use(initial = {}) {
    if(isFunc(initial)) {
      initial = initial()
    }
    if(state.type == 'route' || state.type == 'initial') {
      merge(state.data, initial)
    }
  }

  state.apply = function apply(cb) {
    if(!isFunc(cb)) {
      return
    }
    if(state.type == 'update') {
      var data = cb(state.data)
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
 * Middleware
 */
exports.server = function server() {
  var data = {}
  
  return function(req, res, next, {meta, events, exception}) {
    const state = HTTPState(req, events)

    /**
     * Emit state request event
     */
    function emit(name) {
      dispatch(
        events.emit(mkId(name, state.page), state.data)
      )
    }

    /**
     * Dispatch data and clear
     */
    function dispatch(obj) {
      data = {}

      if(obj.meta && obj.data && obj.state) {
        return res.json(
          reduce(obj)
        )
      }
      res.json(obj)
    }

    /**
     * Render on first request
     */
    events.on('__render', function(e) {
      if(isValid(e)) {
        var args = set(e, {meta, state: state.data, type: state.type})
        /**
         * Initial content
         */
        if(state.type == 'initial') {
          data[manif.hash] = args.data
        }
        /**
         * Update content
         */
        if(state.type == 'route' || state.type == 'update') {
          return dispatch(args.data)
        }
        
        /**
         * If the request not matched.
         */
        const errors = Object.keys(exception.statuses).concat('error')
        if(args.name && req.name) {
          if(req.route.back && args.name !== req.name && !errors.includes(args.name)) {
            return
          }
        }
        return args
      }
    })

    if(req.is(manif.hash)) {
      if(state.type == 'fetch') {
        return emit(req.method)
      }
      if(state.type == 'render') {
        return dispatch(data[manif.hash])
      }
    }
    
    next({state})
  }
}