/*
 * @vindo/static
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('fs')
const path = require('path')
const mime = require('mime-types')


exports.fs = fs
exports.path = path
exports.mime = mime

exports.serve = function serve(option = {}) {
  var root = process.cwd()

  var serve = option.path || null
  if(serve) {
    root = path.join(root, serve)
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
    const file = path.join(root, req.route.pathname)
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