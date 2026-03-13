const util = require('util')
const {file, events, string, object} = require('@vindo/utility')


/**
 * Set colors
 */
const colors = {
  set(name, text) {
    return util.styleText(name, text)
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
      text = text.replace(item.pat, util.styleText(item.color, item.text))
    }
    return text.trim()
  }
}

/**
 * Resolve path
 */
const resolve = {
  /**
   * Resolve either a root directory
   * of where a command executed or the current working directory.
   */
  root(...args) {
    var path = process.env.INIT_CWD
    if(!path) {
      path = process.cwd()
    }
    return file.path.resolve(path, ...args)
  },
  /**
   * Resolve files of this cli package.
   */
  clidir(...args) {
    return file.path.resolve(file.path.dirname(__dirname), ...args)
  },
  /**
   * Resolve file from current directory.
   */
  dirname(path, ...args) {
    if(!path) {
      return
    }
    return resolve.root(file.path.dirname(path), ...args)
  },
  /**
   * Resolve current working directory
   */
  current(...args) {
    return file.path.resolve(process.cwd(), ...args)
  },
}

/**
 * Log with colors
 */
function log(name, text) {
  if(name) {
    return console.log(util.styleText(name, text.toString().trim()))
  }
  return console.log(text)
}

/**
 * 
 */
file.makedir = async function makedir(path) {
	try {
    await file.promises.mkdir(path)
	}
	catch(e) {}
}

/**
 * 
 */
file.unlink = async function unlink(path) {
	try {
    await file.promises.unlink(path)
	}
	catch(e) {}
}


module.exports = exports = Object.create(util, {
  file: {value: file},
  string: {value: string},
  object: {value: object},
  events: {value: events},
})

exports.log = log
exports.colors = colors
exports.resolve = resolve
