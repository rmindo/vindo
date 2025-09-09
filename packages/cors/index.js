/*
 * @vindo/cors
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


/**
 * Prefix
 */
const allow = 'Access-Control-Allow'

/**
 * Access control allow origin
 */
function allowOrigin(headers, origin) {

  if(Array.isArray(origin) && origin.indexOf(headers.origin) !== -1) {
    return origin.join(',')
  }
  return origin
}


/**
 * Response headers
 */
exports.cors = function cors(opt = {}) {

  return function(req, res, next) {
    opt = Object.assign(opt, req.cors)

    /**
     * Proceed to the next middleware if empty.
     */
    if(Object.keys(opt).length == 0) {
      return next()
    }

    /**
     * Cross origin
     */
    if(opt.origin) {
      res.setHeader(`${allow}-Origin`, allowOrigin(req.headers, opt.origin))
    }
  
    /**
     * Allowed Headers
     */
    if(opt.allowedHeaders) {
      res.setHeader(`${allow}-Headers`, opt.allowedHeaders.join(','))
    }
  
    /**
     * Allowed Methods
     */
    if(opt.allowedMethods && req.method == 'OPTIONS') {
      res.status(204)
      res.setHeader('Content-Length', '0')
      res.setHeader(`${allow}-Methods`, opt.allowedMethods.join(','))
      res.end()
    }
    else {
      next()
    }
  }
}