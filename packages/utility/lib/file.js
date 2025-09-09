/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const path = require('path')
const string = require('./string')


module.exports = exports = Object.create(path)


/**
 * Reuse path
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
    dir = exports.getCaller()
  }
  return path.join(path.dirname(dir), ...args)
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
   * Allow searching file without extension
   * and support extensions such as ts, tsx and jsx.
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

  if(args.length > 1) {
    const lastArg = args.at(-1)

    if(typeof lastArg == 'object') {
      opts = Object.assign(opts, lastArg)
    }
  }

  try {
    return fs.readdirSync(exports.join(...args), opts)
  }
  catch(e) {}
}


/**
 * Get the HTML content
 * 
 * @param {string | string[]} args The path of the file
 */
exports.html = function html(...args) {
  /**
   * Reserve data for string interpolation
   */
  var data = {}
  if(args.length > 1) {
    const last = args.pop()
    if(typeof last == 'object') {
      data = last
    }
  }
  return string.replace(exports.read(args, '.html'), data)
}


/**
 * Make relative path
 * @param {*} path File path
 * @param {string} ext File extension
 * @returns 
 */
exports.relative = function relative(path, ext) {
  if(Array.isArray(path[0])) {
    path = path[0]
  }
  /**
   * Split forward slashed into segments
   */
  path = path.reduce(
    (d, i) => {
      if(i) {
        d.push(...i.split('/'))
      }
      return d
    },
  [])
  const name = path.at(-1)

  /**
   * Set single dot for current directory lookup
   */
  path[path.indexOf(name)] = ext ? name.concat(ext) : name

  if(path[0] && path[0].match(/^([a-z]+)$/)) {
    path = ['.'].concat(path)
  }

  return path
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
  var ext

  if(args.length > 1) {
    ext = args.pop()
  }

  if(exports.isDir(...args)) {
    return
  }

  const file = exports.join(...exports.relative(args, ext))
  if(exports.exists(file)) {
    return fs.readFileSync(file, 'utf8')
  }
}


/**
 * Read file with promises
 * 
 * @param {string | string[]} args The path of the file
 */
exports.readAsync = async function readAsync(...args) {
  const file = exports.join(...args)

  if(fs.existsSync(file)) {
    return await fs.promises.readFile(file, {encoding: 'utf8'})
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