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
import {isFunc, transformHTML} from '@vindo/react/util'
import {getStore, getState, persistent, createContext} from '@vindo/react/storage'



const content = {}
const context = createContext({event})
const persist = persistent(context)

/**
 * Shorthand
 */
const create = React.createElement



/**
 * Convert back to space separated words
 * @param {string} str 
 * @returns 
 */
function strip(str) {
  return str
    .split('-')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}


/**
 * Create a template to store the HTML string and return as node
 * @param {} data
 */
function toNode(data) {
  const temp = document.createElement('template')
  if(data) {
    temp.innerHTML = data
  }
  return temp.content.children
}


/**
 * Get main content of the page
 * @param {object} children 
 */
function getChildren(children) {
  for(var child of children) {
    if(child.tagName == 'MAIN') return child.children
  }
}


/**
 * Transform to nested component tree object
 * @param {string} path 
 * @param {object} children 
 * @param {object} components
 */
function transform(path, children, components) {
  return create(View, {
    path,
    component: transformHTML(children, components)
  })
}


/**
 * Update DOM
 * @param {object} params
 */
function update({path, type = 'update', ...data}) {
  const args = {
    data,
    type,
    path,
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
  return getState(initialState, context, content.render)
}


/**
 * Render react dom to root
 * @param {object} document 
 * @param {object} components 
 */
export function render({head, body}, components) {
  var headRoot = ReactDom.createRoot(head)
  var bodyRoot = ReactDom.createRoot(body)
    

  /**
   * Render content
   */
  content.render = function render(data) {
    /**
     * Transform back to react component object
     */
    if(data.children) {
      data.children = transform(data.meta.path, toNode(data.children), components)
    }
    if(data.meta.hydrate) {
      data.children = transform(data.meta.path, getChildren(body.children), components)
    }

    headRoot.render(components.head(data.meta))
    bodyRoot.render(components.body(data))
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
    const data = document.getElementById('hydrate')
    /**
     * Persistent data from history state and local storage
     */
    context.add(window.history.state)
    context.add(persist.data())

    content.render(JSON.parse(data.textContent))
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
export function Provider({children}) {
  return React.createElement(React.Fragment, {children})
}


/**
 * Find current route
 * @param {object} props
 */
export function Content({children, meta, ...props}) {
  /**
   * Render content
   */
  return create('main', props, React.Children.map(children, ({props}) => {
    if(!props.path) {
      throw new ReferenceError(`Property 'path' is required for View component.`)
    }
    
    if(props.path == meta.path) {
      if(isFunc(props.component)) {
        return create(props.component, context.data)
      }
      return props.component
    }
  }))
}


/**
 * Link
 * @param {object} props
 */
export function Link({path, data, text, skip = false, disabled, children, ...props}) {
  if(!path) {
    throw new ReferenceError(`No path property found or no value provided on property path.`)
  }

  return create('a', {
    ...props,
    href: path,
    onClick(e) {
      e.preventDefault()

      if(!disabled) {
        if(skip) {
          Link.skip(path, data)
        }
        else {
          Link.navigate(path, data)
        }
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
 * Redirect to other page
 * @param {string} href
 */
Link.reload = function reload() {
  window.location.reload()
}

/**
 * Push data to history state
 * @param {string} href
 * @param {object} data
 */
Link.push = function push(href, data = {}) {
  window.history.pushState(data, null, href)
}

/**
 * Redirect to other page
 * @param {string} href
 */
Link.redirect = function redirect(href) {
  window.location.href = href
}

/**
 * Skip to new location without reloading the backend
 * @param {string} href 
 * @param {string} data
 */
Link.skip = function skip(href, data = {}) {
  Link.push(href, data)

  const path = href.split(/\//)
  const name = path.at(-1)

  context.add(data)
  context.add({
    meta: {
      name,
      path: href,
      base: path[1],
      title: strip(name)
    }
  })
  content.render({meta: context.meta})
}

/**
 * Navigate without reloading the page
 * @param {string} href 
 * @param {string} data
 */
Link.navigate = function navigate(href, data = {}) {
  Link.push(href, data)
  
  update({
    type: 'route',
    path: new URL(href, window.location.origin)
  })
  context.add(data)
}