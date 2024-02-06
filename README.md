A simple, fast, scalable, file-based routing web framework for NodeJS.

## Features
  * Middleware
  * Flexible file-based routing
  * Clean and easy access of utilities and context
  * Dependency injections

## Installation
```
npm install @vindo/core
```
Or
```
yarn add @vindo/core
```

## Configuration
Vindo had a few configurations that can be defined in a file vindo.json in the project directory.
```js
{
  "port": "8080",
  // Arbitrary configuration
  "exert": {
    "passthrough": {}
  },
  // Environment variables
  "env": {
    // Using env file
    "ENV_PATH": {
      "dev": ".env/dev",
      "prod": ".env/prod"
    }
  },
  // Local libraries (lib directory) to include to the global context
  "include": {
    "auth": "lib/auth"
  },
  // Default directory of routes
  routesDirectory: 'http',
}
```

## Documentation
Full documentation coming soon.

## Example

[More examples here](example)

## Get Started
Create a project directory with __src__ folder in it and inside the __src__ folder, create a file and name it __server.js__ then follow the example below to run the server.


### Create Server and Middleware
```js
import {server} from '@vindo/core'

const app = server()

app.set((req, res, next, ctx) => {
  ...
  next()
})
app.run()
```

Run the server
```cmd
$ node ./src/server.js
```

### Inject dependency to the global context
Injected dependency will be accessible anywhere in the routes and in any library recently added in the context through configuration.

```js
app.run(({env}) => {
  return {
    db: new Database(env.DATABASE_NAME),
    ...
  }
})
```

## Routing
Vindo router had few options for defining routes inside a file. To make a route, create a folder inside the __src__ folder and name it __http__ (the main directory for all routes) then create an index file.

### Serving route with specific method
Methods can be exported directly or define it inside a function.

```js
// File: ./src/http/index.js
// Path: http://example.com/
export function get(req, res, ctx) {
  res.html('<h1>Home</h1>')
}
export function post(req, res, ctx) {
  res.json({greetings: 'Hello'})
}
```
```js
// File: ./src/http/contact.js
// Path: http://example.com/contact
export function contact(req, res) {
  return {
    get(ctx) {
      res.html('<h1>Contact</h1>')
    },
    post(ctx) {
      res.html('<h1>Contact</h1>')
    }
  }
}
```

### Serving route inside sub-directory

```js
/**
 * File: ./src/http/about/index.js
 * Path: http://example.com/about
 */
export function about(req, res, ctx) {
  res.html('<h1>About</h1>')
}
```

```js
/**
 * File: ./src/http/about/team.js
 * Path: http://example.com/about/team
 */
export function team(req, res, ctx) {
  res.html('<h1>Team</h1>')
}
```

### Aggregated and mixed routes
```js
// ./src/http/index.js
export default function(ctx) {
  return {
    // Path: http://example.com/about
    about(req, res) {
      res.html('<h1>About</h1>')
    },
    // Path: http://example.com/
    GET(req, res) {
      res.html('<h1>Hello</h1>')
    }
  }
}
```


### Accessing global context
The context will be imported once called.
```js
// Access from a single route

/**
 * File: ./src/http/subscribers.js
 * Path: http://example.com/subscribers
 */
export async function post(req, res, ctx) {
  const db = ctx.db // Injected dependency
  const auth = ctx.auth // Local library included in the vindo.json configutation

  const id = auth.hash(auth.random())
  const args = {
    id,
    email: req.body.email
  }
  const result = await db.create('subscribers', args)
  if(result) {
    res.json({status: 'Success'}, 201)
  }
}
```

```js
// Access from default export of aggregated routes
export default function(ctx) {
  const db = ctx.db // Injected dependency
  const auth = ctx.auth // Local library included in the vindo.json configutation

  return {
    async post(req, res) {
      ...
    },
  }
}
```


## Contributing
There's more needs to be enhanced in this project, especially the response. We will share our contribution guidelines soon.


## Change Log

[Semantic Versioning](http://semver.org/)

## License

MIT
