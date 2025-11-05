/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const path = require('path')
const React = require('react')
const ReactDom = require('react-dom/server')
const {has, isObj, isArr, isStr, isNum, isFunc} = require('@vindo/react/util')

/**
 * Shorthand
 */
const clone = React.cloneElement
const create = React.createElement
const isValid = React.isValidElement



var state = {
  set() {
    throw new ReferenceError(`You can only call it inside mouse event function.`)
  },
  data: {}
}

/**
 * Require main component from react directory
 * @param {string} point 
 * @param {object} data
 */
function get(point, data) {
  const app = require(path.resolve(path.dirname(point)))
  if(app) {
    return app.default(data)
  }
}


/**
 * Set data
 * @param {object} e 
 * @param {object} context 
 */
function set(e, {meta, path}) {
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
  }

  /**
   * Get main react component
   */
  var app = get(path, data.meta)
  return {
    name,
    data,
    html: html(
      clone(app, {
        children: app.props.children.map((item, key) => {
          if(item.type == 'head') {
            return clone(item, {key}, head(item.props.children, data))
          }
          if(item.type == 'body') {
            return clone(item, {key}, body(item.props.children, data))
          }
        })
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
      src: `/bundle.js?hash=${env.UUID}`
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



function getState(req) {
  switch(req.method) {
    case 'GET':
      return req.query
    case 'POST':
      return req.body
    default:
      return {}
  }
}


/**
 * Create HTTP state event ID
 * @param {string} method 
 * @param {string} name 
 */
function concatID(method, name) {
  if(!name) {
    name = 'root'
  }
  return method.concat('-', name)
}

/**
 * State response
 * 
 * @param {object} req 
 * @param {object} events
 */
function HTTPState(req, events) {
  state.token = req.get('x-state-request')

  state.use = function use(data = {}) {
    if(typeof data == 'function') {
      if(!state.token) {
        data = data()
      }
    }
    Object.assign(state.data, data)
  }

  state.get = function get(cb) {
    request('GET', cb)
  }

  state.post = function post(cb) {
    request('POST', cb)
  }

  function request(key, cb) {
    events.on(concatID(key, req.name), function(data) {
      return cb(data)
    })
  }

  return new Proxy(state, {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }

      const data = getState(req)
      if(has(data)) {
        Object.assign(target.data, !data.__reload && data)
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
  
  return function(req, res, next, {env, meta, vindo, events, exception}) {
    const state = HTTPState(req, events)

    /**
     * Disable devtools
     */
    if(['com.chrome.devtools.json'].includes(req.basename)) {
      return next({state})
    }
    
    /**
     * Dispatch data and clear
     */
    function dispatch(obj) {
      data = {}
      state.data = {}
      
      res.json(obj, 200, {'X-State-Response': state.token})
    }

    /**
     * Render on first request
     */
    events.on('__render', function(e) {
      if(isValid(e)) {
        var args = set(e, {meta, path: vindo.buildOption.entry})
        /**
         * Initial content
         */
        if(!state.token) {
          data = args.data
        }
        /**
       * Update content
       */
        else {
          return dispatch(
            reduce({...args.data, state: state.data})
          )
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


    if(req.is(env.UUID)) {
      const id = concatID(req.method, req.query.name)

      if(req.query.__initialize) {
        return dispatch({
          ...reduce(data),
          state: state.data,
        })
      }
      return dispatch(events.emit(id, getState(req)))
    }
    
    next({state})
  }
}