
const es = require('esbuild')
const {
	path,
	read,
	exists,
	string,
	unlink,
	resolve,
	readdir,
	makedir,
	promises,
}
= require('./util')



/**
 * Collect components and assemble before building
 * 
 * @param {object} opt option
 */
async function build(opt) {
	const data = read(opt.entry)
	const temp = read(opt.template)
	
	const impo = await getImports(data)
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
	if(exists(opt.chunk)) {
		await es.build({
			...opt.settings,
			minify: opt.minify,
			outfile: opt.bundle,
			entryPoints: [opt.chunk],
		})
		unlink(opt.chunk)
	}
}

/**
 * Get imported files
 * @param {object} opt 
 * @param {string} data 
 */
async function getImports(data) {
	var imp = []
	var matches = data.matchAll(/import\s(.*)\sfrom.*('|"|\/)([a-zA-Z_-]+)('|")/g)

	for(var item of matches) {
		if(/(\.\/|)components\//.test(item[0])) {
			imp.push(`var ${item[1]} = ${item[3]}`)
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
	var files = await readdir(opt.components)
	var files = files.filter(file => {
		return /\.(tsx|jsx)$/.test(file.name)
	})
	
	var code = []

	for(var file of files) {
		const name = path.parse(file.name).name
		if(name) {
			code.push(
				`import ${name} from '${path.join(file.parentPath, name)}'`,
				`chunk.${name} = ${name}`
			)
		}
	}
	return code
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