/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const path = require('path')
const object = require('./object')
const string = require('./string')


module.exports = exports = Object.create(fs, {
  path: {value: path}
})


/**
 * Get file extension
 * @param {string} name
 */
exports.ext = function ext(name) {
  if(name) {
    const ext = path.extname(name)
    if(ext) {
      return ext
    }
  }
}


/**
 * Get file
 * 
 * @param {string | string[]} args The path of the file
 */
exports.get = function get(...args) {
  return require(exports.join(...args))
}


/**
 * Join path
 * 
 * @param {string | string[]} args The path of the file
 */
exports.join = function join(...args) {
  if(Array.isArray(args[0])) {
    args = args[0]
  }

  /**
   * Return if path is absolute
   */
  {
    var abs = args.join(process.platform == 'win32' ? '\\' : '/')
    if(path.isAbsolute(abs)) {
      return abs
    }
  }

  /**
   * Make sure the path "dir/file" is separated into segments.
   */
  var args = args.reduce(
    (d, i) => {
      if(i) {
        d.push(...i.split('/'))
      }
      return d
    },
  [])

  var dir = require.main.path

  /**
   * Get current directory of the caller if the path is relative
   */
  if(args[0] && args[0].match(/\.$/)) {
    dir = path.dirname(exports.getCaller())
  }

  return path.join(dir, ...exports.alias(args))
}


/**
 * Replace alias with absolute path
 * @param {array} path File path
 */
exports.alias = function alias(path) {
  if(Array.isArray(path[0])) {
    path = path[0]
  }

  if(!path[0]) {
    return
  }

  var alias = path[0].match(/^@(?:(?![\/])(root|main))/)
  if(alias) {
    switch(alias[1]) {
      case 'root':
        path[0] = path[0].replace(alias[0], process.cwd())
      break
      case 'main':
        path[0] = path[0].replace(alias[0], require.main?.path)
      break
    }
  }

  return path
}


/**
 * Get the HTML content
 * 
 * @param {string | string[]} args The path of the file
 */
exports.html = function html(...args) {
  /**
   * Use last argument for string interpolation
   */
  var data = {}
  if(args.length > 1) {
    const last = args.pop()
    if(typeof last == 'object') {
      data = last
    }
  }
  /**
   * Add extension
   */
  var i = args.length-1
  if(i >= 0) {
    args[i] = args[i].concat('.html')
  }

  return string.replace(exports.read(args), data)
}


/**
 * Get file stats
 * 
 * @param  {string | string[]} args The path of the file
 */
exports.stats = function stats(...args) {
  try {
    return fs.lstatSync(exports.join(...args))
  }
  catch(e) {}
}


/**
 * Check if directory
 * 
 * @param  {string | string[]} args The path of the file
 */
exports.isDir = function isDir(...args) {
  const stats = exports.stats(...args)
  if(stats) {
    return stats.isDirectory()
  }
}


/**
 * Read file synchronously
 * 
 * @param {string | string[]} args The path of the file
 */
exports.read = function read(...args) {
  if(Array.isArray(args[0])) {
    args = args[0]
  }
  const file = exports.join(args)

  if(exports.isDir(file)) {
    return
  }
  if(exports.exists(file)) {
    return fs.readFileSync(file, 'utf8')
  }
}


/**
 * Parse the string from a file containing key/value
 * 
 * @exmaple
 * File contains key/value.
 *    API_KEY=zUpiKsaP2EyeP2KMg7GxWs==
 *    API_ENDPOINT=http://example.com/api/v1
 * 
 * @param {string | string[]} args The path of the file containing key and value format.
 */
exports.parse = function parse(...args) {
  const content = exports.read(...args)

  if(content) {
    const items = {}
    const data = content.split('\n')

    for(var value of data) {
      var item = value.match(/([0-9A-Z_\s]+)=(.*)/)
      if(item) {
        items[item[1].replace(/\s/g, '')] = item[2].replace(/\s/g, '')
      }
    }
    return items
  }
}


/**
 * Check if exists
 * 
 * @param {string | string[]} args The path of the file
 */
exports.exists = function exists(...args) {
  if(Array.isArray(args[0])) {
    args = args[0]
  }

  const exist = fs.existsSync(exports.join(...args))
  if(exist) {
    return true
  }
  /**
   * Exclude file with extension that's not exist
   */
  var base = args.at(-1)
  if(!base || base && base.match(/\./g)) {
    return false
  }
  /**
   * For development only with (ts-node)
   */
  var names = []
  if(!process[Symbol.for('ts-node.register.instance')]) {
    names = [
      base.concat('.js'),
      base.concat('.jsx')
    ]
  }
  else {
    names = [
      base.concat('.ts'),
      base.concat('.tsx')
    ]
  }

  const index = args.indexOf(base)
  for(var key of names) {
    const path = [...args]

    if(path[index]) {
      path[index] = key
    }
    if(fs.existsSync(exports.join(...path))) {
      return true
    }
  }
  return false
}


/**
 * Read directory
 * 
 * @param {string | string[]} args The path of the file
 */
exports.readdir = function readdir(...args) {
  var opts = {withFileTypes: true}

  if(object.is(args.at(-1))) {
    const lastArg = args.pop()

    if(typeof lastArg == 'object') {
      opts = object.assign(opts, lastArg)
    }
  }

  try {
    return fs.readdirSync(exports.join(...args), opts)
  }
  catch(e) {}
}


/**
 * Get current caller file path
 * 
 * @returns {string}
 */
exports.getCaller = function getCaller() {
  const ost = Error.prepareStackTrace

  try {
    var e = new Error()

    Error.prepareStackTrace = function(e, st) {
      return st
    }

    const cur = e.stack[0].getFileName()
    while(e.stack.length) {
      const cal = e.stack.shift().getFileName()
      if(cur !== cal) {
        return cal
      }
    }
  }
  catch(e) {}
  finally {
    Error.prepareStackTrace = ost
  }
}