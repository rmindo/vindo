/*
 * @vindo/cookie
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'

/**
 * Get cookie
 */
exports.cookie = function(req, res, next) {
  req.cookies = {}
  const cookie = req.headers.cookie

  if(cookie) {
    cookie.split(';').forEach((item) => {
      const [name, value] = item.trim().split(/=/).map(decodeURIComponent)
      if(name) {
        req.cookies[name] = value
      }
    })
  }

  res.cookie = function cookie(data = {}) {
    var cookies = []

    for(var name in data) {
      var item = data[name]

      if(!item.value) {
        throw new ReferenceError('Cookie value is not defined.')
      }

      var cookie = `${name}=${item.value};`
      for(var i in item) {
        if(i == 'value') {
          continue
        }
        cookie += ` ${i}=${item[i]};`
      }
      cookies.push(cookie)
    }
    res.setHeader('Set-Cookie', cookies)
  }
  
  return next()
}