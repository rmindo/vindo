
const es = require('esbuild')
const {
	path,
	read,
	exists,
	unlink,
	resolve,
	readdir,
	makedir,
	writeFile,
}
= require('./util')


/**
 * Get all codes from components
 * @param {object} opt 
 */
async function getCode(opt) {
	var files = await readdir(opt.components)
	var files = files.filter(file => {
		return /\.(tsx|jsx)$/.test(file.name)
	})
	
	var code = [
		`import client, {state} from '@vindo/react/client'`,
		`const chunk = {
			state: state
		}`
	]

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
 * Get imported files
 * @param {object} opt 
 * @param {string} data 
 */
async function getImports(data) {
	var imp = []
	var data = data.matchAll(/import\s(.*)\sfrom.*\/([a-zA-Z_-]+)('|")/g)

	for(var v of data) {
		if(/components\//.test(v[0])) {
			imp.push(`const ${v[1]} = ${v[2]}`)
		}
		else {
			imp.push(v[0])
		}
	}
	return imp
}


/**
 * Collect components and assemble before building
 * 
 * @param {object} opt option
 */
async function build(opt) {
	var data = await read(opt.entry)
	
	var code = await getCode(opt)
	var impo = await getImports(data)

	code = code.concat(
		impo,
		`chunk.body = function body() {
			return (
				${data.match(/<body.*>((.|\n)*)<\/body>/g)[0]}
			)
		}`,
		'client(document, chunk).render()'
	)

	await writeFile(opt.chunk, code.join('\n'), {flag: 'w'})
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
	opt.components = resolve.dirname(opt.entry, 'components')

	try {
		await build(opt)
		await bundle(opt)
	}
	catch(e) {
		console.log(e)
	}
}