/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


/**
 * Add padding from the end of string
 * @param {string} str 
 * @param {string} pad
 */
exports.padEnd = function padEnd(str, pad) {
  return str.padEnd(str.length + pad.length, pad)
}

/**
 * Add padding from the start of string
 * @param {string} str 
 * @param {string} pad
 */
exports.padStart = function padStart(str, pad) {
  return str.padStart(str.length + pad.length, pad)
}

/**
* Replace the {variable_name} with a value in a string
* 
* @string The string with {variable_name} you want to replace with value
* @data Object that matched the key and the variable in the string where you going to replace with new value
* 
* @param {string} string
* @param {object} data
*/
exports.replace = function replace(string, data = {}) {
  if(Object.keys(data).length == 0) {
    return string
  }

  function repl(v) {
    var value = data[v.match(/([a-z_]+)/g)]
    if(value) {
      return value
    }
    return ''
  }

  if(string) {
    var patt = string.match(/(\{[a-z_]+\})/g)
    if(patt) {
      return string.replace(new RegExp(patt.join('|'), 'g'), repl)
    }
  }
  return string
}


/**
 * Upper case first letter
 * @param {string} string
 */
exports.toUCFirst = function toUCFirst(string) {
  return string.charAt(0).toUpperCase().concat(string.slice(1))
}


/**
 * Convert camel case to kebab
 * @param {string} string 
 */
exports.toKebabCase = function toKebabCase(string) {
  const pat = /[A-Z]/g

  if(string.match(/-/)) {
    return string
  }

  return exports.toUCFirst(string.replace(pat, function(char) {
    return `-${char.toUpperCase()}`
  }))
}


/**
 * Convert text to camel case
 * @param {string} string 
 * @param {string} separator 
 */
exports.toCamelCase = function toCamelCase(string, separator = '-') {
  if(!string) {
    return
  }
  var str = string.split(separator)
  
  function map(item, index) {
    if(index == 0) {
      return item
    }
    return exports.toUCFirst(item)
  }
  return str.map(map).join('')
}