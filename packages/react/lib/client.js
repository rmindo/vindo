/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import ReactDom from 'react-dom/client'
import {request, HTTPState} from '@vindo/react/request'
import {merge, transform} from '@vindo/react/util'


const event = {}
const http = HTTPState()
const context_ = React.createContext({})


/**
 * Update DOM
 */
Object.defineProperty(http, 'set', {
  value: function set({path, ...args}) {
    request({
      path,
      data: merge(http.data, args)
    })
    .then((data) => event.update(data))
  },
  writable: false
})

/**
 * Http state request
 */
export const state = new Proxy(http, {
  get(target, key) {
    if(target[key]) {
      return target[key]
    }
    return target.data[key]
  }
})

/**
 * Component Holder
 */
export function View() {}

/**
 * Context
 */
export function context() {
  return React.useContext(context_)
}

/**
 * Wrapper
 */
export function Provider({children, ...value}) {
  return React.createElement(context_, {value}, children)
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

    state.set({
      path: new URL(href, location.origin),
      __reload: true
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
  const {data, meta} = context()

  /**
   * View content coming from backend component (src/http)
   */
  if(React.isValidElement(data.content)) {
    return React.createElement('main', props, data.content)
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


export function render({head, body}, chunk) {
  var head = ReactDom.createRoot(head)
  var body = ReactDom.createRoot(body)
  

  event.update = function update(args) {
    const meta = args.meta
    /**
     * Set default state
     */
    state.data = args.state
    /**
     * Reference for mouse event functions
     */
    chunk.refs = {state, meta}
    /**
     * Set only for dynamic content coming from server
     */
    if(args.data.content) {
      args.data.content = transform(args.data.content, chunk)[0]
    }

    head.render(chunk.head(meta))
    body.render(chunk.body(args))
  }

  state.get({__initialize: true}).then(data => event.update(data))
}


export default {render}