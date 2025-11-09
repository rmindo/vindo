/**
 * Get hash to create new url
 */
function getURL() {
  var src = new URL(document.scripts.bundle.src)

  var name = src.pathname.match(/^\/bundle-(.*)\.js$/)
  if(name) {
    var url = new URL(name[1], location.origin)

    var name = location.pathname.split('/').at(-1)
    if(!name) {
      name = 'root'
    }
    url.searchParams.append('name', name)

    return url
  }
}

/**
 * HTTP Request
 */
export function HTTPRequest() {
  const http = Object.defineProperties({}, {
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
  return http
}




/**
 * State request
 */
export function request({data, path, type, ...args}, opts = {}) {

  if(data && typeof data !== 'object') {
    throw new TypeError(`Invalid type of 'data'. Expected value of type 'object' but got ${typeof data}'.`)
  }

  var opts = {
    method: 'GET',
    ...opts,
    headers: Object.assign(opts.headers ?? {}, {
      'X-State-Type': type,
    })
  }

  if(!data) {
    data = args
  }
  if(!path) {
    path = new URL(location.href)
  }

  if(opts.method == 'GET') {
    if(data) {
      for(var i in data) {
        path.searchParams.append(i, data[i])
      }
    }
  }

  if(opts.method == 'POST') {
    opts.body = JSON.stringify({
      ...data,
      name: path.searchParams.get('name')
    })
    opts.headers['Content-Type'] = 'application/json'
  }

  return fetch(path, opts).then((res) => res.json())
}