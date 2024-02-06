const {useLib} = require('../lib/context')


const root = [
  'tests',
  'lib'
]


describe('Accessing the libraries and pass down the context and retrieve it back.', () => {

  ctx = {
    timezone: 'UTC+08:00',
    hash: '7d4508e1b5ec5e08aa13978c9d5e9cd60e84ff52'
  }

  test('Access the object from sub directory locale.', () => {
    const locale = useLib(root, 'locale', ctx)
    expect(locale.timezone()).toBe(ctx.timezone)
  })

  test('Should be able to get the hash code from auth file.', () => {
    const auth = useLib(root, 'auth', ctx)
    expect(auth.hash()).toBe(ctx.hash)
  })

  test('Access the function from lib directory using default index file.', () => {
    const add = useLib(root, 'add', ctx)
    expect(add(1, 2)).toBe(3)
  })
})