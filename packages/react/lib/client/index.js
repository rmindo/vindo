/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import ReactDom from 'react-dom/client'

import event from '@vindo/react/event'
import http from '@vindo/react/request'
import {merge, transform} from '@vindo/react/util'
import {getStore, getState, persistent, createContext} from '@vindo/react/storage'



const content = {}
const context = createContext({event})

/**
 * Shorthand
 */
const create = React.createElement
const isValid = React.isValidElement


/**
 * Update DOM
 * @param {object} params
 */
function update({path, type = 'update', ...data}) {
  const args = {
    type,
    path,
    data: merge(context.state, data)
  }
  http.get(args).then((data) => content.render(data, type))
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
 * @param {object} components 
 */
export function render({head, body}, components) {
  var head = ReactDom.createRoot(head)
  var body = ReactDom.createRoot(body)
    
  /**
   * Render content
   */
  content.render = function render(data) {
    context.add({
      state: data.state,
    })
    /**
     * Transform back to react component object
     */
    if(data.component) {
      const refs = {
        meta: data.meta,
        state: {...data.state, update}
      }
      data.component = transform(data.component, components, refs)[0]
    }
    
    head.render(components.head(data.meta))
    body.render(components.body(data))
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
    context.add(
      persistent(context).data()
    )
    http.get({type: 'hydrate'}).then(data => content.render(data))
  }
}


/**
 * Component Holder
 */
export function View() {}


/**
 * Context provider
 * @param {object} props
 */
export function Provider({meta, children, component}) {
  context.add({
    meta,
    component
  })
  return React.createElement(React.Fragment, {children})
}


/**
 * Find current route
 * @param {object} props
 */
export function Content({children, ...props}) {
  /**
   * From backend: View content from backend (src/http)
   */
  if(isValid(context.component)) {
    return create('div', props, context.component)
  }
  
  /**
   * From frontend: View content (<View path="/page-name" ...>) from react directory (src/react)
   */
  return create('div', props, React.Children.map(children, ({props}) => {
    if(!props.path) {
      throw new ReferenceError(`Property 'path' is required for View component.`)
    }

    if(props.path == context.meta.path) {
      return create(props.component, context.data)
    }
  }))
}


/**
 * Link
 * @param {object} props
 */
export function Link({href, data, text, disabled, children, ...props}) {
  if(!href) {
    throw new ReferenceError(`No href property found or no value provided on property href.`)
  }

  return create('a', {
    ...props,
    href,
    onClick(e) {
      e.preventDefault()

      if(!disabled) {
        Link.navigate(href, data)
      }
    }
  }, text ?? children)
}

/**
 * Navigate back to previous page
 * @param {number} step
 */
Link.back = function back(step = -1) {
  window.history.go(step)
}

/**
 * History state
 */
Link.state = function state() {
  return window.history.state
}

/**
 * Redirect to other page
 * @param {string} href
 */
Link.reload = function reload() {
  window.location.reload()
}

/**
 * Redirect to other page
 * @param {string} href
 */
Link.redirect = function redirect(href) {
  window.location.href = href
}

/**
 * Navigate without reloading the page
 * @param {string} href 
 * @param {string} data
 */
Link.navigate = function navigate(href, data = {}) {
  update({
    type: 'route',
    path: new URL(href, window.location.origin)
  })
  window.history.pushState(data, null, href)
}