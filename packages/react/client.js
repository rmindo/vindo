/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const React = require('node_modules/react') 



/**
 * Http Request
 */
function request({path, data}, opts = {}) {
  if(data && typeof data !== 'object') {
    throw TypeError(`Invalid type of 'data'. Expected value of type 'object' but got ${typeof data}'.`)
  }

  var uuid = window.crypto.randomUUID()
  var opts = {
    ...opts,
    headers: {
      ...opts.headers,
      'X-Fetch-Request-Token': uuid
    }
  }

  var url = new URL(location.href)
  if(path) {
    url = new URL(path, location.origin)
  }

  if(opts.method == 'GET') {
    if(data) {
      for(var i in data) {
        url.searchParams.append(i, data[i])
      }
    }
  }

  return fetch(url, opts).then((res) => {
    return res.headers.get('X-Fetch-Response') == uuid && res.json()
  })
}



/**
 * Http Request
 */
exports.http = {
  get(args = {}) {
    return request(args, {...args.headers, method: 'GET'})
  },
  post(args = {}) {
    return request(args, {
      body: JSON.stringify(args.data ?? {}),
      method: 'POST',
      headers: {
        ...args.headers,
        'Content-Type': 'application/json'
      }
    })
  }
}


/**
 * HTML Holder
 */
exports.View = function View({children}) {
  return children
}

/**
 * Find current route
 */
exports.HydrateContent = function HydrateContent({data, meta, ...props}) {

  if(data && React.isValidElement(data.content)) {
    return React.createElement('main', props, data.content)
  }

  return React.createElement('main', props, React.Children.map(props.children, (child) => {
    if(!data || !child.props.name) {
      return
    }
    if(meta.name == child.props.name) {
      return child.props.component(data.content)
    }
  }))
}