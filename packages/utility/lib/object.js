/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


module.exports = exports = Object.create(Object)


/**
 * Shortname
 */
exports.define = Object.defineProperty

/**
 * Check if key exist in an object
 * 
 * @param {array | string} needle List of keys you want to check
 * @param {object} haystack The object to check
 */
exports.has = function has(needle, haystack) {
  if(!needle || !haystack) {
    return
  }

  if(typeof haystack !== 'object') {
    throw TypeError('Second argument must be type of object.')
  }

  if(typeof needle !== 'string' && needle.length == undefined) {
    throw TypeError('First argument must be type of array or string.')
  }


  var list = Object.keys(haystack)
  if(Array.isArray(needle)) {
    if(needle.filter((val) => list.includes(val)).length == needle.length) {
      return true
    }
  }

  return list.includes(needle)
}

/**
 * Map object
 * @param {object} object
 * @param {function} cb
 */
exports.map = function map(object, cb) {
  var data = {}

  for(var key in object) {
    var item = cb({}, object[key], key)
    /**
     * Modified item
     */
    const keys = Object.keys(item)
    if(keys.length == 1) {
      data = Object.assign(data, item)
    }
    /**
     * Unmodified item
     */
    else {
      data[key] = object[key]
    }
  }
  return data
}

/**
 * Get property and value recursively
 * 
 * @param {object} data The object (haystack) where to search
 * @param {string} key The name (needle) you want to search
 */
exports.get = function get(data, key) {
  if(data) {
    if(data.hasOwnProperty(key)) {
      return data[key]
    }
    /**
     * Traverse object and check every property
     */
    if(typeof data == 'object') {
      for(var name in data) {
        if(data[name].hasOwnProperty(key)) {
          var value = data[name][key]
          if(value) {
            return value
          }
        }
        else {
          /**
           * Do it again if not found
           */
          exports.get(data[name], key)
        }
      }
    }
  }
}

/**
 * Merge two object
 * 
 * @param {object} one Target object where you what to merge
 * @param {object} two The object you want to merge
 */
exports.merge = function merge(one, two) {
  if(!one || !two) {
    return
  }

  Object.keys(two).forEach((key) => {
    Object.defineProperty(
      one,
      key,
      Object.getOwnPropertyDescriptor(two, key)
    )
  })
}

/**
 * Filter out unwanted data from an object
 * 
 * @param {object} object - The object you want to filter
 * @param {array} exclude - The list of key you want to filter out
 * @param {object} data - The object you want to merge or replace
 */
exports.filter = function filter(object, exclude = [], data = {}) {
  for(var name in object) {
    if(!exclude.includes(name)) {
      data[name] = object[name]
    }
  }
  return data
}