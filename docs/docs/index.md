---
sidebar_position: 1
---

# Introduction

Welcome to the Vindo documentation. This resource covers everything you need to know to get started, understand core concepts, and build advanced features with Vindo.

## What is Vindo?
Vindo is a Web and API framework designed to seamlessly build backend APIs and power up the frontend with Server-Side Rendering (SSR).

Built for efficiency, scalability, and developer experience. Vindo streamlines the workflow from managing the middleware, context, libraries, database and business logic on the backend to delivering highly optimized, SEO-friendly pages on the frontend.

## Use Vindo for
Vindo can be used for both API development and Server-Side Rendering, giving developers the flexibility to build backend services or fully rendered applications.

### API Development
Vindo is designed primarily for backend API, built around a flexible file-based routing system that turns your file system into a clean, self-documenting API structure and making routes instantly discoverable without digging through configuration.

File-based routing makes API versioning and scaling straightforward. New versions can be introduced by creating versioned folders such as /v1, /v2 without impacting existing endpoints, allowing multiple API versions to coexist safely. As the API grows, routes remain organized by resource and version, reducing complexity and avoiding monolithic router files.

```bash
src/
├── lib/
├── http/
│   ├── v1/
|   |   └── users/
|   |       └── [uid:hex]/
│   └── v2/
|       └── users/
├── middleware/
│   └── authentication.ts
└── server.ts
```

This approach enables teams to scale APIs incrementally, refactor with confidence, and maintain backward compatibility while keeping the codebase clean, predictable, and easy to reason about.

### SSR Development
Vindo uses [React for Server-Side Rendering (SSR)](https://docusaurus.new) as a module, but also lets developers create their own custom middleware to handle SSR or use a template engine and align it with the current route being rendered and organize their application’s pages and components in a way that mirrors folder structure.

#### Custom middleware
```js
app.use(function(req, res, next, ctx) {
  ctx.events.on('__render', function(content) {
    return {
      html: templateEngine(content)
    }
  })
  next()
})
```
The custom middleware above uses event listener to intercept the response pipeline, allowing content to be processed before it is sent to the client. When the render event is triggered, the middleware listens for incoming template data, transforms the structured content into HTML, and then pipes the generated markup directly into the response stream.