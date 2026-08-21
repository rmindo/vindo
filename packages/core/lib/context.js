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
const keys = Object.keys
const get = util.file.get
const merge = util.object.merge
const filter = util.object.filter
const define = util.object.define
const readdir = util.file.readdir
const dirname = util.file.path.dirname
const resolve = util.file.path.resolve
const basename = util.file.path.basename
const toCamelCase = util.string.toCamelCase


const exc = {}


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
  var func = func.split(/\n/)

  /**
   * During development with typescript, the async function
   * will be wrapped with a __awaiter function and it is placed in the second index.
  */
  if(func[1]) {
    func = func[1].match(/__awaiter/) ? func[1] : func[0]
  }

  var func = func.match(/function.*\((.*)\)/)[1]
  var func = func.match(/(?:[^,{}]+|\{[^{}]*\})+/g)


  if(func) {
    length = func.map(arg => arg.trim()).filter(Boolean).length
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
      const val = target[key]

      if(typeof val !== 'function') {
        return val
      }

      return function(...args) {
        if(exc[name]) {
          if(exc[name].includes(key)) {
            return val.call(target, ...args)
          }
        }
        
        const length = getLength(val)
        if(length == args.length) {
          return val.call(target, ...args)
        }
        
        return val.call(target, ...fill(ctx, args, length))
      }
    }
  })
}



/**
 * Get libraries
 * @param {array} files 
 * @param {object} ctx
 * @param {object} conf
 */
exports.getLibs = async function getLibs(files = [], ctx, conf) {
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
      name = basename(file.parentPath)
    }

    try {
      const lib = get([file.parentPath, file.name])
      if(!lib) {
        continue
      }

      if(/-/g.test(name)) {
        name = toCamelCase(name)
      }

      /**
       * Rename library
       */
      const names = conf.context.names
      if(names[name]) {
        name = names[name]
      }

      if(lib.default) {
        if(typeof lib.default == 'function') {
          defs[name] = lib.default
        }
        /**
         * In case the default have a value of object
         */
        if(typeof lib.default == 'object') {
          merge(lib, lib.default)
        }
      }
      ctx[name] = getter(name, filter(lib, ['default']), ctx)
    }
    catch(e) {}
  }

  /**
   * Instantiate all default function and merge
   */
  for(var i in defs) {
    var def = await defs[i](ctx)
    if(def) {
      exc[i] = keys(def)
      ctx[i] = merge(ctx[i], def)
    }
  }

  return ctx
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
   * Read all libraries from lib directory
   */
  var files = readdir('lib', {recursive: true}) ?? []
  /**
   * Include libraries that is added manually in the config file
   */
  for(var key in conf.context.include) {
    files.push({
      name: key,
      parentPath: dirname(resolve(conf.context.include[key]))
    })
  }

  /**
   * Get libraries
   */
  return await exports.getLibs(files, ctx, conf)
}