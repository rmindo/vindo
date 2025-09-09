const {parse} = require('node:path')
const {createServer} = require('node:http')


module.exports = function(cb) {

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