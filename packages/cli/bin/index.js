#! /usr/bin/env node



const {file} = require('@vindo/utility')
const {exec, spawn} = require('node:child_process')
const {watch:watcher} = require('chokidar')
const {styleText:color} = require('node:util')


var evt = {}
var cwd = process.cwd()
var child = null


const build = require('./build')
const server = require('./server')
const {option, pattern, devScript} = require('./config')


/**
 * Set to global environment
 */
process.env.DEV_SERVER = devScript
process.env.DEV_SERVER_PORT = option.port


/**
 * Add event
 */
function on(name, cb) {
  evt[name] = cb
}

/**
 * Call the event
 */
function emit(name, ...args) {
  if(evt[name]) {
    evt[name].call(...args)
  }
}

/**
 * Log with colors
 */
function log(name, text) {
  if(name) {
    return console.log(color(name, text.toString().trim()))
  }
  return console.log(text)
}

/**
 * 
 */
function setColors(text) {
  var text = text.toString()

  for(var item of Object.values(pattern)) {
    text = text.replace(item.pat, color(item.color, item.text))
  }
  return text.trim()
}


/**
 * 
 */
async function watch(dirs, cb) {
  try {
    if(!Array.isArray(dirs)) {
      throw TypeError('Expected a value of type `Array` but received a `String`.')
    }
    watcher(dirs, {
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
    cwd,
    env: process.env
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
      emit('change')
    }
    console.log(setColors(data))
  })
  
  /**
   * Error data
   */
  sp.stdio[2].on('data', (data) => {
    var text = data.toString().split(/\n/)

    for(var i in text) {
      if(i == 0) {
        text[0] = color('red', text[0])
      }
      text[i] = text[i].replace(/(at.*)/, color('gray', '$1'))
      text[i] = text[i].replace(/:\s('.*')/, color('green', ': $1'))
      text[i] = text[i].replace(/\s(-?\d+)/, color('yellow', ' $1'))
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

  if(option.output) {
    build(option)
  }
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
const http = server((req, res) => {
  if(req.isStream()) {
    on('change', () => {
      res.write(`data: {changed: true}\n\n`)
    })
  }

  if(req.is('reload')) {
    res.headers({
      'Content-Type':
      'application/javascript'
    })
    res.end(file.read(__dirname.concat('/reload.js')))
  }
})



http.listen(option.port, function() {
  child = execute()

  if(option.output) {
    build(option)
  }

  if(option.watch) {
    log('yellow', '[vindo] v0.0.1')
    log('yellow', `[vindo] Watching at ${option.watch}`)
    log('yellow', `[vindo] Building at ${option.output}`)

    watch(option.watch, restart)
  }
})