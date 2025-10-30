#! /usr/bin/env node


const util = require('./util')
const build = require('./build')
const server = require('./server')
const config = require('./config')

const {watch} = require('chokidar')
const {exec, spawn} = require('node:child_process')


const {log, read, events, colors, resolve} = util


var child = null
var option = config.option

/**
 * Set to global environment
 */
process.env.DEV_SERVER = config.devScript
process.env.DEV_SERVER_PORT = config.option.port


/**
 * 
 */
async function watcher(dirs, cb) {
  try {
    if(!Array.isArray(dirs)) {
      throw TypeError('Expected a value of type `Array` but received a `String`.')
    }
    watch(dirs, {
      // ignored: (path, stats) => stats?.isFile() && !path.endsWith('.js'), // only watch js files
      persistent: true
    })
    .on('change', (path) => cb({path}))
  }
  catch(e) {
    throw e
  }
}


/**
 * 
 */
function execute() {
  var i = 0
  var sp = exec(option.execute, {
    env: process.env,
    cwd: process.cwd(),
  })
  log('green', `[vindo] Running ${option.execute}`)

  /**
   * Emit change event to reload client
   */
  sp.stdio[1].on('data', (data) => {
    i += 1
    /**
     * Emit only on first log from server,
     * It means the server runs successfully.
     */
    if(i == 1) {
      events.emit('change')
    }
    console.log(colors.colorize(data))
  })
  
  /**
   * Error data
   */
  sp.stdio[2].on('data', (data) => {
    var text = data.toString().split(/\n/)

    for(var i in text) {
      if(i == 0) {
        text[0] = colors.set('red', text[0])
      }
      text[i] = text[i].replace(/(at.*)/, colors.set('gray', '$1'))
      text[i] = text[i].replace(/:\s('.*')/, colors.set('green', ': $1'))
      text[i] = text[i].replace(/\s(-?\d+)/, colors.set('yellow', ' $1'))
    }
    log(null, text.join('\r\n'))
  })
  return sp
}


/**
 * Restart server and rebuild
 */
function restart(event) {
  log('gray', `[vindo] File changed '${event.path}'`)
  log('green', `[vindo] Rebuilding...`)
  log('green', `[vindo] Restarting server...`)

  build(option)

  if(child) {
    if(process.platform === 'win32') {
      spawn('taskkill', ['/pid', child.pid, '/f', '/t'])
    }
    else {
      child.kill('SIGINT')
    }
  }
  child = execute()
}


/**
 * Create server
 */
const http = server(async (req, res) => {
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
    res.end(await read(resolve.curr('development.js')))
  }
})



http.listen(option.port, function() {
  child = execute()

  build(option)

  if(option.watch) {
    log('yellow', '[vindo] v0.0.1')
    log('yellow', `[vindo] Watching at ${option.watch}`)
    log('yellow', `[vindo] Building at ${option.output}`)

    watcher(option.watch, restart)
  }
})