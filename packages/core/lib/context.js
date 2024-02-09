/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const deps = {}
const util = require('@vindo/utility')


/**
 * Default export
 */
module.exports = exports = {}

/**
 * Shorthand
 */
const get = util.file.get
const merge = util.object.merge
const define = util.object.define

/**
 * Call library
 * @param lib The object to execute
 * @param ctx Context to pass down to the route
 */
function invoke(lib, ctx) {
  if(lib.default) {
    lib = lib.default
  }
  if(typeof lib == 'function') {
    return lib(ctx)
  }
  return lib
}

/**
 * Get library file
 * @param path
 */
function getLib(...path) {
  try {
    return get(...path)
  }
  catch(e) {
    if(!e.message.match(/Cannot\sfind\smodule/g)) {
      throw e
    }
  }
}


/**
 * Getter with empty proxy to hide object
 * @param path
 * @param ctx
 */
function getter(path, ctx) {
  return new Proxy({}, {
    get(t, name) {
      return exports.useLib(path, name, ctx)
    }
  })
}


/**
 * Use injected library
 * @param path Directory path
 * @param sub Sub directory
 * @param ctx Context
 */
exports.useLib = function useLib(path, sub, ctx) {
  var main = path.at(-1)
  /**
   * Accessing the main directory of the library injected
   */
  if(!deps[main]) {
    var lib = getLib(...path)
    if(!lib) {
      lib = getLib(...path, sub)
    }
    deps[main] = invoke(lib, ctx)
  }
  /**
   * Accessing files and sub directories
   */
  if(!deps[sub]) {
    const funcs = deps[main]
    if(funcs[sub]) {
      deps[sub] = funcs
    }
    else {
      var lib = getLib(...path, sub)
      if(lib) {
        deps[sub] = invoke(lib, ctx)
      }
    }
  }
  /**
   * Return the main library injected
   */
  var lib = deps[main]
  if(lib && lib[sub]) {
    return lib[sub]
  }
  /**
   * Return the sub library
   */
  if(deps[sub]) {
    return deps[sub]
  }
}


/**
 * Context
 * @param config
 * @param deps
 */
exports.context = function context(conf, deps) {
  const ctx = {
    env: conf.env,
    exert: conf.exert,
    ...util
  }

  if(deps) {
    merge(ctx, deps(ctx))
  }
  for(var key in conf.include) {
    define(ctx, key, {
      value: getter([conf.sourceDirectory].concat(conf.include[key]), ctx)
    })
  }
  return ctx
}