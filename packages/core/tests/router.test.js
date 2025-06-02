const util = require('@vindo/utility')
const router = require('../lib/http/router')


const root = [
  'tests',
  'http'
]

const call = async (url, method = 'GET') => {
  const route = await router.route({url, root})
  
  try {
    const funcs = util.file.get(route.path)
    if(funcs) {
      route.method = method
      return await router.handle(route, funcs, [{}, {}, {}, {}])
    }
  }
  catch(e) {}

  return false
}


describe('Mapping the url to a file.', () => {
  
  test(`Root index`, async () => {
    const exist = await call('/')

    expect(exist).toBe(true)
  })


  test(`Function docs should be exported from root index.`, async () => {
    const exist = await call('/docs')

    expect(exist).toBe(true)
  })


  test(`Map basename /about to a file.`, async () => {
    const exist = await call('/about')

    expect(exist).toBe(true)
  })

})