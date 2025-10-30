const path = require('path')
const file = require('fs/promises')
const {styleText:color} = require('util')


module.exports = exports = Object.create(file, {
  path: {value: path},
})

const evt = {}

/**
 * Events
 */
const events = {
  on(name, cb) {
    evt[name] = cb
  },
  emit(name, ...args) {
    if(evt[name]) {
      evt[name].call(...args)
    }
  }
}

/**
 * Set colors
 */
const colors = {
  set(name, text) {
    return color(name, text)
  },
  colorize(text) {
    var text = text.toString()
    /**
     * Console log color pattern
     */
    const  pattern = {
      ref: {color: 'cyan', pat: /(<.*>)/g, text: '$1'},
      string: {color: 'green', pat: /('.*')/g, text: '$1'},
      symbol: {color: 'green', pat: /(Symbol\(.*\))/g, text: '$1'},
      number: {color: 'yellow', pat: /:\s(-?\d+)/g, text: ': $1'},
      boolean: {color: 'yellow', pat: /(false|true)/g, text: '$1'},
      function: {color: 'cyan', pat: /\[(.*)\]/g, text: '[$1]'},
      undefined: {color: 'gray', pat: /(undefined)/g, text: '$1'},
    }

    for(var item of Object.values(pattern)) {
      text = text.replace(item.pat, color(item.color, item.text))
    }
    return text.trim()
  }
}

/**
 * Resolve path
 */
const resolve = {
  main(...args) {
    return path.resolve(process.cwd(), ...args)
  },
  curr(...args) {
    return path.resolve(__dirname, ...args)
  },
  dirname(file, ...args) {
    return resolve.main(path.dirname(file), ...args)
  },
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
 * Use module
 */
function use(name) {
  return require(resolve.main('node_modules', name))
}

/**
 * 
 * File system utilities
 * 
 */
async function copy(dest) {
  const src = resolve.curr(
    path.basename(dest)
  )
  return await file.cp(src, dest)
}
/**
 * 
 */
async function read(path) {
  return await file.readFile(path, 'utf-8')
}
/**
 * 
 */
async function makedir(path) {
	try {
    await file.mkdir(path)
	}
	catch(e) {}
}
/**
 * 
 */
async function unlink(path) {
	try {
    await file.unlink(path)
	}
	catch(e) {}
}
/**
 * 
 */
async function exists(path) {
  try {
    return await file.access(path, file.constants.F_OK)
  }
	catch(e) {}
}
/**
 * 
 */
async function readdir(path) {
  return await file.readdir(path, {recursive: true, withFileTypes: true})
}


exports.log = log
exports.use = use
exports.read = read
exports.copy = copy
exports.exists = exists
exports.unlink = unlink
exports.makedir = makedir
exports.readdir = readdir
exports.colors = colors
exports.events = events
exports.resolve = resolve
