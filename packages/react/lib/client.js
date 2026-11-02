/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import ReactDom from 'react-dom/client'
import event from '@vindo/react/event'
import {request} from '@vindo/react/request'
import {transform, merge} from '@vindo/react/util'
import {getStore, getState, createContext} from '@vindo/react/store'



const content = {}
const context = createContext({event})

/**
 * Shorthand
 */
const create = React.createElement
const isValid = React.isValidElement


/**
 * Back to previous page
 */
function back(step = -1) {
  window.history.go(step)
}


/**
 * Update DOM
 */
function update({path, type = 'update', ...data}) {
  const args = {
    type,
    path,
    data: merge(context.state, data)
  }
  request(args).then((data) => content.render(data, type))
}


/**
 * Redirect without reloading the page
 */
function redirect(href, text = null) {
  update({
    type: 'route',
    path: new URL(href, location.origin)
  })
  window.history.pushState({}, text, href)
}

/**
 * Use store
 * @param {object} initialState
 */
export function useStore(initialState = {}) {
  return getStore(initialState, context)
}


/**
 * Use state
 * @param {object} initialState
 */
export function useState(initialState = {}) {
  return getState(initialState, context)
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
        return update
    }
    return target[key]
  }
    
  /**
   * Re-render DOM
   */
  content.update = function update(state) {
    merge(
      context.state,
      state
    )
    content.render({state: context.state})
  }
  
  /**
   * Render content
   */
  content.render = function render(data, type = null) {
    /**
     * Set data
     */
    context.add({
      state: data.state,
      updating: true,
    })
    /**
     * State and metadata reference for mouse event functions
     */
    chunk.refs = {
      state: new Proxy(data.state, {
        get: getter
      }),
      meta: data.meta,
    }
    /**
     * For route request only
     */
    if(type == 'route') {
      head.render(chunk.head(data.meta))
    }
    /**
     * Set only for dynamic content coming from server
     */
    if(data.component) {
      data.component = transform(data.component, chunk)[0]
    }
    body.render(chunk.body(data))
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
    request({type: 'hydrate'}).then(data => content.render(data))
  }
}


/**
 * Component Holder
 */
export function View() {}


/**
 * Context provider
 * @param {*} props
 */
export function Provider({meta, children, component}) {
  context.add({
    meta,
    component,
  })
  return React.createElement(React.Fragment, {children})
}


/**
 * Find current route
 */
export function Content({children}) {
  /**
   * From backend: View content from backend (src/http)
   */
  if(isValid(context.component)) {
    return context.component
  }
  /**
   * From frontend: View content (<View path="/page-name" ...>) from react directory (src/react)
   */
  return React.Children.map(children, ({props}) => {
    if(!props.path) {
      throw new ReferenceError(`Property 'path' is required for View component.`)
    }

    if(props.path == context.meta.route.path) {
      return create(props.component, context.data)
    }
  })
}


/**
 * Link
 */
export function Link({href, text, disabled, children, ...props}) {
  if(!href) {
    throw new ReferenceError(`No href property found or no value provided on property href.`)
  }

  const onClick = (e) => {
    e.preventDefault()

    if(!disabled) {
      redirect(href, text)
    }
  }

  if(!children) {
    children = text
  }
  return create('a', {href, onClick, ...props}, children)
}

/**
 * Navigation
 */
Link.back = back
Link.redirect = redirect