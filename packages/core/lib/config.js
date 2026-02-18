/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'

const path = require('path')
const util = require('@vindo/utility')

/**
 * Default configuration
 */
var defaultConfig = {
  port: 9000,
  env: {
    ENV_PATH: {}
  },
  include: {},
  source: 'src',
  routesDirectory: 'http',
}

/**
 * Merge two config
 */
function merge(def, conf) {
  for(let name in def) {
    const item = conf[name]

    if(item) {
      if(typeof item == 'object') {
        conf[name] = Object.assign(def[name], item)
      }
      else {
        conf[name] = item
      }
    }
    else {
      conf[name] = def[name]
    }
  }
  return conf
}

/**
 * Get config file
 */
exports.get = function get(name = null) {
  const file = path.resolve(process.cwd(), 'vindo.json')

  if(!util.file.exists(file)) {
    throw ReferenceError(`vindo.config file does not exists.`)    
  }
  const config = util.file.get(file)

  if(config[name]) {
    return config[name]
  }
  return config
}


/**
 * Merge all configuration
 */
exports.config = function config(config = {}) {
  var conf = merge(defaultConfig, config)

  var vindo = exports.get()
  if(vindo) {
    /** 
     * Config getters
     */
    conf.vindo = new Proxy({}, {
      get(_, name) {
        return vindo[name]
      }
    })
    conf = merge(conf, vindo)
  }

  /**
   * Root directory of routes
   */
  conf.root = [conf.source, conf.routesDirectory]

  if(conf.extends) {
    conf = merge(conf, exports.extension(conf.extends))
  }

  return conf
}


/**
 * Config extension
 */
exports.extension = function extension(pkg) {
  const file = path.resolve(process.cwd(), 'node_modules', pkg, 'vindo.json')

  if(!util.file.exists(file)) {
    throw ReferenceError(`Cannot find vindo.json from ${pkg}.`)    
  }
  return util.file.get(file)
}