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
 * Use state
 */
export function useState(initialState = {}) {
  if(!isObj(initialState)) {
    throw Error('Custom state hook only allow object as parameter.')
  }

  const ref = React.useRef({})
  const [state, setState] = React.useState(initialState)
  
  merge(ref.current, state)
  
  return new Proxy({
    async set(state = {}) {
      event.updating = false

      /**
       * Merge the value of its argument if the function (set) have more than 1 state as arguments
       */
      if(arguments.length > 1) {
        merge(state, ...arguments)
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
        merge(data, ...arguments)
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
      return {data, name: meta.name}
    default:
      return {meta, state}
  }
}


/**
 * Wrapper
 */
export function Provider({children, ...value}) {
  return React.createElement(_context, {value}, children)
}

/**
 * Link
 */
export function Link({href, text, disabled, children}) {
  if(!href) {
    throw new ReferenceError(`Props 'href' is missing.`)
  }

  const onClick = (e) => {
    if(disabled || location.pathname == href) {
      return
    }
    e.preventDefault()
    
    update({
      type: 'route',
      path: new URL(href, location.origin)
    })
    history.pushState({}, text, href)
  }

  if(!children) {
    children = text
  }
  return React.createElement('a', {href, onClick}, children)
}


/**
 * Component Holder
 */
export function View() {}


/**
 * Find current route
 */
export function Content(props) {
  const {data, name} = useContext('content')
  /**
   * View content coming from backend component (src/http)
   */
  if(React.isValidElement(data.children)) {
    return data.children
  }

  /**
   * View content coming from react directory (src/react)
   */
  return React.Children.map(props.children, (child) => {
    if(!child.props.name) {
      throw new ReferenceError(`Props 'name' is required for View component.`)
    }
    if(name == child.props.name) {
      return child.props.component(data.props)
    }
  })
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
    /**
     * Updating content
     */
    event.updating = true
    /**
     * Reference for mouse event functions
     */
    chunk.refs = {
      meta: args.meta,
      state: new Proxy(event, {
        get(target, key) {
          switch(key) {
            case 'set':
            case 'update':
            case 'render':
              return update
          }
          return target.data[key]
        }
      })
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
    if(args.data.children) {
      args.data.children = transform(args.data.children, chunk)[0]
    }
    body.render(chunk.body(args))
  }

  /**
   * Update when back/forward button is pressed
   */
  window.onpopstate = function onpopstate() {
    update({
      type: 'route',
      path: new URL(location.href)
    })
  }

  _http.get({type: 'hydrate'}).then(data => event.render(data))
}


export default {render}