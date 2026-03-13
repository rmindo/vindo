/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const {parse:get, extname:ext} = require('node:path')


/**
 * Split url
 * @param {string} url
 */
function split(url) {
  if(url) {
    return url.split('/').filter(v => v)
  }
}

/**
 * Get path type
 * @param {string} val
 */
function getType(val) {
  if(!isNaN(val)) {
    return 'num'
  }
  if(val.match(/^([0-9a-f]{16,})$/)) {
    return 'hex'
  }
  if(val.match(/^([^-]*-){3,}([^-]+)$/)) {
    return 'slug'
  }

  const char = val.match(/^([a-zA-Z0-9-=_]+)$/)
  if(char) {
    if(char[0]) {
      var str = char[0]

      /**
       * All characters are alphabet letters in a string
       */
      if(str.match(/^([a-zA-Z]+)$/)) {
        return 'alpha'
      }
      /**
       * Mixed alphanumeric in a string
       */
      if(str.match(/^(?![a-z-]*$)([a-zA-Z0-9]+)$/)) {
        return 'alnum'
      }
    }
    return 'char'
  }
}


/**
 * Set query
 * @param {object} data 
 */
exports.setQuery = function setQuery(data) {
  let p = []
  for(let i in data) {
    p.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]))
  }
  return p.join('&')
}


/**
 * URL Parser
 * @param {string} url
 */
exports.parse = function parse(url) {
  var [path, query] = url.split('?')
  
  var query = exports.parseQuery(query)
  var segments = split(path)
  var data = {
    path,
    query,
    args: [],
    segments,
    base: segments[0],
    pathname: path,
    basename: segments.at(-1),
    extension: undefined,
  }

  if(data.basename) {
    data.name = get(data.basename).name
    data.extension = ext(data.basename)
  }

  for(var key in segments) {
    var val = segments[key]
    var type = getType(val)
    if(type) {
      data.args.push({key: parseInt(key), type, value: type == 'num' ? parseInt(val) : val})
    }
  }
 
  return data
}


/**
 * Parse query
 * @param {string} url
 */
exports.parseQuery = function parseQuery(str) {
  const query = {}

  if(!str) {
    return query
  }
  const data = str.split('&')

  for(let item of data) {
    var [key, value] = item.split('=')

    if(!key | !value) {
      continue
    }
    
    var value = value.replace(/<|>/g, '')
    var value = value.replace(/\+/g, '%20')

    var key = decodeURIComponent(key)
    var value = decodeURIComponent(value)

    if(!isNaN(value)) {
      value = value % 1 === 0 ? parseInt(value) : parseFloat(value)
    }
    value = value === 'true' ? true : value
    value = value === 'false' ? false : value


    const arr = key.match(/(\w+)\[\]$/)
    const obj = key.match(/(\w+)\[(\w+)\]$/)
    /**
     * Handle the object key/value in the query
     */
    if(obj) {
      const key = obj[2]
      const name = obj[1]

      if(!key && !name) {
        continue
      }
      if(!query[name]) {
        query[name] = {}
      }
      if(typeof query[name] == 'object') {
        query[name][key] = value
      }
    }
    /**
     * Handle the array in the query
     */
    else if(arr) {
      const name = arr[1]
      if(!query[name]) {
        query[name] = []
      }
      if(Array.isArray(query[name])) {
        query[name].push(value)
      }
    }
    else {
      query[key] = value
    }
  }

  return query
}