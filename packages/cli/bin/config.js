const util = require('./util')
const config = util.use('@vindo/core/lib/config')


module.exports = {
	/**
	 * Development script
	 */
	get devScript() {
		return `http://127.0.0.1:${this.option.port}/development`
	},

	/**
	 * Vindo config
	 */
	get vindo() {

		return config({
			buildOption: {
				port: 2001,
				minify: true,
				watch: [
					'./src'
				],
				output: './public'
			}
		})
	},

	/**
	 * Build Options
	 */
	get option() {
		const opt = this.vindo.buildOption
		const args = this.argv()

		return Object.assign(opt, {
			...args,
			settings: {
				bundle: true,
				format: 'esm',
				logLevel: 'error',
				allowOverwrite: true,
			},
			output: typeof args.output == 'string' ? args.output : opt.output,
		})
	},

	/**
	 * Get args
	 */
	argv() {
		const args = {}
		const argv = process.argv

		for(var i in argv) {
			const pat = /^([a-z-]+)=/

			if(i < 2) {
				continue
			}
			var arg = argv[i].split(pat, 3).filter(String)

			if(arg) {
				args[arg[0].substring(2)] = arg[1] ? arg[1] : true
			}
		}
		return args
	}
}