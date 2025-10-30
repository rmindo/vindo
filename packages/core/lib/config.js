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
  meta: {},
  include: {},
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
function getConfig() {
  const file = path.resolve(process.cwd(), 'vindo.json')

  if(!util.file.exists(file)) {
    throw ReferenceError(`vindo.config file does not exists.`)    
  }

  return util.file.get(file)
}


module.exports = function config(_conf) {
  var conf = merge(defaultConfig, _conf)

  var vindo = getConfig()
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
  conf.root = ['src', conf.routesDirectory]


  return conf
}
