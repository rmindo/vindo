const core = require('@vindo/core')
const {serve} = require('@vindo/static')
const {server} = require('@vindo/react')

const app = core.start()

app.use(serve('public'))
app.use(server())

app.run(({env}) => {
  console.log(`Development server is running on port ${env.PORT}`)
})