
const es = require('esbuild')
const {
	path,
	read,
	exists,
	string,
	unlink,
	makedir,
	resolve,
	readdir,
	promises,
}
= require('./util')


/**
 * Get basename
 * @param {string} file
 */
function getname(file) {
	return path.parse(file).name
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
 * Get all codes from components
 * @param {object} opt 
 */
async function getComponents(opt) {
	var files = await readdir(opt.components, {recursive: true})
	var files = files.filter(file => {
		return /\.(tsx|jsx)$/.test(file.name)
	})
	
	var code = []

	for(var {name, parentPath} of files) {
		var name = getname(name)
		if(name) {
			var file = path.join(parentPath, name)

			if(name == 'index') {
				file = parentPath
				name = getname(parentPath)
			}
			code.push(`import ${name} from '${file}'`, `chunk.${name} = ${name}`)
		}
	}
	return code
}


/**
 * Collect components and assemble before building
 * 
 * @param {object} opt option
 */
async function build(opt) {
	const data = read(opt.entry)
	const temp = read(opt.template)
	
	const impo = await getImports(opt.entry, data)
	const comp = await getComponents(opt)

	const code = string.replace(temp, {
		CHUNK_IMPORTS: comp.join('\n'),
		ENTRY_IMPORTS: impo.join('\n'),
		HEAD_COMPONENT: data.match(/<head.*>((.|\n)*)<\/head>/g)[0],
		BODY_COMPONENT: data.match(/<Provider.*>((.|\n)*)<\/Provider>/g)[0]
	})

	await promises.writeFile(opt.chunk, code, {flag: 'w'})
}


/**
 * Create a bundle file
 * 
 * @param {object} opt option
 */
async function bundle(opt) {
	if(!exists(opt.chunk)) {
		return
	}
	
	const {metafile} = await es.build({
		...opt.settings,
		metafile: true,
		minify: opt.minify,
		outfile: opt.bundle,
		entryPoints: [opt.chunk],
		entryNames: '[name]-[hash]'
	})

	const file = Object.keys(metafile.outputs)[0]
	const data = {
		file,
		hash: file.match(/-(.*).js/)[1],
		bundle: file.match(/.*(\/.*)$/)[1]
	}

	/**
	 * Delete old bundle
	 */
	const manifest = resolve.main(opt.output, 'manifest.json')
	if(exists(manifest)) {
		const files = readdir(resolve.main(opt.output))

		files.forEach((file) => {
			const matched = file.name.match(/^bundle-([A-Z0-9+]{8})\.js$/)
			if(matched) {
				if(data.hash == matched[1]) {
					return
				}
				unlink(path.resolve(file.parentPath, file.name))
			}
		})
	}

	await promises.writeFile(manifest, JSON.stringify(data), {flag: 'w'})
	unlink(opt.chunk)
}


/**
 * 
 * @param {object} config 
 */
module.exports = async function(opt) {
	/**
	 * Create build directory
	 */
	await makedir(resolve.main(opt.output))

	opt.entry = resolve.main(opt.entry)
	opt.chunk = resolve.main(opt.output, 'chunk.jsx')
	opt.bundle = resolve.main(opt.output, 'bundle.js')
	opt.template = resolve.dirname(__filename, 'template.js')
	opt.components = resolve.dirname(opt.entry, 'components')

	try {
		await build(opt)
		await bundle(opt)
	}
	catch(e) {
		console.log(e)
	}
}