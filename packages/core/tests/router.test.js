const util = require('@vindo/utility')
const router = require('../lib/http/router')


const root = [
  'tests',
  'http'
]

const map = async (url, method = 'GET') => {
  const route = await router.route({url, root})
  route.method = method
  
  try {
    route.methods = util.file.get(route.path)
    if(route.methods) {
      return await router.handle(route, [{}, {}, {}, {}])
    }
  }
  catch(e) {}

  return false
}


// const call = async (route) => {
//   try {
//     route.methods = util.file.get(route.path)
//     if(route.methods) {
//       return await router.handle(route, [{}, {}, {}, {}])
//     }
//   }
//   catch(e) {}

//   return false
// }


const home = {url: '/', file: 'http/index.js'}
const docs = {url: '/docs', file: 'http/index.js'}
const about = {url: '/about', file: 'http/about.js'}
const auth = {url: '/auth', file: 'http/auth/index.js'}
const login = {url: '/auth/login', file: 'http/auth/login.js'}
const check = {url: '/auth/login/check', file: 'http/auth/login.js'}
const verify = {url: '/auth/login/verify', file: 'http/auth/login.js'}


describe('Mapping the url to a file.', () => {
  

  test(`Map "${home.url}" to a file "${home.file}".`, async () => {
    const exist = await map(home.url)
    expect(exist).toBe(true)
  })


  test(`Map "${docs.url}" to function named "docs" exported inside "${docs.file}".`, async () => {
    const exist = await map(docs.url)
    expect(exist).toBe(true)
  })


  test(`Map "${about.url}" to a file "${about.file}".`, async () => {
    const exist = await map(about.url)
    expect(exist).toBe(true)
  })


  test(`Map "${auth.url}" to a file "${auth.file}".`, async () => {
    const exist = await map(auth.url)
    expect(exist).toBe(true)
  })

  test(`Map "${login.url}" to a file "${login.file}".`, async () => {
    const exist = await map(login.url)
    expect(exist).toBe(true)
  })


  test(`Map "${check.url}" to function named "check" exported inside "${check.file}".`, async () => {
    const exist = await map(check.url)
    expect(exist).toBe(true)
  })


  test(`Map "${verify.url}" to function named "verify" from default function inside "${verify.url}".`, async () => {
    const exist = await map(verify.url)
    expect(exist).toBe(true)
  })

})
