/*
 * @vindo/static
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const fs = require('node:fs')
const path = require('node:path')
const mime = require('mime-types')
const {pipeline} = require('node:stream')


/**
 * Get extension type
 * @param {string} ext 
 */
exports.type = function type(ext) {
  return mime.lookup(ext)
}


/**
 * Serve static file
 * @param {string} directory 
 */
exports.serve = function serve(directory) {
  var dir = process.cwd()

  if(directory) {
    dir = path.resolve(dir, directory)
  }

  return function(req, res, next) {

    const mimeType = mime.lookup(req.extension)
    if(!mimeType) {
      return next()
    }

    const file = path.resolve(dir, `.${path.sep}${req.route.pathname}`)
    /**
     * Prevent directory traversal
     */
    if(file !== dir && !file.startsWith(dir + path.sep)) {
      return next()
    }

    res.create({
      contentType: mimeType
    })

    const stream = fs.createReadStream(file)

    /**
     * Handle premature client disconnection
     */
    const onClose = () => {
      if(!res.writableFinished) {
        stream.destroy()
      }
    }


    pipeline(stream, res, (e) => {
      res.removeListener('close', onClose)

      if(e) {
        /**
         * Response may already have started.
         */
        if(!res.headersSent && !res.destroyed) {
          next(e)
        }
        else if(!res.destroyed) {
          res.destroy(e)
        }
      }
    })

    res.once('close', onClose)
  }
}
