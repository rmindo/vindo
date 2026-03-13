
const es = require('esbuild')
const sass = require('sass')
const util = require('../util')
const config = require('../config')


module.exports = exports = Object.create(util, {
	config: {
		value: config
	}
})
const {file, string, resolve} = util


/**
 * Get basename
 * @param {string} file
 */
function getname(val) {
	return file.path.parse(val).name
}


/**
 * Get chunk
 * @param {string} dir 
 */
async function getChunk(dir) {
	var code = []
	var files = await file.readdir(dir, {recursive: true})

	for(var {name, parentPath} of files) {
		if(!/\.(js|tsx|jsx)$/.test(name)) {
			continue
		}

		var name = getname(name)
		if(name) {
			var _file = file.path.join(parentPath, name)

			if(name == 'index') {
				_file = parentPath
				name = getname(parentPath)
			}
			code.push(`import ${name} from '${_file}'`, `data.${name} = ${name}`)
		}
	}
	return code
}


/**
 * Get imported files
 * @param {object} opt 
 * @param {string} data 
 */
async function getImports(entry, data) {
	var imp = []
	var matches = data.matchAll(/import\s(.*)\sfrom.*('|"|\/)([a-zA-Z_-]+)('|")/g)

	for(var item of matches) {
		if(/(\.\/|)components\//.test(item[0])) {
			imp.push(`var ${item[1]} = ${item[3]}`)
		}
		else if(/(\.\/)/.test(item[0])) {
			imp.push(item[0].replace(/('|")(\.\/)/, `$1${resolve.dirname(entry)}/`))
		}
		else {
			imp.push(item[0])
		}
	}
	return imp
}


/**
 * Get all imports from components directory
 * @param {object} opt 
 */
async function getComponents(opt) {
	var data = []
	
	if(Array.isArray(opt.includes)) {
		for(var item of opt.includes) {
			const dir = file.path.resolve(process.cwd(), 'node_modules', item)
			if(!file.exists(dir)) {
				continue
			}
			data = data.concat(await getChunk(dir))
		}
	}

	return data.concat(await getChunk(opt.components))
}


/**
 * Collect components and assemble before building
 * 
 * @param {object} opt option
 */
async function startBuild(opt) {

	if(!file.exists(opt.entry)) {
		throw new Error(`Entry file not found. "${opt.entry}"`)
	}
	
	const data = file.read(opt.entry)
	const temp = file.read(opt.template)
	
	const impo = await getImports(opt.entry, data)
	const comp = await getComponents(opt)

	const code = string.replace(temp, {
		REACT_COMPONENTS: comp.join('\n'),
		IMPORTED_COMPONENTS: impo.join('\n'),
		HEAD_COMPONENT: data.match(/<head.*>((.|\n)*)<\/head>/g)[0],
		BODY_COMPONENT: data.match(/<body.*>((.|\n)*)<\/body>/g)[0]
	})

	await file.promises.writeFile(opt.chunk, code, {flag: 'w'})
}


/**
 * Create a bundle file
 * 
 * @param {object} opt option
 */
async function startBundle(opt) {

	if(!file.exists(opt.chunk)) {
		return
	}

	const build = await es.build({
		...opt.settings,
		minify: opt.minify,
		outfile: opt.outfile,
		entryPoints: [opt.chunk],
	})
	const meta = Object.keys(build.metafile.outputs)[0]

	/**
	 * Append bundle hash to vindo config
	 */
	const name = opt.bundleName
	const hash = await config.bundle(opt.name ?? name, [meta.match(/-(.*).js/)[1], name])
	/**
	 * Delete old bundle
	 */
	const files = file.readdir(resolve.root(opt.output))
	files.forEach((item) => {
		const matched = item.name.match(
			new RegExp(`^${name}-([A-Z0-9+]{8})\.js$`)
		)
		if(matched) {
			if(hash == matched[1]) {
				return
			}
			file.unlink(file.path.resolve(item.parentPath, item.name))
		}
	})

	if(file.exists(opt.chunk)) {
		file.unlink(opt.chunk)
	}
}


async function startCompile(opt) {
	if(!opt.compileSass) {
		return
	}
	const input = resolve.root(opt.compileSass.input)
	const output = resolve.root(opt.compileSass.output)

	/**
	 * Create output dir if not exists
	 */
	if(!file.exists(input)) {
		throw new Error(`No sass input directory found. "${input}"\n`)
	}
	
	/**
	 * Create output dir if not exists
	 */
	if(!file.exists(output)) {
		await file.makedir(output)
	}

	function scss(name) {
		return resolve.root(opt.compileSass.input, name)
	}


	const files = await file.readdir(input)
	for(var item of files) {
		
		if(item.isFile()) {
			const url = scss(item.name)
			
			if(file.exists(url)) {
				const css = sass.compile(url).css

				const out = resolve.root(
					output,
					item.name.replace(/\.scss/, '.css')
				)
				await file.promises.writeFile(out, css, {flag: 'w'})
			}
		}
	}
}


/**
 * 
 * @param {object} config 
 */
exports.build = async function build(opt) {
	/**
	 * Create build directory
	 */
	await file.makedir(resolve.root(opt.output))

	try {
		await startBuild(opt)
		await startBundle(opt)
		await startCompile(opt)
	}
	catch(e) {
		console.log(e)
	}
}