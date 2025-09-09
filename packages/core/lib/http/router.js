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
 * Check if its a function
 * @param fn
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
 * Exported function
 * @param {object} data Route object
 * @returns {object} Route object
 */
function isExpo(data) {
  const path = data.path.slice(0, -1)
  if(!exists(path)) {
    return
  }
  const methods = get(path)
  
  if(methods && methods[toCamelCase(data.name)]) {
    data.path = path
    data.methods = methods
    return data
  }
}


/**
 * Invoke the function
 * 
 * @param {function} func - A function of the route
 * @param {array} args - Server, Http request, respnse and context
 */
async function invoke(func, args) {
  const res = args[0].response

  if(!isFunc(func)) {
    return
  }

  const data = await func.call(...args)
  /**
   * Stop the process if response is ended before rendering the content.
   */
  if(isEnded(res)) {
    return
  }
  /**
   * Emit external template renderer.
   */
  if(has('render')) {
    const render = await emit('render', data)
    if(render) {
      return res.html(render.html, res.statusCode)
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
      var fn = getErrorHandler(req.route.path, code)
      if(fn) {
        if(e.log) {
          console.error(e)
        }
        if(fn.default) {
          fn = fn.default
        }
        ctx.error = e

        const data = fn.call(self, ctx)
        if(!data) {
          return
        }
        /**
         * Handle template render
         */
        if(has('render')) {
          const render = await emit('render', data)
          if(render) {
            return self.response.html(render.html, code)
          }
        }
      }
      res.print(exce.statuses[code].status, code)
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
    case 'leno':
      return /^\[([a-z]+)(:|_)leno\]$/
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
  const files = readdir(...path)

  if(!files || !item.value) {
    return data
  }

  for(var {name} of files) {
    if(!name.match(/^\[|\]$/)) {
      continue
    }

    var patt = name.match(/^\[([a-z]+)\]$/)
    if(!patt) {
      patt = name.match(getPattern(item.type))
    }
    if(patt) {
      data.key = patt[1]
      data.name = name
      data.value = item.value
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
function mapParams(data) {
  var path = [...data.segments]
  /**
   * Slice at specific key
   */
  var sliceAt = function(e) {
    return data.root.concat(path.slice(0, e))
  }
  /**
   * Exclude directory that's existed
   */
  const excl = function(acc, val) {
    if(!exists(sliceAt(val.key + 1))) {
      acc[val.key] = val
    }
    return acc
  }
  data.args = data.args.reduce(excl, {})
  data.params = {}


  var i = 0
  while(i < path.length) {
    const item = data.args[i]
    
    if(item) {
      const para = getParams(item, sliceAt(item.key))

      if(para.name) {
        path[item.key] = para.name
      }
      if(para.key) {
        data.params[para.key] = para.value
      }
    }
    i++
  }
  data.path = data.root.concat(path)

  /**
   * if the basename is not exist then fallback.
   */
  if(!exists(data.path)) {
    data.back = true
    data.path = data.path.slice(0, -1)
  }

  return data
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
  var fn = route.methods[toCamelCase(route.name)]
  if(!fn) {
    return false
  }
  /**
   * If the basename exists and is invoked but returns nothing.
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
async function checkFromDefault(route, args) {
  const methods = route.methods
  /**
   * Prevent sending new headers, No function/default found, and root index from executing when page not exist.
   */
  if(!methods || !isFunc(methods.default) || isEnded(args[2]) || route.basename && route.path.length == 2) {
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
 * Get current route
 * 
 * @param {string} req - Server request
 * @returns {object} - Current route details
 * 
 */
exports.route = function route({url, root}) {
  const data = parse(url)

  data.base = false
  data.root = root
  data.path = root.concat(data.segments)

  /**
   * Map parameters to folders
   */
  if(!exists(data.path)) {
    /**
     * Check for exported function
     */
    const exp = isExpo(data)
    if(exp) {
      return exp
    }
    /**
     * Map parameters
     */
    merge(data, mapParams(data))
  }
 
  data.methods = get(data.path)
  /**
   * Base file (not parameter or exported function)
   */
  data.base = data.path.slice(2).length == data.segments.length

  return data
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
    return false
  }
  /**
   * HTTP verb
   */
  var invoked = false
  if(route.base) {
    invoked = await isHttpVerb(route, args)
  }
  else {
    invoked = await isFuncName(route, args)
  }

  /**
   * Execute only if the first attempt fails.
   */
  if(!invoked) {
    invoked = await checkFromDefault(route, args)
  }
  return invoked
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
  const exclude = [
    'base',
    'root',
    'back',
    'methods'
  ]
  route.method = req.method
  /**
   * Add route properties to request
   */
  const data = {}
  for(var name in route) {
    if(!exclude.includes(name)) {
      data[name] = {value: route[name], writable: false}
    }
  }
  define(req, {
    ...data,
    route: {value: route, writable: false}
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
     * If no response is being called then exit with 404.
     */
    if(!isEnded(args[2])) {
      /**
       * If the route exists and still no response then let it freeze.
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