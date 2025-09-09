/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const path = require('node:path')
const React = require('node_modules/react')
const ReactDom = require('node_modules/react-dom/server')

/**
 * Shorthand
 */
const map = React.Children.map
const clone = React.cloneElement
const create = React.createElement
const isValid = React.isValidElement


var data = {}
var index = require(path.resolve('src/react'))
if(index.default) {
  index = index.default
}


/**
 * Set data
 * @param {object} el 
 * @param {object} meta 
 */
function set(el, meta) {
  const {children: content, ...props} = el.props

  /**
   * Use id if no name provided
   */
  var name = props.name ?? props.id
  var opt = {
    name,
    meta: {name, ...meta}
  }

  switch(el.type.name) {
    case 'View':
      Object.assign(opt, {bundle: true, content: content ?? props})
    break
    default:
      Object.assign(opt, {bundle: false, content: el})
  }


  function children(item) {
    var children = item.props.children

    if(item.type == 'head') {
      children = head(children, opt)
    }
    if(item.type == 'body') {
      children = body(children, opt)
    }
    return clone(item, item.props, children)
  }
  

  const app = index({name, content: opt.content, ...meta})
  return {
    name,
    html: html(
      clone(app, {}, map(app.props.children, children))
    )
  }
}


/**
 * Set data to first level of children function
 * @param {array} children 
 * @param {object} data
 */
function inherit(children, data) {

  return children.map((child, key) => {
    if(typeof child.type == 'function') {
      child = child.type({...child.props, data, meta: data.meta})
    }
    return clone(child, {key})
  })
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
function head(children, args) {
  const env = process.env

  if(!args.bundle) {
    return children
  }

  const queries = new URLSearchParams({
    hash: env.UUID,
    name: args.name,
    port: (env.NODE_ENV == 'dev' || env.NODE_ENV == 'develop' || env.NODE_ENV == 'development') && env.DEV_SERVER_PORT
  })

  return children.concat(
    create('script', {
      key: 0,
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
  
  if(typeof children.type == 'function') {
    const type = children.type(args)

    if(!type) {
      return
    }
    if(type.props.children) {
      children = type.props.children
    }
  }
  data[args.name] = inherit(children, args)

  return data[args.name]
}


/**
 * Client fetch response
 * 
 * @param {object} req 
 * @param {object} res
 */
function HTTPResponse(req, res) {
  const token = req.get('x-fetch-request-token')

  const response = function(data) {
    if(token) {
      res.json(data, 200, {'X-Fetch-Response': token})
    }
  }

  return {
    get(cb) {
      if(req.method == 'GET')
        response(cb(req.query))
    },
    post(cb) {
      if(req.method == 'POST')
        response(cb(req.body))
    }
  }
}


/**
 * Middleware
 */
exports.server = function server() {

  return function(req, res, next, {env, meta, events, exception}) {
    exports.HTTPResponse = HTTPResponse(req, res)
    /**
     * JSX object
     */
    if(req.is(env.UUID)) {
      data = res.json(data[req.query.name]) ?? {}
      return
    }

    events.on('render', function(component) {
      if(req.get('x-fetch-request-token')) {
        return
      }

      if(isValid(component)) {
        var data = set(component, meta)
        if(!data) {
          return
        }
        /**
         * Return nothing if the request not matched with the component.
         */
        const errors = Object.keys(exception.statuses).concat('error')
        if(data.name && req.name) {
          if(req.route.back && data.name !== req.name && !errors.includes(data.name)) {
            return
          }
        }
        return data
      }
    })

    next()
  }
}