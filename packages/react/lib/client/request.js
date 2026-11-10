/*
 * @vindo/react
 * Copyright(c) 2025 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import {isObj, isArr} from '@vindo/react/util'


const requestTypes = [
  'store',
  'fetch',
  'route',
  'update',
  'hydrate',
  'generic',
]


/**
 * Get name
 * @param {string} pathname 
 */
function name(pathname) {
  const name = pathname?.split('/').at(-1)
  if(name) {
    return name
  }
}


/**
 * Get pagename
 * @param {string} type
 * @param {object} path
 */
function pagename(type, path) {
  var base
  switch(type) {
    case 'route':
      base = name(path.pathname)
      break
    default:
      base = name(location.pathname)
  }
  return base ?? 'root'
}


/**
 * Arguments for generic request
 * @param {array} args
 */
function genericArgs([path, data]) {
  return {
    data,
    type: 'generic',
    path: new URL(path, location.origin)
  }
}


/**
 * State request
 */
export function request({data, path, type, ...args}) {
  if(!requestTypes.includes(type)) {
    throw new ReferenceError(`Invalid request type.`)
  }
  
  if(!path) {
    path = new URL(location.href)
  }

  const option = {
    method: 'GET',
    credentials: 'include',
    ...args,
    headers: Object.assign({...args.headers}, {
      'X-State-Request': btoa(
        JSON.stringify({type, name: pagename(type, path)})
      ),
    }),
  }

  return fetch(path, option).then((res) => res.json())
}


/**
 * Form data
 * @param {object} data 
 */
function formData(data) {
  const form = new FormData()

  for(let i in data) {
    const item = data[i]

    if(isObj(item)) {
      form.append(i, JSON.stringify(item))
    }
    else {
      form.append(i, item)
    }
  }
  return form
}


/**
 * Create parameters
 * @param {object} args 
 */
function setQueries(args) {
  const data = args.data

  for(var k in data) {
    if(isArr(data[k])) {
      for(var i of data[k]) {
        args.path.searchParams.append(`${k}[]`, i)
      }
    }
    else if(isObj(data[k])) {
      for(var i in data[k]) {
        if(data[k][i]) {
          args.path.searchParams.append(`${k}[${i}]`, data[k][i])    
        }
      }
    }
    else {
      args.path.searchParams.append(k, data[k])
    }
  }

  return args
}


/**
 * Create body request
 * @param {object} data 
 */
function setPayload(data) {
  if(data.data.file) {
    data.body = formData(data.data)
  }
  else {
    data.headers = {
      'Content-Type': 'application/json'
    }
    data.body = JSON.stringify(data.data)
  }
  return data
}


/**
 * GET request
 * @param {object} data 
 */
export function get(data = {}) {
  if(!data.path) {
    data.path = new URL(location.href)
  }

  if(data.length) {
    data = genericArgs(data)
  }
  if(data.data) {
    data = setQueries(data)
  }

  return request({type: 'fetch', ...data, method: 'GET'})
}


/**
 * POST request
 * @param {object} data 
 */
export function post(data = {}) {
  if(!data.path) {
    data.path = new URL(location.href)
  }

  if(data.length) {
    data = genericArgs(data)
  }
  if(data.data) {
    data = setPayload(data)
  }

  return request({type: 'fetch', ...data, method: 'POST'})
}


/**
 * HTTP Request
 */
export default {get, post}