/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const {parse:get, extname:ext} = require('node:path')


/**
 * Split url
 * @param url
 */
function split(url) {
  if(url) {
    return url.split('/').filter(v => v)
  }
}



function parseQuery(string) {
  const query = {}

  if(!string) {
    return query
  }
  const data = string.split('&')

  for(let item of data) {
    var [key, value] = item.split('=')

    var key = decodeURIComponent(key)
    var value = decodeURIComponent(value)

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


/**
 * Set query
 * @param data 
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
 * @param url
 */
exports.parse = function parse(url) {
  var [path, query] = url.split('?')
  
  var query = parseQuery(query)
  var segments = split(path)
  var data = {
    path,
    query,
    args: {},
    segments,
    pathname: path,
    basename: segments.at(-1),
    extension: undefined,
  }

  if(data.basename) {
    data.name = get(data.basename).name
    data.extension = ext(data.basename)
  }

  for(var val of segments) {
    if(val.match(/^([\d]+)$/)) {
      data.args.num = parseInt(val)
    }
    if(val.match(/^([0-9a-f]{16,})$/)) {
      data.args.hex = val
    }
    if(val.match(/^([^-]*-){2,}([^-]+)$/)) {
      data.args.slug = val
    }
  }

  return data
}