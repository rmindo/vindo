/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const http = require('http')
const router = require('./router')
const request = require('./request')
const response = require('./response')

/**
 * Util
 */
const util = require('@vindo/utility')

/**
 * Shorthand
 */
const merge = util.object.merge
const toCamelCase = util.string.toCamelCase

/**
 * Server
 */
const server = http.createServer()

/**
 * Default export
 */
module.exports = exports = Object.create(server, {
  listener: {
    value: handler
  }
})

/**
 * Initial configuration
 * @public
 * 
 * @param {object} req - Server request
 */
exports.init = function init({root, cors}) {
  /**
   * Set default headers and status code
   */
  return function start(req, res, next) {
    req.root = root
    req.cors = cors
    
    router.start(req)
  
    merge(req, request)
    merge(res, response)
    /**
     * Convert hyphen separated string to camelcase name
     */
    for(var name in req.headers) {
      req.headers[toCamelCase(name)] = req.headers[name]
    }
    /**
     * Default status
     */
    res.status(200)
    next()
  }
}

/**
 * Start the server
 * @public
 * 
 * @param {number} port
 * @param {object} ctx  
 */
exports.serve = function serve(port, ctx = {}) {
  exports.context = ctx
  /**
   * The last middleware to execute
   */
  exports.stack.push((req, res) => {
    server.request = req
    server.response = res
    
    router.end([server, req, res, ctx])
  })
  exports.on('request', exports.listener).listen(port)
}

/**
 * Handle http request
 * @param req
 * @param res
 */
function handler(req, res) {
  var i = 0
  var done = false

  const stack = exports.stack
  const context = exports.context

  function next() {
    while(i < stack.length) {
      var func = stack[i++]

      if(typeof func !== 'function') {
        continue
      }

      func.call(server, req, res, next, context)
      if(!done) {
        return
      }
    }
    done = true
  }
  next()
}
