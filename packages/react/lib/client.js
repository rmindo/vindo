/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import ReactDom from 'react-dom/client'
import {request, HTTPRequest} from '@vindo/react/request'
import {isObj, isFunc, merge, transform} from '@vindo/react/util'


const event = {
  data: {
    state: {}
  },
  updating: false
}
const _http = HTTPRequest()
const _context = React.createContext({})


/**
 * Update DOM
 */
function update({path, type, ...data}, opts = {}) {
  const args = {
    type: type ?? 'update',
    path,
    data: merge(event.data.state, data)
  }
  request(args, opts).then((data) => event.render(data, type))
}


/**
 * Redirect without reloading the page
 */
export function redirect(href, text = null) {
  update({
    type: 'route',
    path: new URL(href, location.origin)
  })
  history.pushState({}, text, href)
}


/**
 * Use state
 */
export function useState(initialState = {}) {
  const ref = React.useRef({})
  const [state, setState] = React.useState(initialState)
  
  if(!isObj(initialState)) {
    throw Error('Custom state hook only allow object as parameter.')
  }
  
  merge(ref.current, state)
  
  return new Proxy({
    async set(state = {}) {
      event.updating = false

      /**
       * This allow multiple state arguments to be set
       */
      if(arguments.length > 1) {
        merge(...arguments)
      }

      if(isObj(state)) {
        setState(state)
      }

      if(isFunc(state)) {
        const dataState = state(ref.current)

        if(dataState) {
          if(dataState instanceof Promise) {
            setState(await dataState)
          }
          else {
            setState(dataState)
          }
        }
      }
    },
    /**
     * Send GET request to the server
     */
    get(data) {
      if(isObj(data)) {
        return _http.get({data})
      }
      if(isFunc(data)) {
        return _http.get({}).then(data)
      }
    },
    /**
     * Send POST request to the server
     */
    post(data) {
      if(isObj(data)) {
        return _http.post({data})
      }
      if(isFunc(data)) {
        return _http.post({}).then(data)
      }
    },
    /**
     * Re-render DOM with new global state
     */
    update(data = {}) {
      /**
       * Merge the value of its argument if the function (set) have more than 1 state as arguments
       */
      if(arguments.length > 1) {
        merge(...arguments)
      }
      event.update(data)
    },
  },
  {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      if(event.updating) {
        merge(ref.current, event.data.state)
      }
      return ref.current[key]
    }
  })
}

/**
 * Context
 */
export function useStore() {
  const store = useContext('store')
  
  function dispatch(data) {
    const args = {
      data,
      type: 'store',
    }
    request(args, {method: 'POST'}).then((data) => event.render(data))
  }
  
  const proto = {
    clear() {
      dispatch({action: 'clear'})
    },
    remove(name) {
      dispatch({action: 'remove', data: name})
    },
    dispatch(data) {
      dispatch({action: 'add', data})
    }
  }
  return merge(Object.create(proto), store)
}


/**
 * Context
 */
export function useContext(name = null) {
  const {meta, data, state, store} = React.useContext(_context)

  switch(name) {
    case 'store':
      return store
    case 'content':
      return data
    default:
      return {meta, state}
  }
}


/**
 * Render react dom to root
 * @param {object} document 
 * @param {object} chunk 
 */
export function render({head, body}, chunk) {
  var head = ReactDom.createRoot(head)
  var body = ReactDom.createRoot(body)

  /**
   * Proxy handler
   */
  function getter(target, key) {
    switch(key) {
      case 'set':
      case 'update':
      case 'render':
        return update
    }
    return target.data.state[key]
  }
    
  /**
   * Re-render DOM
   */
  event.update = function update(state) {
    merge(
      event.data.state,
      state
    )
    event.render(event.data)
  }
  
  /**
   * Render content
   */
  event.render = function render(args, type = null) {
    /**
     * Set data
     */
    event.data = args
    event.updating = true
    /**
     * State and metadata reference for mouse event functions
     */
    chunk.refs = {
      state: new Proxy(event, {
        get: getter
      }),
      meta: args.meta,
    }
    /**
     * For route request only
     */
    if(type == 'route') {
      head.render(chunk.head(args.meta))
    }
    /**
     * Set only for dynamic content coming from server
     */
    if(args.data && args.data.children) {
      args.data.children = transform(args.data.children, chunk)[0]
    }
    body.render(chunk.body(args))
  }

  /**
   * Update when back/forward button of browser is pressed
   */
  window.onpopstate = function onpopstate() {
    update({
      type: 'route',
      path: new URL(location.href)
    })
  }
  /**
   * Make sure the entire page has finished loading, including all dependent resources (images, scripts, CSS files, etc.).
   */
  window.onload = function onload() {
    _http.get({type: 'hydrate'}).then(data => event.render(data))
  }
}


/**
 * Component Holder
 */
export function View() {}


/**
 * Wrapper
 */
export function Provider({children, ...value}) {
  return React.createElement(_context, {value, name: 'tae'}, children)
}

/**
 * Link
 */
export function Link({href, text, disabled, children, ...props}) {
  if(!href) {
    throw new ReferenceError(`No href property found or no value provided on property href.`)
  }

  const onClick = (e) => {
    if(disabled || location.pathname == href) {
      return
    }
    e.preventDefault()
    redirect(href, text)
  }

  if(!children) {
    children = text
  }
  return React.createElement('a', {href, onClick, ...props}, children)
}


/**
 * Find current route
 */
export function Content(props) {
  const data = useContext('content')
  /**
   * From backend: View content from backend (src/http)
   */
  if(React.isValidElement(data.children)) {
    return data.children
  }

  /**
   * From frontend: View content (<View name"page-name" ...>) from react directory (src/react)
   */
  return React.Children.map(props.children, (child) => {
    if(!child.props.name) {
      throw new ReferenceError(`Props 'name' is required for View component.`)
    }
    if(data.props.name == child.props.name) {
      return child.props.component(data.props)
    }
  })
}


Link.back = function back(step = -1) {
  window.history.go(step)
}
Link.redirect = redirect