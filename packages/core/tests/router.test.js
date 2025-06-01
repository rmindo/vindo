const util = require('@vindo/utility')
const router = require('../lib/http/router')


const root = [
  'tests',
  'http'
]

const map = async (url, method = 'GET') => {
  const route = await router.route({url, root})
  route.method = method
  return route
}


const call = async (route) => {
  try {
    route.methods = util.file.get(route.path)
    if(route.methods) {
      return await router.handle(route, [{}, {}, {}, {}])
    }
  }
  catch(e) {}

  return false
}


describe('Mapping the url to a file.', () => {
  
  test(`Root index`, async () => {
    const route = await map('/')
    const exist = await call(route)

    expect(exist).toBe(true)
  })


  test(`Function docs should be exported from root index.`, async () => {
    const route = await map('/docs')
    const exist = await call(route)

    expect(exist).toBe(true)
  })


  test(`Map /about to a file.`, async () => {
    const route = await map('/about')
    const exist = await call(route)

    expect(exist).toBe(true)
  })


  // test(`/about/team should be exported from about.js`, async () => {
  //   const route = await map('/about/team')
  //   const exist = await call(route)

  //   expect(exist).toBe(true)
  // })


  test(`Url /auth `, async () => {
    const route = await map('/auth')
    const exist = await call(route)

    expect(exist).toBe(true)
  })

})