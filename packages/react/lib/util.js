/*
 * @vindo/react
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import runtime from 'react/jsx-runtime'


const assign = Object.assign
const isArray = Array.isArray


/**
 * Create a shallow copy of the object
 * @param {object} obj
 */
export function copy(obj) {
  if(isStr(obj)) {
    throw new TypeError('The expected argument must be an object.')
  }
  return {...obj}
}

export function merge(origin, ...obj) {
  return assign({}, assign(origin, ...obj))
}
export function isArr(arg) {
  return isArray(arg) && arg.constructor === Array
}
export function isMore(val) {
  return isObj(val) || val == undefined ? 'jsx' : 'jsxs'
}
export function isNum(val) {
  return val && typeof val === 'number' && {}.toString.call(val) === '[object Number]'
}
export function isStr(val) {
  return val && typeof val === 'string' && {}.toString.call(val) === '[object String]'
}
export function isFunc(val) {
  return val && typeof val === 'function' && {}.toString.call(val) === '[object Function]'
}
export function isObj(val) {
  return val && typeof val === 'object' && val.constructor === Object && Object.prototype === Object.getPrototypeOf(val)
}


/**
 * Convert object to hash
 * @param {object} obj 
 */
export function toHash(obj) {
  return to16CharHash(JSON.stringify(obj))
}


/**
 * Create 16 character hash
 * @param {string} str
 */
export function to16CharHash(str) {
  var h1 = 0xdeadbeef
  var h2 = 0x41c6ce57

  for(var i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')

  return hex1 + hex2
}


/**
 * Reduce object to necessary props
 * @param {array|object} children 
 */
export function reducer(children) {
  if(!children) {
    return []
  }
  if(!isArr(children)) {
    children = [children]
  }

  return children.map((child, key) => {
    if(isFunc(child.type)) {
      if(/^default_1/.test(child.type.name)) {
        throw new ReferenceError(`Each component function must be named exactly the same as its file.`)
      }
      return React.createElement('div', {key, id: child.type.name})
    }

    if(child.props?.children) {
      return React.cloneElement(child, {key, ...child.props}, reducer(child.props.children))
    }
    return child
  })
}


function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}


/**
 * Transform back to react object
 */
export function transformHTML(children, components) {
  
  return Array.from(children, (child, key) => {
    const length = child.children.length


    const attributes = Object.fromEntries(
      Array.from(child.attributes, attr => {
        return [attr.name, attr.value]
      })
    )
    delete attributes.selected


    if(child.children) {
      if(!['INPUT','OPTION','TEXTAREA'].includes(child.tagName)) {
        if(length == 0) {
          attributes.children = child.textContent
        }
        else {
          attributes.children = transformHTML(child.children, components)
        }
      }
    }
    
    if(components[child.id]) {
      return runtime.jsx(components[child.id], attributes, key)
    }


    if(attributes.style) {
      const style = attributes.style.split(';').map(item => {
        const str = item.split(':')
        
        return [
          toCamelCase(str[0].trim()),
          str[1]?.trim()
        ]
      })
      attributes.style = Object.fromEntries(style.filter(([_, value]) => value !== undefined))
    }

    return runtime[(length > 1) ? 'jsxs' : 'jsx'](child.localName, attributes, key)
  })
}