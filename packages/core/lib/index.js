/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const http = require('./http')
const cont = require('./context')
const config = require('./config')
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
function init(conf) {
  http.stack.push(http.init(conf))
}


/**
 * Include config file
 * @param {object} conf
 */
function env(conf) {
  const file = utility.file
  const object = utility.object

  
  process.env.PORT = conf.port

  /**
   * This allow to switch environment into production and vice versa
   * using the NODE_ENV from process.env
   */
  const envFile = file.parse(object.get(conf.env.ENV_PATH, process.env.NODE_ENV))
  if(envFile) {
    object.merge(process.env, envFile)
  }
  delete conf.env.ENV_PATH
  
  /**
   * Add env vars to process env
   */
  for(var i in conf.env) {
    if(typeof conf.env[i] == 'string') {
      process.env[i] = conf.env[i]
    }
  }
  object.merge(conf.env, process.env)
}


/**
 * Server
 */
exports.server = function server() {
  var conf = config.config()

  /**
   * Initial config
   */
  env(conf)
  init(conf)

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
    cont.context(conf, cb).then(ctx => http.serve(conf.port, ctx))
  }

  return http
}
