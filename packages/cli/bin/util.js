const {styleText:color} = require('util')
const {file, events, string} = require('@vindo/utility')



module.exports = exports = Object.create(file, {
  string: {value: string},
  events: {value: events},
})

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
    return file.path.resolve(process.cwd(), ...args)
  },
  curr(...args) {
    return file.path.resolve(__dirname, ...args)
  },
  dirname(path, ...args) {
    if(!path) {
      return
    }
    return resolve.main(file.path.dirname(path), ...args)
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
 */
async function makedir(path) {
	try {
    await file.promises.mkdir(path)
	}
	catch(e) {}
}
/**
 * 
 */
async function unlink(path) {
	try {
    await file.promises.unlink(path)
	}
	catch(e) {}
}


exports.log = log
exports.use = use
exports.unlink = unlink
exports.makedir = makedir
exports.colors = colors
exports.resolve = resolve
