/*
 * @vindo/utility
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const path = require('path')
const string = require('./string')


module.exports = exports = {path}


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
  const abs = args.join('/')

  if(path.isAbsolute(abs)) {
    return abs
  }
  return path.join(path.dirname(require.main.path), ...args.filter(v => v))
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

  var base = args.at(-1)
  if(base) {
    if(path.isAbsolute(base)) {
      args = base.split('/')
  
      if(args.length > 0) {
        base = args.at(-1)
      }
    }
  
    const names = [
      base,
      base.concat('.js'),
      base.concat('.ts'),
      base.concat('.tsx'),
      base.concat('.jsx'),
    ]
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
  var src = 'src'
  var ext = '.html'
  
  var data = {}
  if(args.length > 1) {
    data = args.pop()
  }

  var args = args.reduce(
    (d, i) => {
      d.push(...i.split('/'))
      return d
    },
  [])

  /**
   * Only if you go one level higher directory
   */
  if(args[0] == '..') {
    src = null
  }

  var _path = [src].concat(args).filter(v => v)
  if(args.length > 1) {
    _path = _path.slice(0, -1)
  }
  const filename = args.at(-1).concat(ext)

  /**
   * Set default index if file not exist
   */
  if(exports.exists(..._path, filename)) {
    _path.push(filename)
  }
  else {
    _path.push('index'.concat(ext))
  }

  return string.replace(exports.read(..._path), data)
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
  const file = exports.join(...args)
  
  if(exports.isDir(...args)) {
    return
  }

  if(exports.exists(file)) {
    return fs.readFileSync(file, 'utf8')
  }
}


/**
 * Read file with promises (asynchronous)
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