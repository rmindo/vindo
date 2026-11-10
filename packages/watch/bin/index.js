#! /usr/bin/env node


const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const syncReadline = require('readline')
const asyncReadline = require('readline/promises')


var history = []
var source = null
var destination = null

const cwd = process.cwd()

/**
 * Input history
 */
const file = path.join(__dirname, '.history')
if(fs.existsSync(file)) {
  history = fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter(line => line.trim())
}


/**
 * Copy directories source to destination
 * @param {string} source 
 * @param {array} destination 
 */
function copy(source, destination) {
  const sourceDirs = []

  for(var src of source.split(/\s/)) {
    const fromSource = path.resolve(cwd, src)
    
    destination.forEach((dest) => {
      const toDestination = path.resolve(dest, src)

      fs.rmSync(toDestination, {recursive: true, force: true})
      fs.cpSync(fromSource, toDestination, {recursive: true})
    })

    sourceDirs.push(fromSource)
  }

  return sourceDirs
}


/**
 * Watch on changes
 * @param {array} source 
 * @param {array} destination 
 */
function watch(source, destination) {
  chokidar.watch(source, {
    persistent: true
  })
  .on('change', (path) => {
    const changedFile = path.replace(cwd, '')


    const now = new Date()
    const datetime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
    })
    console.log(
      datetime.format(now).concat(': ', changedFile)
    )

    destination.forEach((dest) => {
      fs.copyFileSync(path, path.replace(cwd, dest))
    })
  })
}

/**
 * CLI command
 */
function command() {
  syncReadline.emitKeypressEvents(process.stdin)

  process.stdin.setRawMode(true)
  process.stdin.resume()


  process.stdin.on('keypress', (str, key) => {
    if(source) {
      if(key.name === 'r') {
        copy(source, destination)
        console.log('[] Successfully updated destination folder.')
      }
    }

    if(key && key.ctrl && key.name === 'c') {
      process.stdin.setRawMode(false)
      process.exit(0)
    }
  })
}


/**
 * Start question
 */
async function startQuestion() {
  const ask = asyncReadline.createInterface({
    history,
    terminal: true,
    historySize: 50,
    input: process.stdin,
    output: process.stdout,
  })

  ask.on('history', (data) => {
    fs.writeFileSync(file, data.join('\n'), 'utf8')
  })


  dest = await ask.question('Destination: ')
  source = await ask.question('Source: ')

  destination = dest.split(/\s/)
  if(source) {
    ask.close()
  }
  const dirs = copy(source, destination)
  
  watch(dirs, destination)
  command()

  console.log(`\n[] Watching changes on directories: ${source}.\n`)
}

startQuestion()