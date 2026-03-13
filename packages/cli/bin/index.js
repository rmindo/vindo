#! /usr/bin/env node


const builder = require('./builder')
const server = require('./builder/server')

const kill = require('tree-kill')
const chokidar = require('chokidar')
const childProcess = require('node:child_process')


var child = null
var log = builder.log
var build = builder.build
var config = builder.config
var events = builder.events
var colors = builder.colors
var option = builder.config.option


/**
 * Set to global environment
 */
process.env.DEV_PORT = option.port
process.env.DEV_SERVER = option.devScript


/**
 * 
 */
async function watcher(dirs, cb) {
  try {
    if(!Array.isArray(dirs)) {
      throw TypeError('Expected a value of type `Array` but received a `String`.')
    }
    chokidar.watch(dirs, {
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
function execute(cmd) {
  var i = 0

  if(Array.isArray(cmd)) {
    cmd = cmd.join(' && ')
  }

  var sp = childProcess.exec(cmd, {
    env: process.env,
    cwd: process.cwd(),
  })
  log('green', `[vindo] Running ${cmd}`)

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
  log('green', `[vindo] File changed '${event.path}'`)
  log('green', `[vindo] Rebuilding...`)
  log('green', `[vindo] Restarting server...`)

  build(option)

  if(child) {
    kill(child.pid)
  }
  child = execute(option.execute)
}


/**
 * Start building and execute
 */
function start() {
  build(option)

  child = execute(option.execute)

  if(option.watch) {
    log('yellow', '[vindo] v0.0.1')
    log('yellow', `[vindo] Watching at ${option.watch}`)
    log('yellow', `[vindo] Building at ${option.output}`)

    watcher(option.watch, restart)
  }
}


/**
 * Command specific tasks
 */
switch(option.command) {
  case 'add':
    config.add(option)
    break

  case 'run':
    server(builder, start)
    break

  case 'build':
    build(option)
    break
}