/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


module.exports = exports = {
  stack: {}
}

/**
 * Add event
 */
exports.on = function on(name, cb) {
  exports.stack[name] = {
    name,
    event: cb
  }
}

/**
 * Check if event exists
 */
exports.has = function has(name) {
  return exports.stack[name] ? true : false
}

/**
 * Execute the event
 */
exports.emit = function emit(name, ...args) {
  if(exports.stack[name]) {
    return exports.stack[name].event(...args)
  }
}

/**
 * Clear events
 */
exports.clear = function clear() {
  exports.stack = {}
}

/**
 * Remove event
 */
exports.remove = function remove(name) {
  delete exports.stack[name]
}