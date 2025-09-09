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
module.exports = exports = {}

/**
 * Shorthand
 */
const set = util.object.set
const merge = util.object.merge
const define = util.object.define
const resolve = util.file.resolve


/**
 * Get library
 * @param path
 * @param ctx
 */
function get(path, ctx) {
  const excl = ['default']

  try {
    const lib = util.file.get(resolve(...path))
    if(!lib) {
      return {}
    }
    /**
     * Exported function on commonjs
     * e.g
     * module.exports = function()
     */
    if(typeof lib == 'function') {
      if(isAsync(lib)) {
        return toAsync(lib, ctx)
      }
      return lib(ctx)
    }
    /**
     * Libraries with no default function exported
     */
    const def = lib.default
    if(!def) {
      return lib
    }
    /**
     * Libraries with object exported
     */
    if(typeof def == 'object') {
      return merge(lib, def, excl)
    }
    /**
     * Libraries with default funcation exported
     */
    if(typeof def == 'function') {
      if(isAsync(def)) {
        return merge(lib, toAsync(def, ctx), excl)
      }
      else {
        return merge(lib, def(ctx), excl)
      }
    }
  }
  catch(e) {
    if(!e.message.match(/Cannot\sfind\smodule/g)) {
      throw e
    }
    return {}
  }
}


/**
 * Check if function is async
 * @param {function} fun Function to check
 */
function isAsync(fun) {
  var str = fun.toString().split('\n')
  /**
   * Both commonjs and es6
   */
  if(str[0].match(/^async\s/) || str[1].match(/return\s__awaiter/g)) {
    return true
  }
  return false
}


/**
 * Create a function declaration
 * 
 * @param {string} name Name of the function
 * @param {string} code The script to run
 * @param {array} args Arguments of the function to make
 * @param {object} refs Reference of script
 */
function toFunc(name, {code, args = [], refs}) {
  var arr = ['return', 'function', name]

  if(args) {
    arr.push(
      `(${args.length ? args.join(',') : ''})`
    )
  }
  if(typeof code == 'string') {
    arr.push(
      `{return ${code}}`
    )
  }
  return new Function(...Object.keys(refs), arr.join(' '))(...Object.values(refs))
}


/**
 * Recreate the async function as declared function with a new name
 * @param {function} func The default function
 * @param {object} ctx Context
 */
function toAsync(def, ctx) {
  const name = def.name == 'default_1' || def.name == '' ? 'async' : def.name;
  
  return {
    [name]: toFunc(name, {
      args: ['arg'],
      refs: {def, ctx},
      code: 'def({...ctx, ...arg})'
    })
  }
}


/**
 * Get library
 * @param {array} path Array segment of path
 * @param {object} ctx Global context
 */
async function getLib(path, ctx) {
  var lib = exports.getter(['src',path], ctx)
  /**
   * Merge functions from async to sync functions
   */
  if(typeof lib.async == 'function') {
    return merge(lib, await lib.async(), ['async'])
  }

  return lib
}


/**
 * Chain library getter
 * e.g
 * ctx.mylib.recursive.path.of.the.function()
 * 
 * @param path
 * @param ctx
 */
exports.getter = function getter(path, ctx) {
  const lib = get(path, ctx)

  return new Proxy(lib, {
    get(target, name) {
      /**
       * Look for existing library in the context
       */
      if(ctx[name]) {
        return ctx[name]
      }
      /**
       * Find a function inside the default function
       */
      if(target[name]) {
        return target[name]
      }
      /**
       * Exclude async
       */
      if(name == 'then' || name == 'async') {
        return
      }
      return exports.getter(path.concat(name), ctx)
    }
  })
}


/**
 * Context
 * @param config Configuration
 * @param inject Dependencies to inject
 */
exports.context = async function context(conf, inject) {
  const ctx = {}
  /**
   * Built-in utilities
   */
  define(ctx, {
    env: {value: conf.env, writable: false},
    url: {value: util.url, writable: false},
    meta: {value: conf.meta, writable: true},
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
  if(inject) {
    merge(ctx, inject(ctx))
  }
  /**
   * Add local libraries
   */
  for(var key in conf.include) {
    ctx[key] = await getLib(conf.include[key], ctx)
  }
  /**
   * Use property name 'lib' as a base
   * path for accessing sub libraries in the directory
   */
  set(ctx, 'lib', {writable: false, value: await getLib('lib', ctx)})

  return ctx
}