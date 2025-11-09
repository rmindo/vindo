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


var state = {
  set() {
    throw new ReferenceError(`You can only call set() inside mouse event function.`)
  },
  data: {}
}
var opt = config.get('buildOption')
var man = require(path.resolve(opt.output, 'manifest.json'))


/**
 * Require main component from react directory
 * @param {string} point 
 * @param {object} data
 */
function entry(data) {
  const app = require(path.resolve(path.dirname(opt.entry)))
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
function set(e, {meta}) {
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
      content: isFunc(e.type) ? null : e
    },
    state: state.data
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
      src: man.bundle
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
  const {content} = args.data
  if(content) {
    args.data.content = reducer(content)[0]
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
  return Buffer.from(method.concat('-', name)).toString('base64')
}


/**
 * Get query and body request as state
 * @param {object} req
 */
function getState(req) {
  return Object.assign({}, req.body, req.query)
}

/**
 * State response
 * 
 * @param {object} req 
 * @param {object} events
 */
function HTTPState(req, events) {
  const data = getState(req)

  state.type = req.get('x-state-type')

  
  state.on = function on(name, cb) {
    events.on(mkId(name, req.name), function(data) {
      return cb(data)
    })
  }
  state.get = function get(cb) {
    state.on('GET', cb)
  }
  state.post = function post(cb) {
    state.on('POST', cb)
  }

  state.use = function use(cb) {
    if(typeof cb == 'function') {
      Object.assign(state.data, cb(data))
    }
  }

  state.init = function init(data = {}) {
    if(typeof data == 'function') {
      if(!state.type) {
        data = data()
      }
    }
    Object.assign(state.data, data)
  }

  return new Proxy(state, {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }

      if(!data.__reload) {
        Object.assign(target.data, data)
      }
      return target.data[key]
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
    function emit(data) {
      dispatch(
        events.emit(mkId(req.method, data.name), data)
      )
    }

    /**
     * Dispatch data and clear
     */
    function dispatch(obj) {
      data = {}
      state.data = {}

      if(obj.state) {
        return res.json(reduce(obj))
      }
      res.json(obj)
    }

    /**
     * Render on first request
     */
    events.on('__render', function(e) {
      if(isValid(e)) {
        var args = set(e, {meta})
        /**
         * Initial content
         */
        if(!state.type) {
          data[man.hash] = args.data
        }
        /**
         * Update content
         */
        if(state.type == 'update') {
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

    if(req.is(man.hash)) {
      if(state.type == 'fetch') {
        return emit(getState(req))
      }
      if(state.type == 'initialize') {
        return dispatch(data[man.hash])
      }
    }
    
    next({state})
  }
}