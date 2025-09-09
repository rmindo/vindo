const {file} = require('@vindo/utility')


const port = 2001
const args = {}
const argv = process.argv


const vindo = file.read(file.join(process.cwd(), 'vindo.json'))


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


module.exports = {
	/**
	 * Development script
	 */
	get devScript() {
		return `http://127.0.0.1:${this.option.port}/browser.js`
	},

	/**
	 * Build Options
	 */
	get option() {
		const {buildOption} = JSON.parse(vindo)
		
		return Object.assign({port}, buildOption, {
			...args,
			output: typeof args.output == 'string' ? args.output : buildOption.output,
		})
	},

	/**
	 * Console log color pattern
	 */
	pattern: {
		ref: {color: 'cyan', pat: /(<.*>)/g, text: '$1'},
		symbol: {color: 'green', pat: /(Symbol\(.*\))/g, text: '$1'},
		undefined: {color: 'gray', pat: /(undefined)/g, text: '$1'},
		function: {color: 'cyan', pat: /\[(.*)\]/g, text: '[$1]'},
		boolean: {color: 'yellow', pat: /(false|true)/g, text: '$1'},
		string: {color: 'green', pat: /('.*')/g, text: '$1'},
		number: {color: 'yellow', pat: /:\s(-?\d+)/g, text: ': $1'},
	}
}