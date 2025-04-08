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
const file = util.file
const ext = util.file.ext
const get = util.file.get
const has = util.events.has
const emit = util.events.emit
const parse = util.url.parse
const split = util.url.split
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

    if(has('render')) {
      /**
       * The listener must return an html string to end the request.
       */
      const html = emit('render', {data})
      if(html) {
        return args[0].response.html(html)
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
      var code = e.status.toString()

      if(e.log) {
        console.error(e)
      }

      /**
       * Add message coming from error class or subclass.
       */
      if(!e.data && exce.isErrorClass(e)) {
        e.data = {
          error: e.message
        }
      }

      var fn = getErrorHandler(req.route, code)
      if(fn) {
        merge(self, {exception: e})

        if(fn.default) {
          fn = fn.default
        }
        fn.call(self, ctx)
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
 * @param {object} route - Route details.
 * @param {string} code - Status code
 * 
 */
function getErrorHandler(route, code) {
  var path = route.segments
  var root = route.segments.slice(0, 1)
  /**
   * Iterate and check which file is available.
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
 * @param {array} path - Relative file path or path segments
 */
function getRoutes(path) {
  try {
    return get(path)
  }
  catch(e) {
    if(exce.isErrorClass(e)) {
      throw e
    }
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
 * @param {object} funcs - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 */
async function isHttpVerb(route, funcs, args) {
  if(!funcs) {
    return false
  }

  var fn = funcs[route.method]
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
 * @param {object} funcs - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 */
async function isFuncName(route, funcs, args) {
  if(!funcs) {
    return false
  }

  var fn = funcs[toCamelCase(route.basename)]
  if(!fn) {
    return false
  }
  /**
   * If the basename exists and invoked but returns nothing.
   */
  var verbs = await invoke(fn, args)
  if(!verbs) {
    return true
  }
  /**
   * If it returns an object then try to execute using the request method.
   */
  return await isHttpVerb(route, verbs, args)
}


/**
 * 
 * Route using function name or HTTP verb
 * 
 * @param {object} route - Route details
 * @param {object} funcs - List of functions from exported routes
 * @param {array} args - Http request, respnse and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
exports.handle = async function handle(route, funcs, args) {
  var exist = false
  /**
   * Set default for commonJS module exports
   * @example
   *    module.exports = function() {}
   */
  if(isFunc(funcs)) {
    funcs = {default: funcs}
  }

  /**
   * First attempt finding the route using the single export of a function.
   */
  if(route.exported) {
    exist = await isFuncName(route, funcs, args)
  }
  else {
    exist = await isHttpVerb(route, funcs, args)
  }

  /**
   * Execute only if the first attempt fails.
   */
  if(!exist) {
    exist = await defaultExport(route, funcs, args)
  }
  return exist
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
 * @param {object} funcs - List of functions from exported routes
 * @param {array} args - Http request, response and context
 * 
 * @returns {boolean} - Return true if the current route exists.
 * 
 */
async function defaultExport(route, funcs, [svr, req, res, ctx]) {
  /**
   * Prevent sending new headers, No default found and no functions.
   */
  if(!funcs || !isFunc(funcs.default) || res && res.writableEnded) {
    return false
  }

  /**
   * Default export
   * @example
   *    export default function(ctx) {}
   */
  ctx.request = req
  ctx.response = res

  const def = await invoke(funcs.default, [svr, ctx])
  if(!def) {
    return false
  }

  /**
   * Try to check again if the route is in the default export.
   */
  return await exports.handle(route, def, arguments[2])
}


/**
 * Validate ID pattern either a number or hex
 * 
 * @param {string} id - Parameter from url
 * 
 */
function getIdPattern(id) {
  var pat = /^\[([a-z]+)\]$/

  var num = id.match(/^(\d+)$/)
  var hex = id.match(/^[0-9a-f]+$/)

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
 * @param {array} path - Relative file path or path segments
 * @param {string} base - Path basename
 * 
 * @returns {object} Key and value of parameter
 */
function getParam(path, base) {
  const data = {}
  const files = readdir(...path)

  /**
   * Allow only specific characters
   */
  if(!files || !base.match(/^([a-z0-9-_.@]+)$/)) {
    return data
  }

  for(var {name} of files) {
    var match = name.match(getIdPattern(base))

    if(match) {
      data.key = match[1]
      data.name = name
      data.value = base
    }
    if(name == base) data.name = name
  }

  return data
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
 * @param {array} root - Root directory including the source dir
 * @param {array} shreds - Shredded url with concatenated with root path
 * 
 * @returns {object} Returns path, parameters and rerouted (boolean)
 * 
 */
function mapParams(shreds) {
  /**
   * Start at 3 index to exclude the root directory
   */
  var i = 3
  /**
   * Root directory as initial path
   */
  var path = shreds.slice(0, 2)
  
  var params = {}
  var exported = false
  var notExistNum = 0

  while(i <= shreds.length) {
    var segments = shreds.slice(0, i)

    /**
     * Check the parent path directory if exists
     * else find the name in the current directory or inside the file.
     */
    if(exists(segments)) {
      path = segments
    }
    else {
      var name = shreds[i-1]
      var param = getParam(path, name)

      // Set parameter if has one
      if(param.key) {
        params[param.key] = param.value
      }

      /**
       * If it has a name (it means a parameter or
       * basename matches the directory) then add it to the path.
       */
      if(param.name) {
        path.push(param.name)
      }
      else {
        // Add to path if the name exists as file in the sub directory
        if(exists(path.concat(name))) {
          path.push(name)
        }
        else {
          /**
           * Count the number of non-existing names passed after the resource path.
           * e.g
           *    /resource/not-exist-1/collection/not-exist-2
           */
          notExistNum += 1
          /**
           * Set to true so the router can find the exported function in a file.
           * e.g
           *    /index.js exported the about page
           *    export function about() {}
           */
          exported = true
        }
      }
    }
    i++
  }

  if(notExistNum > 1) {
    path = shreds
  }
  
  return {path, params, exported}
}


/**
 * Map the URL to the directory.
 * 
 * @param {string} req - Server request
 * 
 * @returns {object} - Current route details
 * 
 */
exports.map = function map({url, root, method}) {
  const parsed = parse(url)
  const shreds = split(parsed.url)

  /**
   * Route
   */
  const base = shreds.at(-1)
  const name = base && file.path.parse(base).name
  const data = {
    name,
    path: root.concat(shreds),
    method,
    params: {},
    basename: base,
    pathname: parsed.url,
    query: parsed.query,
    extension: ext(base)
  }

  /**
   * Reroute the non file or directory route.
   */
  if(!exists(data.path)) {
    const path = data.path.slice(0, -1)
    /**
     * Match the defined route inside the file.
     */
    if(exists(path) && base && base.match(/^([a-z-]+)$/)) {
      data.path = path
      data.exported = true
    }
    else {
      /**
       * Map parameters from directory.
       */
      merge(data, mapParams(root.concat(shreds)))
    }
  }

  data.segments = data.path
  data.path = data.path.join('/')

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
    var funcs = getRoutes(route.path)

    if(funcs) {
      exist = await exports.handle(route, funcs, args)
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
  const route = exports.map(req)
  /**
   * Define route properties to request
   */
  for(var name in route) {
    define(req, name, {
      value: route[name],
    })
  }
  define(req, 'route', {value: route})
}