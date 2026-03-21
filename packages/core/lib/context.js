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
const set = util.object.set
const cut = util.object.filter
const merge = util.object.merge
const define = util.object.define
const resolve = util.file.path.resolve



/**
 * Get library
 * @param path
 * @param ctx
 */
function get(path, ctx) {
  const excl = ['default']

  try {
    var lib = util.file.get(resolve(...path))
    if(!lib) {
      return {}
    }

    /**
     * Add context to every function of the library
     */
    if(typeof lib == 'object') {
      setContext(lib, ctx)
    }
    ctx.self = lib

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
    const def = lib.default ?? lib.__init__
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
        var fdef = def(ctx)
        if(!fdef) {
          return cut(lib, excl)
        }
        return merge(lib, fdef, excl)
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
 * Inject context as last optional argument
 * to every exported function except for default function
 * 
 * @param {object} lib Library object
 * @param {object} ctx Context
 */
function setContext(lib, ctx) {
  /**
   * function to execute
   */
  function exec() {
    var a = args
    var f = fn.toString()
    var f = f.split(/\n/)[0]
    var f = f.match(/^function.*\(([a-zA-Z_,.{}\s=]+)\)/)
    var f = f[1] ? f[1].split(/,\s/) : []
    
    
    if(f.length == a.length) {
      return fn(...a)
    }
    var data = Array(f.length)
    
    var i = 0
    while(i < f.length) {
      if(i < a.length) {
        data.fill(a[i], i)
      }
      else if(i == (f.length-1)) {
        data.fill({...ctx, self: lib}, i)
      }
      else {
        data.fill(undefined, i)
      }
      i++
    }
    return fn(...data)
  }
  
  for(var i in lib) {
    var fn = lib[i]
    if(typeof fn !== 'function' || fn.name.match(/default_/)) {
      continue
    }
    lib[i] = toFunc(fn.name, {args: ['...args'], refs: {fn, lib, ctx}, code: `(${exec})()`})
  }
  return lib
}


/**
 * Check if function is async
 * 
 * TODO:
 *  Need to improve
 * @param {function} fun Function to check
 */
function isAsync(fun) {
  var lns = fun.toString().split(/\n/).slice(0,4)

  /**
   * Both commonjs and es6
   */
  var async = lns.filter((v, k) => {
    var t = v.trim()
    if(t.match(/^async\s/)) {
      return t
    }

    if(t.match(/^return\s__awaiter/g) || k == 0 && t.match(/^function/) && t.match(/return\s__awaiter/)) {
      return t
    }
  })
  if(async.length == 1) {
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
    if(typeof args == 'string') {
      arr.push(`(${args})`)
    }
    if(Array.isArray(args)) {
      arr.push(
        `(${args.length ? args.join(',') : ''})`
      )
    }
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
      code: 'def(Object.assign(ctx, arg))'
    })
  }
}


/**
 * Get library
 * @param {array} path Array segment of path
 * @param {object} ctx Global context
 */
async function getLib(path, ctx) {
  var lib = exports.getter([ctx.vindo.source, path], ctx)
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
  const lib = get(path, ctx) ?? {}

  return new Proxy(lib, {
    get(target, name) {
      /**
       * Find a function inside the default function
       */
      if(target[name]) {
        return target[name]
      }
      /**
       * Look for existing library in the context
       */
      if(ctx[name]) {
        return ctx[name]
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
exports.getContext = async function getContext(conf, inject) {
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
  if(inject) {
    merge(ctx, await inject(ctx))
  }
  /**
   * Add custom libraries
   */
  for(var key in conf.include) {
    ctx[key] = await getLib(conf.include[key], ctx)
  }
  var lib = await getLib('lib', ctx)
  /**
   * Exclude, Its no longer needed
   */
  cut(ctx, ['self'])
  /**
   * Use property name 'lib' as a base
   * path for accessing sub libraries in the directory
   */
  set(ctx, 'lib', {writable: false, value: lib})

  return ctx
}