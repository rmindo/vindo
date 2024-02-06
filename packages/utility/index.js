/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const url = require('./lib/url')
const file = require('./lib/file')
const object = require('./lib/object')
const string = require('./lib/string')
const events = require('./lib/events')

/**
 * Default
 */
module.exports = exports = {}

/**
 * Export utilities
 */
exports.url = url
exports.file = file
exports.object = object
exports.string = string
exports.events = events