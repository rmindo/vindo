/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const {string} = require('@vindo/utility')

/**
 * Default exports
 */
module.exports = exports = {
  headers: {}
}


/**
 * Reset headers
 */
exports.reset = function reset() {
  exports.headers = {}
}


/**
 * Set status
 * @param {number} code
 */
exports.status = function status(code) {
  this.statusCode = code
}


/**
 * Prepare header before sending response
 * @param {object} data
 */
exports.prepare = function prepare(data) {
  for(var key in data) {
    exports.headers[string.toKebabCase(key)] = data[key]
  }
}


/**
 * Create headers
 * @param {object} headers
 */
exports.create = function create(headers) {
  for(var key in headers) {
    this.setHeader(string.toKebabCase(key), headers[key])
  }
}


/**
 * * Redirect URL
 * @param {string} url
 */
exports.redirect = function redirect(url, headers = {}) {
  if(this.writableEnded || this.writableFinished) {
    return
  }
  this.writeHead(301, {
    ...headers,
    Location: url
  })
  this.end()
}


/**
 * Send body response
 * @param {string} body 
 * @param {number} code 
 * @param {object} headers 
 */
exports.print = function print(body, code = 200, headers = {}) {
  if(this.writableEnded || this.writableFinished) {
    return
  }
  this.prepare(headers)
  this.writeHead(code, exports.headers)
  this.end(body)
  this.reset()
}

/**
 * HTML response body
 * @param body
 * @param code
 * @param headers
 */
exports.html = function html(body, code = 200, headers = {}) {
  this.print(body, code, {
    ...headers,
    'Content-Type': 'text/html; charset=utf-8'
  })
}

/**
 * JSON response body
 * @param body
 * @param code
 * @param headers
 */
exports.json = function json(body = {}, code = 200, headers = {}) {
  if(typeof body !== 'object') {
    throw Error('The first argument must be of type object.')
  }
  this.print(JSON.stringify(body, null, 2), code, {
    ...headers,
    'Content-Type': 'application/json'
  })
}

/**
 * Use stream event
 */
exports.eventStream = function eventStream(headers = {}) {
  const res = this

  res.create({
    ...headers,
    connection: 'keep-alive',
    cacheControl: 'no-cache',
    contentType: 'text/event-stream'
  })

  return {
    write(data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }
}
