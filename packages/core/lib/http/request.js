/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


/**
 * Default exports
 */
module.exports = exports = {}


/**
 * Check endpoint
 */
exports.is = function is(name) {
  return this.route.name == name || this.route.basename == name || this.method == name
}

/**
 * Get header
 */
exports.get = function get(name) {
  return this.headers[name]
}

/**
 * Check origin path e.g. /
 */
exports.isOrigin = function isOrigin() {
  return this.is(undefined)
}

/**
 * Check the first name of segments
 */
exports.startsWith = function startsWith(name) {
  return this.segments[0] == name
}