/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const path = require('path')
const React = require('react')
const ReactDom = require('react-dom/server')
const {state} = require('@vindo/react/client')
const {has, isObj, isArr, isStr, isNum, isFunc} = require('@vindo/react/util')

/**
 * Shorthand
 */
const map = React.Children.map
const clone = React.cloneElement
const create = React.createElement
const isValid = React.isValidElement




var data = {}
var env = process.env
var xFetch = 'x-fetch-request-token'


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
 * React DOM
 * @param {object} data 
 */
function dom(data) {
  return (item) => {
    if(item.type == 'head') {
      return clone(item, {}, head(item.props.children, data))
    }
    if(item.type == 'body') {
      return clone(item, {}, body(item.props.children, data))
    }
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
  const args = {
    data: props,
    meta: {
      name,
      bundle: true,
      ...meta
    },
    content: isFunc(e.type) ? null : e
  }

  /**
   * Get main react component
   */
  var app = get(path, {content: args.content, ...args.meta})
  return {
    name,
    data: args,
    html: html(
      clone(app, {
        children: map(app.props.children, dom(args))
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
  const isDev = (env.NODE_ENV == 'dev' || env.NODE_ENV == 'develop' || env.NODE_ENV == 'development')

  const queries = new URLSearchParams({
    hash: env.UUID,
    name: meta.name
  })

  return children.concat(
    isDev && create('script', {
      key: 0,
      src: env.DEV_SERVER
    }),
    meta.bundle && create('script', {
      key: 1,
      id: 'bundle',
      type: 'module',
      src: '/bundle.js?'.concat(queries.toString())
    })
  )
}


/**
 * Set meta data to children
 * @param {array} children 
 * @param {object} args
 */
function body(children, args) {

  if(!isArr(children)) {
    children = [children]
  }

  return children.map((child, key) => {
    if(typeof child.type == 'function') {
      child = child.type({...child.props, ...args})
    }
    return clone(child, {key})
  })
}


/**
 * Reduce object to fewer necessary props
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
function reduce(data) {
  if(data) {
    data.content = reducer(data.content)[0]
  }
  return data
}


/**
 * Client fetch response
 * 
 * @param {object} req 
 * @param {object} res
 */
function HTTPResponse(req, res) {
  const token = req.get(xFetch)

  state.use = function use(data) {
    
    if(typeof data == 'function') {
      data = data()
    }

    if(token) {
      data = Object.assign(state.data, data, req.query)
      if(!data.__initialize) {
        return
      }
    }
    Object.assign(state.data, data)
  }

  state.get = function get(cb) {
    if(req.method == 'GET') {
      json(cb(req.query))
    }
  }

  state.post = function post(cb) {
    if(req.method == 'POST') {
      json(cb(req.body))
    }
  }

  function json(data) {
    const token = req.get(xFetch)
    if(token) {
      res.json(data, 200, {'X-Fetch-Response': token})
    }
  }

  return state
}


/**
 * Middleware
 */
exports.server = function server() {

  return function(req, res, next, {env, meta, vindo, events, exception}) {
    const state = HTTPResponse(req, res)

    /**
     * Send content to client
     */
    if(req.is(env.UUID)) {
      res.json(
        reduce(data[req.query.name])
      )
      data = {}
      return
    }

    /**
     * Render on first request
     */
    events.on('render', function(e) {
      if(isValid(e)) {
        var args = set(e, {meta, path: vindo.buildOption.entry})
        if(!args) {
          return
        }

        /**
         * Initial data
         */
        data[args.name] = {...args.data}

        /**
         * Response to HTTP GET request from client to update the DOM
         */
        state.get(() => {
          return reduce(args.data)
        })

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
    
    next({state})
  }
}