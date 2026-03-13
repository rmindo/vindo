/*
 * @vindo/panel
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import path from 'path'
import media from '@vindo/static'


const cwd = process.cwd()


export function serve(app:any) {
  const name = 'panel'
  const panel = 'node_modules/@vindo/panel/'


  app.use(function(req:any, res:any, next:Function, {vindo}:any) {
    req.root = vindo.root

    if(req.startsWith(name)) {
      req.root = path.resolve(cwd, panel, ...req.root).split('/')
    }
    
    app.start(req, res)
    next()
  })

  app.use(media.serve(panel.concat('public')))
}