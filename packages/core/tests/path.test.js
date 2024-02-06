const util = require('@vindo/utility')
const router = require('../lib/http/router')


const root = [
  'tests',
  'http'
]

const map = async (url, method = 'GET') => {
  return await router.map({url, root, method})
}


async function call(route) {
  try {
    const funcs = util.file.get(route.path)
    if(funcs) {
      return await router.call(route, funcs, [])
    }
  }
  catch(e) {}

  return false
}



describe('Mapping the url to a file.', () => {
  
  const http = 'tests/http'
  const vers = `${http}/api/v1`
  const user = `${vers}/users/[uid:hex]`
  const post = `${user}/posts/[pid:num]`


  test(`It should be equal to ${http}`, async () => {
    const route = await map('/')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(http)
  })


  test(`Basename docs should be rerouted to ${http}`, async () => {
    const route = await map('/docs')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(http)
  })


  test(`It should be equal to ${http}/api`, async () => {
    const route = await map('/api')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(`${http}/api`)
  })


  test(`It should be equal to ${user}`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(user)
  })


  test(`It should be equal to ${user}/posts`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869/posts')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(`${user}/posts`)
  })


  test(`It should be equal to ${post}`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869/posts/1')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(`${post}`)
  })


  test(`Basename likes should be rerouted to ${post}`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869/posts/1/likes')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(post)
  })


  test(`Basename check should be rerouted to ${user}`, async () => {
    const route = await map('/api/v1/users/check')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(http+'/api/v1/users')
  })


  test(`It should be equal to ${user}/profile`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869/profile')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(`${user}/profile`)
  })


  test(`Basename photo should be rerouted to ${user}/profile`, async () => {
    const route = await map('/api/v1/users/bbec2a7c0c869/profile/photo')
    const exist = await call(route)

    expect(exist).toBe(true)
    expect(route.path).toBe(`${user}/profile`)
  })
})