/*
 * @vindo/core
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const util = require('@vindo/utility')
const exce = require('@vindo/exception')


/**
 * Router
 */
module.exports = exports = {}

/**
 * Shorthand
 */
const get = util.file.get
const has = util.events.has
const emit = util.events.emit
const parse = util.url.parse
const merge = util.object.merge
const define = util.object.define
const exists = util.file.exists
const readdir = util.file.readdir
const toCamelCase = util.string.toCamelCase


/**
 * Check if its a function
 * @param fn
 */
function isFunc(fn) {
  return typeof fn == 'function'
}


/**
 * Invoke the function
 * 
 * @param {function} func - A function of the route
 * @param {array} args - Server, Http request, respnse and context
 */
async function invoke(func, args) {
  if(isFunc(func)) {
    const data = await func.call(...args)

    /**
     * Handle template render
     */
    if(has('render')) {
      const res = args[0].response
      // The listener must return an html string to end the request.
      const html = emit('render', data)
      if(html) {
        return res.html(html, res.statusCode)
      }
    }

    return data
  }
}


/**
 * Handle the error exception
 * 
 * @param {object} req - Http request
 * @param {object} res - Http response
 * @param {object} ctx - Context
 */
function error(req, res, ctx) {
  const self = this

  return {
    exit: (e) => {
      var code = e.statusCode

      if(typeof code === 'number') {
        code = code.toString()
      }
      /**
       * Add message coming from error class or subclass.
       */
      if(!e.data && exce.isErrorClass(e)) {
        e.data = {
          message: e.message
        }
      }
      /**
       * If there's uncaught error, then set internal error status and message
       */
      if(!code) {
        code = '500'
        const msg = e.message.split(/\n/)
        if(msg) {
          merge(e, {...exce.statuses[code], data: {message: msg[0]}, log: true})
        }
      }
      /**
       * Get handler from current directory or root
       */
      var fn = getErrorHandler(req.route.path, code)
      if(fn) {
        if(e.log) {
          console.error(e)
        }
        if(fn.default) {
          fn = fn.default
        }
        merge(self, {exception: e})

        const data = fn.call(self, ctx)
        if(!data) {
          return
        }
        /**
         * Handle template render
         */
        if(has('render')) {
          const html = emit('render', data)
          if(html) {
            self.response.html(html, code)
          }
        }
      }
      else {
        res.print(exce.statuses[code].message, code)
      }
    }
  }
}


/**
 * Get the handler function
 * 
 * @param {array} path - Path segments
 * @param {string} code - Status code
 * 
 */
function getErrorHandler(path, code) {
  var root = path.slice(0, 1)
  /**
   * Check which file is available.
   */
  const paths = [
    path.concat(code),
    root.concat(code),
    root.concat('error')
  ]
  for(var path of paths) {
    if(exists(path)) return get(path)
  }
}


/**
 * Get all methods in a file
 *
 * @param {string|array} path - Relative file path or path segments
 */
function getMethods(path) {
  try {
    if(exists(path)) {
      return get(path)
    }
  }
  catch(e) {
    if(exce.isErrorClass(e)) {
      throw e
    }
  }
}


/**
 * Validate name pattern either a number or hex
 * 
 * @param {string} name - Parameter from url
 * 
 */
function getPattern(name) {
  var pat = /^\[([a-z]+)\]$/

  var num = name.match(/^(\d+)$/)
  var hex = name.match(/^([0-9a-f]{16,})$/)

  if(num) {
    pat = /^\[([a-z]+):num\]$/
  }
  if(!num && hex) {
    pat = /^\[([a-z]+):hex\]$/
  }

  return pat
}


/**
 * Get parameter from directory 
 * 
 * @param {string} base - Path basename
 * @param {string|array} path - Relative file path or path segments
 * 
 * @returns {object} Key and value of parameter
 */
function params(base, data) {
  const files = readdir(...data.path)

  /**
   * Allow only specific characters
   */
  if(!files || !base.match(/^([a-z0-9-_.@]+)$/)) {
    return data
  }

  const params = {}
  for(var {name} of files) {
    var match = name.match(getPattern(base))

    if(match) {
      params.key = match[1]
      params.name = name
      params.value = base
    }
    if(name == base) params.name = name
  }

  if(params.name) {
    data.path.push(params.name)
  }
  if(params.key) {
    data.params[params.key] = params.value
  }

  return data
}


/**
 * 
 * @param {string} name Path basename
 * @param {string|array} path Relative file path or path segments
 * @returns {object} Route object
 */
function isExpo(name, path) {
  const methods = getMethods(path)
  if(!methods) {
    return
  }
  if(methods[toCamelCase(name)]) {
    return {path, methods, exported: true}
  }
}


/**
 * Map URL with parameters and get the file path.
 * 
 * @example
 *    From:
 *      /api/v1/users/696a2e70a312e081
 *    To:
 *      /api/v1/users/[uid:hex]
 * 
 * @param {array} data - Route object
 * 
 * @returns {object} Returns path, parameters and rerouted (boolean)
 * 
 */
