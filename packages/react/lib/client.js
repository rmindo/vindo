/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import runtime from 'react/jsx-runtime'
import ReactDom from 'react-dom/client'
import {isObj, isArr, isStr, isNum} from '@vindo/react/util'



const event = {}

/**
 * Http state request
 */
const httpState = {
  data: {},
  /**
   * Update DOM
   */
  set({path, ...args}) {
    httpState.get({
      path,
      data: Object.assign(httpState.data, args),
    })
    .then((data) => event.update(data))
  },
  /**
   * GET request
   */
  get(args = {}) {
    return request(args, {method: 'GET'})
  },
  /**
   * POST request
   */
  post(args = {}) {
    return request(args, {method: 'POST'})
  },
}

/**
 * State setter and getter
 */
export const state = new Proxy(httpState, {
  /**
   * Get property
   */
  get(target, key) {
    if(target[key]) {
      return target[key]
    }
    return state.data[key]
  },
  /**
   * Set property
   */
  set(target, key, value, receiver) {
    const insert = [
      'use',
      'get',
      'post'
    ]
    if(insert.includes(key)) {
      return Reflect.set(target, key, value, receiver)
    }
    state.data[key] = value

    return true
  }
})

/**
 * Component Holder
 */
export function View() {}


/**
 * Link
 */
export function Link({href, text, children}) {
  if(!href) {
    throw new ReferenceError(`Props 'href' is missing.`)
  }

  const onClick = (e) => {
    e.preventDefault()

    state.set({
      path: href,
      __initialize: true
    })
    history.pushState({}, text, href)
  }

  if(!children) {
    children = text
  }
  return React.createElement('a', {href, onClick}, children)
}


/**
 * Find current route
 */
export function Content(props) {
  const {data, meta, content} = context()
  /**
   * View content coming from backend component (src/http)
   */
  if(React.isValidElement(content)) {
    return React.createElement('main', props, content)
  }

  /**
   * View content coming from react directory (src/react)
   */
  return React.createElement('main', props, React.Children.map(props.children, (child) => {
    if(!child.props.name) {
      throw new ReferenceError(`Props 'name' is required for View component.`)
    }
    if(meta.name == child.props.name) {
      return child.props.component(data)
    }
  }))
}

import {useContext, createContext} from 'react'

const getContext = createContext({test: 'tae'})


export function context() {
  return useContext(getContext)
}

export function Provider({children, ...ctx}) {
  return React.createElement(getContext, {value: ctx}, children)
}


/**
 * Http Request
 */
function request({init, path, data, headers}, opts = {}) {
  if(data && typeof data !== 'object') {
    throw TypeError(`Invalid type of 'data'. Expected value of type 'object' but got ${typeof data}'.`)
  }

  var uuid = window.crypto.randomUUID()
  var opts = {
    ...opts,
    headers: {
      ...headers,
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

  if(opts.method == 'POST') {
    opts.body = JSON.stringify(data ?? {})
  }

  return fetch(url, opts).then(async (res) => {
    const data = await res.json()

    if(init) {
      return data
    }
    return res.headers.get('X-Fetch-Response') == uuid && data
  })
}


/**
 * Create function
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
      `{${code}}`
    )
  }
  return new Function(...Object.keys(refs), arr.join(' '))(...Object.values(refs))
}



/**
 * Transform back to react object
 */
function transform(children, chunk) {
  if(!children) {
    return
  }
  if(!isArr(children)) {
    children = [children]
  }

  return children.map(({type, props}, key) => {
    var p = {}

    if(isArr(type)) {
      type = chunk[type[0]]
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isObj(v)) {
        if(i == 'children') {
          p.children = transform(v, chunk)
        }
        else {
          if(v.mouseevent) {
            p[i] = toFunc(v.name, {
              args: v.args,
              code: v.code,
              refs: {meta: chunk.meta, state: chunk.state}
            })
          }
        }
      }
      if(isArr(v)) {
        p.children = v.map((i) => {
          if(isObj(i)) {
            return transform(i, chunk)
          }
          return i
        })
      }
    }
    if(typeof type == 'function') {
      p.state = chunk.state
    }

    return runtime.jsx(type, p, key)
  })
}


export default function({body, scripts}, chunk) {
  const root = ReactDom.createRoot(body)

  event.update = function render(data) {
    document.title = data.meta.title

    if(data.content) {
      data.content = transform(data.content, chunk)[0]
    }
    root.render(chunk.provider(data))
  }

  return {
    render() {
      const url = new URL(scripts.bundle.src)

      const hash = url.searchParams.get('hash')
      const name = url.searchParams.get('name')

      httpState.get({
        init: true,
        path: hash.concat('?',
          (new URLSearchParams({name})).toString()
        )
      })
      .then(data => event.update(data))
    }
  }
}