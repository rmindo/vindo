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


const event = {}
const _http = HTTPRequest()
const _context = React.createContext({})


/**
 * Update DOM
 */
export function update({path, type, ...args}) {
  request({
    type: type ?? 'update',
    path,
    data: merge(event.data, args)
  })
  .then((data) => event.render(data))
}

/**
 * Use state
 */
export function useState(initialState = {}) {
  if(!isObj(initialState)) {
    throw Error('Custom state hook only allow object as parameter.')
  }

  const data = React.useRef({})
  const [state, setState] = React.useState(initialState)

  Object.assign(data.current, state)

  return new Proxy({
    get(args) {
      return _http.get(args)
    },
    post(args) {
      return _http.post(args)
    },
    async set(state) {
      
      if(isObj(state)) {
        setState(state)
      }

      if(isFunc(state)) {
        const dataState = state(data.current)

        if(dataState) {
          if(dataState instanceof Promise) {
            setState(await dataState)
          }
          else {
            setState(dataState)
          }
        }
      }
      return data.current
    },
  },
  {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      return data.current[key]
    }
  })
}

/**
 * Context
 */
export function useContext() {
  return React.useContext(_context)
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
export function Link({href, text, children}) {
  if(!href) {
    throw new ReferenceError(`Props 'href' is missing.`)
  }

  const onClick = (e) => {
    e.preventDefault()
    
    if(location.pathname == href) {
      return
    }
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
  const {data, meta} = useContext()

  /**
   * View content coming from backend component (src/http)
   */
  if(React.isValidElement(data.children)) {
    return React.createElement('main', props, data.children)
  }

  /**
   * View content coming from react directory (src/react)
   */
  return React.createElement('main', props, React.Children.map(props.children, (child) => {
    if(!child.props.name) {
      throw new ReferenceError(`Props 'name' is required for View component.`)
    }
    if(meta.name == child.props.name) {
      return child.props.component(data.props)
    }
  }))
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
   * Update when back/forward button is pressed
   */
  window.onpopstate = function() {
    update({
      type: 'route',
      path: new URL(location.href)
    })
  }

  /**
   * Render content
   */
  event.render = function render(args) {
    const {type, meta, data, state} = args
    /**
     * Set default state
     */
    event.data = state
    /**
     * Reference for mouse event functions
     */
    chunk.refs = {
      meta,
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
     * Set only for dynamic content coming from server
     */
    if(data.children) {
      data.children = transform(data.children, chunk)[0]
    }

    head.render(chunk.head(meta))
    body.render(chunk.body(args))
  }

  _http.get({type: 'render'}).then(data => event.render(data))
}


export default {render}