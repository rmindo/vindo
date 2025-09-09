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
  exert: {},
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
        def[name] = Object.assign(def[name], item)
      }
      else {
        def[name] = item
      }
    }
  }
  return def
}

/**
 * Get config file
 */
function getConfig() {
  const file = path.resolve(path.dirname(require.main.path), 'vindo.json')
  try {
    if(util.file.exists(file)) {
      return util.file.get(file)
    }
  }
  catch(e) {}
}


module.exports = function(config) {
  var conf = merge(defaultConfig, config)

  var configFile = getConfig()
  if(configFile) {
    /**
     * Config getters
     */
    conf.vindo = {
      get meta() {
        return configFile.meta
      },
      get exert() {
        return configFile.exert
      },
      get buildOption() {
        return configFile.buildOption
      }
    }
    conf = merge(conf, configFile)
  }

  /**
   * Root directory of routes
   */
  conf.root = ['src', conf.routesDirectory]


  return conf
}
