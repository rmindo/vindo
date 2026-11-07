/*
 * @vindo/react
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


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
 * Create function
 */
export function toFunc(name, {code, args = [], refs}) {
  var arr = ['return', 'function', name]

  if(args) {
    arr.push(
      `(${args.length ? args.join(',') : ''})`
    )
  }
  if(typeof code == 'string') {
    arr.push(`{${code}}`)
  }
  return new Function(...Object.keys(refs), arr.join(' '))(...Object.values(refs))
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

  return children.map(({type, props}) => {
    var p = {}

    if(!props) {
      return
    }

    /**
     * Component function
     */
    if(isFunc(type)) {
      if(/^default_1/.test(type.name)) {
        throw new ReferenceError(`Component function requires a name. Currently have a default name of '${type.name}'.`)
      }
      type = [type.name]
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isArr(v)) {
        p.children = v.map((v) => {
          if(isObj(v)) {
            return reducer(v)[0]
          }
          return v
        })
      }
      if(isObj(v)) {
        if(i == 'style') {
          p.style = v
        }
        if(i == 'children') {
          p.children = reducer(v)
        }
      }
      if(isFunc(v)) {
        var f = v.toString()
        var m = [
          ...f.matchAll(/\((.*)\)(\s{|\s=>\s{|{)((.|\n)*)\}/g)
        ][0]
        p[i] = {
          name: i,
          mouseevent: true,
          code: m[3].trim(),
          args: m[1].split(',').filter(v => v),
          refs: ['state','meta']
        }
      }
    }

    return {type, props: p}
  })
}


/**
 * Transform back to react object
 */
export function transform(children, components, refs) {
  if(!children) {
    return
  }
  if(!isArr(children)) {
    children = [children]
  }

  return children.map(({type, props}, key) => {
    var p = {}

    if(!props) {
      return
    }

    if(isArr(type)) {
      const key = type[0]
      type = components[key]
      if(!type) {
        throw TypeError(`Cannot read property '${key}'.`)
      }
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }

      if(isObj(v)) {
        if(i == 'style') {
          p.style = v
        }
        if(i == 'children') {
          p.children = transform(v, components, refs)
        }
        if(v.mouseevent) {
          p[i] = toFunc(v.name, {
            refs,
            args: v.args,
            code: v.code,
          })
        }
      }

      if(isArr(v)) {
        p.children = v.map((i, k) => {
          if(isObj(i)) {
            const child = transform(i, components, refs)
            if(child[0]) {
              return {...child[0], key: k}
            }
          }
          return i
        })
      }
    }

    return runtime[Array.isArray(p.children) ? 'jsxs' : 'jsx'](type, p, key)
  })
}