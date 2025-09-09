const {context} = require('../lib/context')


const conf = {
  include: {
    auth: 'lib/auth'
  }
}
function cb() {
  return {
    google: {
      library: () => true
    }
  }
}


describe('Accessing the libraries', () => {

  test('Should be able to get the function.', async () => {
    var ctx = await context(conf, cb)
    expect(ctx.lib.exported()).toBe(true)
  })

  
  test('Should be able to get injected library.', async () => {
    var ctx = await context(conf, cb)
    expect(await ctx.google.library()).toBe(true)
  })
  

  test('Should be able to get the context from a function.', async () => {
    var ctx = await context(conf, cb)
    var ctx = ctx.lib.context()
    expect(ctx.google.library()).toBe(true)
  })


  test('Should be able to resolve the promise function.', async () => {
    var ctx = await context(conf, cb)
    var log = await ctx.lib.log.async()
    expect(log.resolve()).toBe(true)
  })


  test('Should be able to get the hash code from auth file.', async () => {
    var ctx = await context(conf, cb)
    expect(ctx.auth.hash()).toBe('0bec2a7c0c8696a2e70a312e081d291e')
  })


  test('Should be able to get the hash code from default lib file.', async () => {
    var ctx = await context(conf, cb)
    expect(ctx.lib.auth.hash()).toBe('0bec2a7c0c8696a2e70a312e081d291e')
  })


  test('Should be able to get the hash code through function id from default lib file.', async () => {
    var ctx = await context(conf, cb)
    expect(ctx.lib.id()).toBe('0bec2a7c0c8696a2e70a312e081d291e')
  })


  test('Should be able to get the function from a deep recursive directory.', async () => {
    var ctx = await context(conf, cb)
    var the = await ctx.lib.dig.down.to.the.deepest.level.of.the.directory({greetings: 'Hello'})
    expect(the.greetings()).toBe('Hello')
  })
})