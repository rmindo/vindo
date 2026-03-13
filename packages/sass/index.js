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
   * Resolve css url to scss path
   */
  function toScss(url) {
    return path.resolve(cwd, opt.dir, url).replace(/.css$/, '.scss')
  }

  /**
   * Middleware
   */
  return function(req, res, next, {file}) {
    const url = toScss(req.url.slice(1))

    if(req.extension == '.css') {
      res.headers({
        'Content-Type': 'text/css'
      })
    
      if(file.exists(url)) {
        return res.print(sass.compile(url, opt.sass).css)
      }
    }
    next()
  }
}