function map(data) {
  var i = 2
  var p = data.path

  data.params = {}
  data.exported = false

  while(i <= p.length) {
    var path = p.slice(0, i)
    /**
     * Check the parent path directory if exists
     * else find the name in the current directory or inside the file.
     */
    if(exists(path)) {
      data.path = path
    }
    else {
      var name = p[i-1]

      merge(data, params(name, data))
      merge(data, isExpo(name, data.path))
      /**
       * Add to the path if the name exists in the sub-directory
       */
      if(exists(data.path.concat(name))) {
        data.path.push(name)
      }
    }
    i++
  }

  /**
   * Point to error file if not equal
   */
  if(p.length !== data.path.length) {
    data.path = data.root.slice(0, 1)
  }

  return data
}


/**
 * Get current route
 * 
 * @param {string} req - Server request
 * @returns {object} - Current route details
 * 
 */
exports.route = function route({url, root}) {
  const data = parse(url)

  data.root = root
  data.path = root.concat(data.segments)
  /**
   * Start digging if not exist
   */
  if(!exists(data.path)) {
    merge(data, map(data))
    merge(data, isExpo(data.name, data.path.slice(0, -1)))
  }

  if(!data.methods) {
    data.methods = getMethods(data.path)
  }

  return data
}



/**
 * End of the request
 * 
 * @param {array} args - Server, request, response and context
 * 
 */
exports.end = async function end(args) {
  const req = args[1]
  const res = args[2]

  try {
    var exist
    var route = req.route
    var methods = route.methods
    
    if(methods) {
      exist = await exports.handle(route, methods, args)
    }

    /**
     * If no response is being called then exit with 404.
     */
    if(!res.writableEnded || !res.writableFinished) {
      /**
       * If the route exists and still no response then let it freeze.
       */
      if(exist) {
        return
      }
      throw new exce.NotFoundException(null, false)
    }
  }
  catch(e) {
    error.call(...args).exit(exce.error(e))
  }
}


/**
 * Start mapping the request
 * and get the current route details
 * 
 * @param {object} req - Server request
 * 
 */
exports.start = function start(req) {
  const route = exports.route(req)

  route.method = req.method
  /**
   * Add route properties to request
   */
  for(var name in route) {
    define(req, name, {
      value: route[name],
    })
  }
  define(req, 'route', {value: route})
}


/**
 * 
 * Route using function name or HTTP verb
 * 
 * @param {object} route - Route details
 * @param {object} methods - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
exports.handle = async function handle(route, methods, args) {
  var exist = false
  /**
   * Set default for commonJS module exports
   * @example
   *    module.exports = function() {}
   */
  if(isFunc(methods)) {
    methods = {default: methods}
  }

  /**
   * First attempt finding the route using the single export of a function.
   */
  if(route.exported) {
    exist = await isFuncName(route, methods, args)
  }
  else {
    exist = await isHttpVerb(route, methods, args)
  }

  /**
   * Execute only if the first attempt fails.
   */
  if(!exist) {
    exist = await defaultExport(route, methods, args)
  }
  return exist
}


/**
 * Invoke route using http verb name from exported routes
 * 
 * @example
 *    export function GET(req, res) {}
 * 
 *    Or
 * 
 *    export default function(ctx) {
 *      returns {
 *        GET(req, res) {}
 *      }
 *    }
 * 
 * @param {object} methods - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 */
async function isHttpVerb(route, methods, args) {
  if(!methods) {
    return false
  }

  var fn = methods[route.method]
  if(!fn) {
    return false
  }
  await invoke(fn, args)

  return true
}


/**
 * Invoke route using basename as function name from exported routes
 * 
 * @example
 *    export function about(req, res) {}
 * 
 *    Or
 * 
 *    export default function(ctx) {
 *      returns {
 *        about(req, res) {}
 *      }
 *    }
 * 
 * @param {object} route - Route details
 * @param {object} methods - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 */
async function isFuncName(route, methods, args) {
  if(!methods) {
    return false
  }

  var fn = methods[toCamelCase(route.name)]
  if(!fn) {
    return false
  }
  /**
   * If the basename exists and is invoked but returns nothing.
   */
  var methods = await invoke(fn, args)
  if(!methods) {
    return true
  }
  /**
   * If it returns an object then try to execute using the request method.
   */
  return await isHttpVerb(route, methods, args)
}


/**
 * Use default export as the last routing attempt
 * 
 * @example
 *    export default function(ctx) {
 *      return {
 *        GET(req, res) {},
 *        about(req, res) {}
 *        ....
 *      }
 *    }
 * 
 * @param {object} route - Route details
 * @param {object} methods - List of functions from exported routes
 * @param {array} args - Http request, response and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
async function defaultExport(route, methods, [svr, req, res, ctx]) {
  /**
   * Prevent sending new headers, No default found and no functions.
   */
  if(!methods || !isFunc(methods.default) || res && res.writableEnded) {
    return false
  }

  /**
   * Default export
   * @example
   *    export default function(ctx) {}
   */
  ctx.request = req
  ctx.response = res
  const def = await invoke(methods.default, [svr, ctx])
  if(!def) {
    return false
  }

  /**
   * Try to check again if the route is in the default export.
   */
  return await exports.handle(route, def, arguments[2])
}