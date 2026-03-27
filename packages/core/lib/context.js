/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const util = require('@vindo/utility')
const exception = require('@vindo/exception')


/**
 * Default export
 */
module.exports = exports = {
  context: {meta: {}}
}


/**
 * Shorthand
 */
const merge = util.object.merge
const filter = util.object.filter
const define = util.object.define


var exc = {}


/**
 * 
 * @param {object} ctx 
 * @param {array} args 
 * @param {number} length
 */
function fill(ctx, args, length) {
  var i = 0
  var z = length-1

  var data = Array(length)
  while(i < z) {
    data.fill(args[i], i)
    i++
  }
  data.fill(ctx, z)

  return data
}


/**
 * 
 * @param {function} func 
 */
function getLength(func) {
  var length = 0

  var func = func.toString()
  var func = func.split(/\n/)[0]
  var func = func.match(/^function.*\(([a-zA-Z0-9_,.\s]+)\)/)
  
  if(func) {
    length = func[1].split(/,\s/).length
  }
  return length
}


/**
 * 
 * @param {string} name 
 * @param {object} lib 
 * @param {object} ctx
 */
function getter(name, lib, ctx) {

  return new Proxy(lib, {
    get(target, key) {
      var func = target[key]

      if(typeof func !== 'function') {
        return
      }

      return function(...args) {
        if(exc[name]) {
          if(exc[name].includes(key)) {
            return func.call(target, ...args)
          }
        }
        
        var length = getLength(func)
        if(length == args.length) {
          return func.call(target, ...args)
        }
        
        return func.call(target, ...fill(ctx, args, length))
      }
    }
  })
}


/**
 * Get libraries
 */
function getLibs(files, ctx) {
  var defs = {}

  /**
   * Get files from lib directory
   */
  for(var file of files) {
    if(/^\./.test(file.name)) {
      continue
    }

    var name = file.name.split(/\./)[0]
    if(name == 'index') {
      name = ctx.file.path.basename(file.parentPath)
    }

    const lib = ctx.file.get([file.parentPath, file.name])
    if(lib) {
      if(lib.default) {
        defs[name] = lib.default
        /**
         * In case the default have a value of object
         */
        if(typeof lib.default == 'object') {
          merge(lib, lib.default)
        }
      }
      /**
       * Add context to every function except the default function
       */
      ctx[name] = getter(name, filter(lib, ['default']), ctx)
    }
  }

  return [ctx, defs]
}


/**
 * Context
 * @param config Configuration
 * @param dependencies Dependencies to inject
 */
exports.getContext = async function getContext(conf, dependencies) {
  var ctx = exports.context

  /**
   * Built-in utilities
   */
  define(ctx, {
    env: {value: conf.env, writable: false},
    url: {value: util.url, writable: false},
    file: {value: util.file, writable: false},
    vindo: {value: conf.vindo, writable: false},
    string: {value: util.string, writable: false},
    object: {value: util.object, writable: false},
    events: {value: util.events, writable: false},
    exception: {value: exception, writable: false},
  })

  /**
   * Add external libraries
   */
  if(dependencies) {
    merge(ctx, await dependencies(ctx))
  }

  /**
   * All libraries from lib directory
   */
  var files = util.file.readdir([ctx.vindo.source, 'lib'])

  /**
   * Include libraries that is added manually in the config file
   */
  for(var key in conf.include) {
    const path = util.file.path.resolve(conf.include[key])
    files.push({
      name: key,
      parentPath: util.file.path.dirname(path)
    })
  }
  
  /**
   * Instantiate all default function
   */
  var [ctx, defs] = getLibs(files, ctx)
  for(var i in defs) {
    var def = defs[i]
    if(typeof def !== 'function') {
      continue
    }

    def = await def(ctx)
    if(def) {
      exc[i] = Object.keys(def) 
      ctx[i] = merge(ctx[i], def)
    }
  }

  return ctx
}