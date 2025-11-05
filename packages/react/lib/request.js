
/**
 * Get hash to create new url
 */
function getURL() {
  const src = new URL(document.scripts.bundle.src)

  if(src.searchParams.size > 0) {
    var url = new URL(
      src.searchParams.get('hash'), location.origin
    )

    var name = location.pathname.split('/').at(-1)
    if(!name) {
      name = 'root'
    }
    url.searchParams.append('name', name)

    return url
  }
}

/**
 * HTTP State
 */
export function HTTPState() {
  const http = Object.defineProperties({data: {}}, {
    get: {
      value: function get(args = {}) {
        return request({...args, path: getURL()}, {method: 'GET'})
      },
      writable: false
    },
    post: {
      value: function post(args = {}) {
        return request({...args, path: getURL()}, {method: 'POST'})
      },
      writable: false
    },
  })
  return http
}




/**
 * State request
 */
export function request({data, path, ...args}, opts = {}) {

  if(data && typeof data !== 'object') {
    throw TypeError(`Invalid type of 'data'. Expected value of type 'object' but got ${typeof data}'.`)
  }

  var uuid = window.crypto.randomUUID()
  var opts = {
    method: 'GET',
    ...opts,
    headers: Object.assign(opts.headers ?? {}, {
      'X-State-Request': uuid
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

  return fetch(path, opts).then((res) => {
    return res.headers.get('X-State-Response') == uuid && res.json()
  })
}