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
  return this.route.name == name || this.route.basename == name
}

/**
 * Check root path e.g. /
 */
exports.root = function root() {
  return this.is(undefined)
}