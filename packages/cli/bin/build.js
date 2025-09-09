
const fs = require('fs')
const path = require('node:path')
const {file} = require('@vindo/utility')
const {writeFile} = require('node:fs/promises')
const {build:esbuild} = require('esbuild')


const option = {
	bundle: true,
	format: 'esm',
	logLevel: 'error',
}


/**
 * 
 */
function resolve(...args) {
	return path.resolve(process.cwd(), ...args)
}


      
/**
 * 
 */
function dirname(...args) {
	return path.resolve(__dirname, ...args)
}


/**
 * 
 */
function resolveAlias(buildPath) {
	return {
		name: 'resolve-alias',
		setup(build) {
			build.onResolve({filter: /.*/}, ({path}) => {
				const build_ = /@build/

				if(path.match(/^node_modules\//)) {
					var absPath = resolve(path, 'index.js')

					if(!file.exists(absPath)) {
						absPath = resolve(path.concat('.js'))
					}
					return {path: absPath}
				}
				
				if(path.match(build_)) {
					return {
						path: resolve(path.replace(build_, buildPath).concat('.js'))
					}
				}
				return null
			})
		}
	}
}

/**
 * 
 * @param {*} file 
 * @param {*} conf 
 */
async function createMap(conf) {
	var imp = ''

	const out = resolve(conf.output, 'chunk.js')
	const dir = resolve(conf.entries)

	
	if(file.isDir(dir)) {
		const dir_ = conf.entries.split('/')

		const files = file.readdir(dir)
		if(files.length == 0) {
			return
		}
			
		for(var item of files) {
			const name = path.parse(item.name).name
			if(name) {
				imp += `import ${name}_ from '${dir_.slice(1).join('/')}/${name}'\n`
				imp += `export const ${name} = ${name}_\n`
			}
		}
	}
	
	await writeFile(out, imp, {flag: 'w'})
	await esbuild({
		...option,
		outfile: out,
		packages: 'external',
		entryPoints: [
			out
		],
		allowOverwrite: true
	})

	return out
}


/**
 * 
 * @param {string} outbundle
 * @param {object} conf
 */
async function bundle(outbundle, conf) {
	option.minify = conf.minify ?? false

	const out = await createMap(conf)
	await esbuild({
		...option,
		outfile: resolve(conf.output, outbundle),
		entryPoints: [
			dirname(outbundle)
		],
		plugins: [resolveAlias(conf.output)]
	})

	if(file.exists(out)) fs.unlinkSync(out)
}


/**
 * 
 * @param {object} conf 
 */
module.exports = async function build(conf) {
	try {
		await bundle('bundle.js', conf)
	}
	catch(e) {
		console.log(e)
	}
}