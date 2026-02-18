/*
 * @vindo/panel
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import panel from './app/pages/panel'


export const Panel = panel


export function serve(http) {
  http.stack.push(function(req, res, next, ctx) {
    req.root = ['src','theme','ruel','http']

    http.start(req, res)

    const route = req.route
    if(route.segments[0] == 'panel') {
      route.path = ctx.file.path.resolve(process.cwd(), 'node_modules/@vindo/panel/lib/app/routes.js')
    }
    next()
  })
}
