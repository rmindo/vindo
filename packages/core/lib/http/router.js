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
const has = util.events.has
const emit = util.events.emit
const parse = util.url.parse
const merge = util.object.merge
const define = util.object.define
const exists = util.file.exists
const readdir = util.file.readdir
const toCamelCase = util.string.toCamelCase



/**
 * Fallback one step
 * @param  {mixed} args 
 */
function cut(path) {
  if(!isArr(path)) {
    return path
  }
  return path.slice(0, -1)
}


/**
 * Get all methods in a file
 *
 * @param {string|array} path - Relative file path or path segments
 */
function get(path) {
  try {
    if(exists(path)) {
      return util.file.get(path)
    }
  }
  catch(e) {
    if(exce.isErrorClass(e)) {
      throw e
    }
  }
}


/**
 * Check if it's an array
 */
function isArr(val) {
  return val && Array.isArray(val)
}


/**
 * Check if it's a function
 * @param {function} fn
 */
function isFunc(fn) {
  return typeof fn == 'function'
}


/**
 * Check if writable is ended
 * @param {object} res
 */
function isEnded(res) {
  return res.writableEnded || res.writableFinished
}


/**
 * Check if path is equal without the root directory
 * @param {object} route 
 */
function isPathEqual(route) {
  return route.segments.length == route.path.slice(route.root.length).length
}


/**
 * Invoke the function
 * 
 * @param {function} func - A function of the route
 * @param {array} args - Server, Http request, respnse and context
 */
async function invoke(func, args) {
  var res = args[0].response

  if(!func && !isFunc(func)) {
    return
  }

  var data = await func.call(...args)
  /**
   * Stop the process if response is ended before rendering the content.
   */
  if(isEnded(res)) {
    return
  }
  return await render.call(args[0], data, res.statusCode)
}


/**
 * Emit external template renderer.
 * @param {object} data 
 * @param {number} code 
 */
