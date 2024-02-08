/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const util = require('@vindo/utility')

/**
 * Default configuration
 */
var defaultConfig = {
  port: 9000,
  env: {
    ENV_PATH: {}
  },
  cors: {},
  exert: {},
  include: {
    lib: 'lib'
  },
  sourceDirectory: 'src',
  routesDirectory: 'http',
}


module.exports = function(config) {
  var conf = Object.assign(defaultConfig, config)

  try {
    config = util.file.get('vindo.json')
  }
  catch(e) {}

  if(config) {
    for(let name in conf) {
      const item = config[name]

      if(item) {
        if(typeof item == 'object') {
          conf[name] = {...conf[name], ...item}
        }
        else {
          conf[name] = item
        }
      }
    } 
  }

  /**
   * Root directory of routes
   */
  conf.root = [
    conf.sourceDirectory,
    conf.routesDirectory
  ]

  return conf
}
