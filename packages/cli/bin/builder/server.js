const {parse} = require('node:path')
const {createServer} = require('node:http')



function server(cb) {
  return createServer((req, res) => {
    const url = parse(req.url)

    /**
     * Check endpoint
     */
    req.is = function(name = null) {
      return url.name == name || url.base == name
    }

    /**
     * Set multiple headers 
     */
    res.headers = function(headers) {
      res.setHeaders(new Headers(headers))
    }

    /**
     * Accept event stream
     */
    req.isStream = function() {
      if(req.is('')) {
        res.headers({
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/event-stream',
        })

        return true
      }
    }
    res.headers({'Access-Control-Allow-Origin': '*'})


    cb(req, res)
  })
}


module.exports = function(builder, cb) {
  var file = builder.file
  var events = builder.events
  var resolve = builder.resolve
  var option = builder.config.option

  /**
   * Run development server and create bundle
   */
  const http = server(async function(req, res) {
    const data = await file.read(resolve.clidir('builder/development.js'))

    if(req.isStream()) {
      events.on('change', () => {
        res.write(`data: {changed: true}\n\n`)
      })
    }

    if(req.is('development')) {
      res.headers({
        'Content-Type':
        'application/javascript'
      })
      res.end(data)
    }
  })

  http.listen(option.port, cb)
}