async function render(data, code) {
  if(has('__render')) {
    const render = await emit('__render', data)
    if(render) {
      return this.response.html(render.html, code)
    }
  }
  return data
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
    async exit(e) {
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
      var fn = getErrorHandler(req.route, code)
      if(fn) {
        ctx.error = e
        
        if(e.log) {
          console.error(e)
        }
        if(fn.default) {
          fn = fn.default
        }

        const data = fn.call(self, ctx)
        if(!data) {
          return
        }
        /**
         * Handle template render
         */
        return render.call(self, data, code)
      }

      res.json({error: e.toString()}, code)
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
function getErrorHandler({path, root}, code) {
  /**
   * Check which file is available.
   */
  const paths = [path.concat(code)]
  if(root) {
    paths.push(
      root.concat(code),
      root.concat('error')
    )
  }
  for(var path of paths) {
    if(exists(path)) return get(path)
  }
}


/**
 * Validate name pattern either a number or hex
 * 
 * @param {string} name - Parameter from url
 * 
 */
function getPattern(type) {
  switch(type) {
    case 'num':
      return /^\[([a-z]+)(:|_)num\]$/
    case 'hex':
      return /^\[([a-z]+)(:|_)hex\]$/
    case 'lest':
      return /^\[([a-z]+)(:|_)lest\]$/
    case 'slug':
      return /^\[([a-z]+)(:|_)slug\]$/
    case 'alpha':
      return /^\[([a-z]+)(:|_)alpha\]$/
    default:
      return /^\[([a-z]+)\]$/
  }
}


/**
 * Get parameter from directory 
 * 
 * @param {string} base - Path basename
 * @param {string|array} path - Relative file path or path segments
 * 
 * @returns {object} Key and value of parameter
 */
function getParams(item, path) {
  const data = {}
  const files = readdir(path)

  if(!files || !item.value) {
    return data
  }

  for(var {name} of files) {
    if(!name.match(/^\[|\]$/)) {
      continue
    }

    var patt = name.match(getPattern(item.type))
    if(!patt) {
      patt = name.match(/^\[([a-z]+)\]$/)
    }
    if(patt) {
      data.key = patt[1]
      data.name = name
      data.value = item.value
      break
    }
  }
  return data
}


/**
 * Map to parameters.
 * 
 * @example
 *    From:
 *      /api/v1/users/696a2e70a312e081
 *    To:
 *      /api/v1/users/[uid:hex]
 * 
 * @param {array} data - Route object
 * @returns {object} Returns path, parameters and rerouted (boolean)
 * 
 */
function isParameter(data) {
  const path = [...data.segments]
  /**
   * Slice at specific key
   */
  function at(e) {
    return data.root.concat(path.slice(0, e))
  }
  /**
   * Exclude directory that's existed
   */
  data.args = data.args.filter(v => !exists(at(v.key + 1)))
  data.params = {}

  /**
   * Iterate only non existing pathname
   */
  for(var item of data.args) {
    const para = getParams(item, at(item.key))
    if(para.name) {
      path[item.key] = para.name
    }
    if(para.key) {
      data.dynamic = true
      data.params[para.key] = para.value
    }
  }
  data.path = data.root.concat(path)

  /**
   * Fallback one step if no methods from current path
   */
  if(!exists(data.path)) {
    data.path = cut(data.path)
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

  if(data.extension) {
    return data
  }

  data.root = root
  data.path = root.concat(data.segments)

  /**
   * Find the file
   */
  if(exists(data.path)) {
    return data
  }
  /**
   * Check for exported function
   */
  const exp = isExported(data)
  if(exp) {
    return exp
  }
  /**
   * Map parameters
   */
  return isParameter(data)
}


/**
 * Exported function
 * @param {object} data Route object
 * @returns {object} Route object
 */
function isExported(data) {
  /**
   * Fallback one step if no methods from current path
   */
  const path = cut(data.path)
  if(!exists(path)) {
    return
  }
  const methods = get(path)
  if(!methods) {
    return
  }

  if(methods[toCamelCase(data.name)]) {
    data.path = path
    data.methods = methods

    return data
  }
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
async function isHttpVerb(route, args) {

  if(!route.methods) {
    return false
  }
  /**
   * Find HTTP verb method from methods
   */
  var fn = route.methods[route.method]
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
async function isFuncName(route, args) {
  if(!route.methods) {
    return false
  }
  /**
   * Find camel case function name from methods
   */
  var fn = route.methods[toCamelCase(route.name)]
  if(!fn) {
    return false
  }
  /**
   * If invoked but returns nothing then let pass through and freeze (see end() function).
   */
  route.methods = await invoke(fn, args)
  if(!route.methods) {
    return true
  }
  /**
   * If it returns an object then try to execute using the request method.
   */
  return await isHttpVerb(route, args)
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
 * @param {array} args - Http request, response and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
async function isFromDefault(route, args) {
  var methods = route.methods
  /**
   * Prevent sending new headers, No function/default found, and already ended response
   */
  if(!methods || !isFunc(methods.default) || isEnded(args[2])) {
    return false
  }
  /**
   * Default export
   * @example
   *    export default function(ctx) {}
   */
  route.methods = await invoke(methods.default, [args[0], args[3]])
  if(!route.methods) {
    return true
  }
  /**
   * Handle nested methods
   */
  return exports.handle(route, args)
}


/**
 * 
 * Route using function name or HTTP verb
 * 
 * @param {object} route - Route details
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
exports.handle = async function handle(route, args) {
  if(!route.methods) {
    route.methods = get(route.path)
  }
  /**
   * Handles hyphen separated pathname
   */
  var exist = await isFuncName(route, args)
  if(exist) {
    return exist
  }
  /**
   * Handles request with HTTP verbs
   */
  if(isPathEqual(route)) {
    var exist = await isHttpVerb(route, args)
    if(exist) {
      return exist
    }
  }
  /**
   * Check routes from default if above fails
   */
  return await isFromDefault(route, args)
}


/**
 * Start mapping the request
 * and get the current route details
 * 
 * @param {object} req - Server request
 * 
 */
exports.start = function start(req) {
  const data = {}
  const route = exports.route(req)

  for(var name in route) {
    data[name] = {value: route[name], writable: false}
  }

  route.method = req.method
  define(req, {
    ...data,
    route: {value: route, writable: true}
  })
}


/**
 * End of the request
 * 
 * @param {array} args - Server, request, response and context
 * 
 */
exports.end = async function end(args) {
  
  try {
    var exists = await exports.handle(args[1].route, args)

    /**
     * Reset and clear data when response is ended
     */
    if(isEnded(args[2])) {
      args[3].meta = {}
      args[3].events.remove('__render')
    }
    else {
      /**
       * If the route exists and still no response then let it freeze and wait for response.
       */
      if(exists) {
        return
      }
      throw new exce.NotFoundException(null, false)
    }
  }
  catch(e) {
    error.call(...args).exit(exce.error(e))
  }
}