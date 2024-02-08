/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const http = require('./http')
const conf = require('./config')
const cont = require('./context')
const utility = require('@vindo/utility')
const exception = require('@vindo/exception')

/**
 * Middleware stack
 */
http.stack = []

/**
 * Export
 */
exports.utility = utility
exports.exception = exception


/**
 * Set initial middleware
 */
function init(config) {
  http.stack.push(http.init(config))
}


/**
 * Include config file
 * @param {object} config
 */
function env(config) {
  const file = utility.file
  const object = utility.object

  
  process.env.PORT = config.port
  /**
   * This allow to switch environment into production and vice versa
   * using the NODE_ENV from process.env
   */
  const envFile = file.parse(
    object.get(config.env.ENV_PATH, process.env.NODE_ENV)
  )

  if(envFile) {
    for(var i in envFile) {
      process.env[i] = envFile[i]
    }
  }

  object.merge(config.env, process.env)
}


/**
 * Server
 * @param {object} config
 */
exports.server = function server(config = {}) {
  var config = conf(config)

  /**
   * Initial config
   */
  env(config)
  init(config)

  /**
   * Set middileware
   */
  http.set = function set(cb) {
    http.stack.push(cb)
  }

  /**
   * Run the server
   */
  http.run = function run(cb = null) {
    http.start(config.port, cont.context(config, cb))
  }

  return http
}