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
  router: {
    value: router
  }
})

/**
 * Start the router
 */
exports.start = function start(req, res) {
  req.body = {}
  req.cookies = {}
  
  merge(req, request)
  merge(res, response)

  router.start(req)
  /**
   * Convert hyphen separated string to camelcase name
   */
  for(var name in req.headers) {
    req.headers[toCamelCase(name)] = req.headers[name]
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
  /**
   * The end of the middlewares
   */
  exports.stack.push(async function end(req, res, next, ctx) {
    server.request = req
    server.response = res

    router.end([server, req, res, ctx])
  })
  /**
   * Handle http request
   */
  exports.on('request', handler(exports.stack, ctx)).listen(port)
}


/**
 * Request handler
 * @param stack
 * @param ctx
 */
function handler(stack, ctx) {
  return function(req, res) {

    var i = 0
    var done = false

    function next(data) {

      if(data) {
        if(data.meta) {
          Object.assign(ctx.meta, data.meta)
        }
        else {
          merge(ctx, data)
        }
      }

      while(i < stack.length) {
        var func = stack[i++]

        if(typeof func !== 'function') {
          continue
        }
        if(res.writableEnded || res.writableFinished) {
          break
        }

        func.call(server, req, res, next, ctx)
        if(!done) {
          return
        }
      }
      done = true
    }
    next()
  }
}