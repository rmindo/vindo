/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


/**
 * Split url
 * @param url
 */
exports.split = function split(url) {
  if(url) {
    return url.split('/').filter(v => v)
  }
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
  var url = url.split('?')
  
  var query = {}
  if(url[1]) {
    const data = url[1].split('&')

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
  }
  return {url: url[0], query}
}