/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const requestTypes = [
  'store',
  'fetch',
  'route',
  'update',
  'hydrate',
]


/**
 * Get name
 * @param {string} pathname 
 */
function name(pathname) {
  const name = pathname?.split('/').at(-1)
  if(name) {
    return name
  }
}

/**
 * Get pagename
 * @param {string} type
 * @param {object} path
 */
function page(type, path) {
  var base
  switch(type) {
    case 'route':
      base = name(path.pathname)
      break
    default:
      base = name(location.pathname)
  }
  return base ?? 'root'
}

/**
 * Get hash to create new url
 */
function getURL() {
  var src = new URL(document.scripts.bundle.src)

  var name = src.pathname.match(/^\/(.*)-(.*)\.js$/)
  if(name) {
    return new URL(name[1].concat('/', name[2]), location.origin)
  }
}


/**
 * State request
 */
export function request({data, path, type, ...args}, opts = {}) {

  if(data && typeof data !== 'object') {
    throw new TypeError(`Invalid type of 'data'. Expected value of type 'object' but got ${typeof data}'.`)
  }

  if(!requestTypes.includes(type)) {
    throw new ReferenceError(`Invalid request type.`)
  }

  const option = {
    method: 'GET',
    ...opts,
    headers: Object.assign(opts.headers ?? {}, {
      'X-State-Request': btoa(
        JSON.stringify({type, page: page(type, path)})
      ),
    }),
    credentials: 'include'
  }

  if(!data) {
    data = args
  }
  if(!path) {
    path = new URL(location.href)
  }

  if(option.method == 'GET') {
    if(data) {
      for(var i in data) {
        path.searchParams.append(i, data[i])
      }
    }
  }

  if(option.method == 'POST') {
    option.body = JSON.stringify(data)
    option.headers['Content-Type'] = 'application/json'
  }
  return fetch(path, option).then((res) => res.json()).catch(console.error)
}


/**
 * HTTP Request
 */
export default Object.defineProperties({}, {
  get: {
    value: function get(args = {}) {
      return request({type: 'fetch', ...args, path: getURL()}, {method: 'GET'})
    },
    writable: false
  },
  post: {
    value: function post(args = {}) {
      return request({type: 'fetch', ...args, path: getURL()}, {method: 'POST'})
    },
    writable: false
  },
})