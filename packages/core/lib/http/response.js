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
module.exports = exports = {}


/**
 * Set status
 * @param code
 */
exports.status = function status(code) {
  this.statusCode = code
}

/**
 * Set headers
 * @param headers
 */
exports.headers = function headers(headers) {
  for(var key in headers) {
    this.setHeader(string.toKebabCase(key), headers[key])
  }
}

/**
 * Redirect URL
 * @param url
 */
exports.redirect = function redirect(url) {
  if(this.writableEnded) {
    return
  }
  this.writeHead(301, {Location: url})
  this.end()
}

/**
 * HTML response body
 * @param body
 * @param code
 * @param headers
 */
exports.html = function html(body = null, code = 200) {
  if(this.writableEnded) {
    return
  }
  this.writeHead(code, {
    'Content-Type': 'text/html'
  })
  this.end(body)
}

/**
 * JSON response body
 * @param body
 * @param code
 * @param headers
 */
exports.json = function json(body = {}, code = 200) {
  if(this.writableEnded) {
    return
  }
  if(typeof body !== 'object') {
    throw Error('The first argument must be of type object.')
  }

  this.writeHead(code, {
    'Content-Type': 'application/json'
  })
  this.end(JSON.stringify(body, null, 2))
}

/**
 * Response body
 * @param body
 * @param code
 * @param headers
 */
exports.print = function print(body = null, code = 200, headers = {}) {
  if(this.writableEnded) {
    return
  }
  this.writeHead(code, headers)
  this.end(body)
}

/**
 * Use stream event
 */
exports.eventStream = function(headers = {}) {
  const res = this

  res.headers({
    connection: 'keep-alive',
    cacheControl: 'no-cache',
    contentType: 'text/event-stream',
    ...headers
  })

  return {
    write(data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }
}
