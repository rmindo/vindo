const util = require('@vindo/utility')
const router = require('../lib/http/router')



const map = async (url, method = 'GET') => {
  const route = await router.route({url, root: ['http']})

  try {
    route.method = method
    return await router.handle(route, [{response: {writableEnded: false}, request: {route}}, {}, {}, {}])
  }
  catch(e) {}

  return false
}


const routes = [
  {url: '/', text: 'Map "{url}" to index.js'},
  {url: '/page', text: 'Map "{url}" to index.js.'},
  {url: '/about', text: 'Map "{url}" to about.js.'},
  {url: '/auth', text: 'Map "{url}" to /auth/index.js.'},
  {url: '/page-1', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/auth/login', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/auth/login/check', text: 'Map "{url}" to exported function named "check".'},
  {url: '/api/v1/users/1', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/1/photos', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/1/photos/2', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/1/photos/2/comments/3', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/1/photos/2/comments/3/likes', text: 'Map "{url}" to function named "page" from default.'},
  {url: '/api/v1/users/f6d4c4e57fdca647203db00957002667', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/zjy7QcHURf3XnMcUznRdykwJbLV12RwbWz', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/api/v1/users/test_code_123-cid', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/sample-page', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/sample-page/page', text: 'Map "{url}" to exported function named "page".'},
  {url: '/sample-new-page/sample-new-slug-url', text: 'Map "{url}" to function named "GET" from default.'},
  {url: '/sample-new-page/sample-new-slug-url/page', text: 'Map "{url}" to exported function named "page".'},
  {url: '/sample-new-page/sample-new-slug-url/tags', text: 'Map "{url}" to function named "GET" from default.'},
  {url: '/sample-new-page/sample-new-slug-url/tags/page', text: 'Map "{url}" to exported function named "page".'},
  {url: '/f6d4c4e57fdca647203db00957002667', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/zjy7QcHURf3XnMcUznRdykwJbLV12RwbWz', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/category', text: 'Map "{url}" to exported function named "GET".'},
  {url: '/category/sample-slug-for-blog', text: 'Map "{url}" to function named "GET" from default.'},
]


describe('Mapping the url to a file.', () => {
  
  for(var item of routes) {
    const url = item.url
    const expected = item.expected ?? true
    
    test(util.string.replace(item.text, item), async () => {
      expect(await map(url)).toBe(expected)
    })
  }
})
