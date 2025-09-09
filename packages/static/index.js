/*
 * @vindo/static
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const join = require('path').join
const mime = require('mime-types')


exports.type = function type(ext) {
  return mime.lookup(ext)
}

exports.serve = function serve(path) {
  var dir = process.cwd()

  if(path) {
    dir = join(dir, path)
  }
  
  return function(req, res, next) {
    const mimeType = mime.lookup(req.extension)

    if(!mimeType) {
      return next()
    }
    res.headers({
      'Content-Type': mimeType
    })
    /**
     * 
     */
    const file = join(dir, req.route.pathname)
    if(!fs.existsSync(file)) {
      return next()
    }
  
    const stream = fs.createReadStream(file)
    stream.on('data', (chunk) => {
      res.write(chunk)
    })
    stream.on('error', () => next())
    stream.on('close', () => res.end())
  }
}