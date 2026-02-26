/*
 * @vindo/sass
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const path = require('path')
const sass = require('sass')


/**
 * Serve and compile
 */
exports.compiler = function(_opt = {}) {
  const cwd = process.cwd()
  
  const opt = {
    dir: 'public',
    sass: {
      style: 'compressed'
    }
  }

  Object.assign(opt, _opt)

  /**
   * Middleware
   */
  return function(req, res, next) {
    const url = path.resolve(cwd, opt.dir).concat(req.url)

    if(req.extension == '.css') {
      res.headers({
        'Content-Type': 'text/css'
      })

      return res.print(
        sass.compile(url.replace(/.css$/, '.scss'), opt.sass).css
      )
    }
    next()
  }
}