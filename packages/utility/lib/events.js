/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


module.exports = exports = {}


/**
 * Custom events
 */
const events = {}

/**
 * Add event
 */
exports.on = function on(name, cb) {
  events[name] = {
    name,
    event: cb
  }
}

/**
 * Check if event exists
 */
exports.has = function has(name) {
  return events[name] ? true : false
}

/**
 * Execute the event
 */
exports.emit = function emit(name, ...args) {
  if(events[name]) {
    events[name].event(...args)
    return true
  }
}

/**
 * Remove event
 */
exports.remove = function remove(name) {
  delete events[name]
}