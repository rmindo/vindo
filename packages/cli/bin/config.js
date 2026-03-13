const util = require('./util')
const option = require('./option')


const file = util.file
const object = util.object
const resolve = util.resolve
const parseArgs = util.parseArgs


/**
 * Exports
 */
module.exports = exports = Object.create({}, {
	args: {get: getArgs},
  option: {get: getOption},
})


var path = resolve.root('vindo.json')
if(!file.exists(path)) {
	throw Error(`vindo.json file does not exists.`)    
}
var vindo = file.get(path)


/**
 * To string
 */
function toStr(data) {
	return Buffer.from(JSON.stringify(data)).toString('base64').replace(/=/g, '')
}

/**
 * Get arguments
 */
function getArgs() {
	const args = process.argv

	const command = args[2]
	if(!option.commands.includes(command)) {
		throw new ReferenceError('You need to provide at least one command.')
	}

  const {values} = parseArgs({
    args: args.slice(3),
    allowPositionals: true,
    options: option.argsOptions,
  })

  return object.merge(values, {[command]: true, command})
}


/**
 * Get build option and arguments
 */
function getOption() {
	var opt = object.merge(option.buildOptions, vindo.buildOptions)
	var opt = object.merge(opt, getArgs())

	return {
		...opt,
		name: vindo.name,
		sass: option.sass,
		settings: option.settings,

		entry: resolve.root(opt.entry),
		chunk: resolve.root(opt.output, 'chunk.jsx'),
		template: resolve.clidir('builder', 'template.js'),
		components: resolve.dirname(opt.entry, 'components'),
		outfile: resolve.root(`${opt.output}/${opt.bundleName}.js`),
		devScript: `http://127.0.0.1:${opt.port}/development`,
	}
}


/**
 * Add bundle
 */
exports.add = function add(opt) {
  if(opt.package) {
		var pkg = resolve.current('node_modules', opt.package, 'vindo.json')
    if(!file.exists(pkg)) {
			return
		}
		
		var pkg = file.get(pkg)
    if(pkg) {
      exports.bundle(null, pkg.bundles)
    }
  }
}


/**
 * Add bundle metadata to vindo config
 */
exports.bundle = async function bundle(name, data) {
	if(!vindo.bundles) {
		vindo.bundles = {}
	}
	/**
	 * Add new bundle
	 */
	if(name) {
		vindo.bundles[name] = toStr(data)
	}
	/**
	 * Merge to existing bundles
	 */
	else {
		vindo.bundles = object.merge(vindo.bundles, data)
	}
	/**
	 * Update the config file
	 */
	await file.promises.writeFile(path, JSON.stringify(vindo, null, 2), {flag: 'w'})
	return data[0]
}