
import React from 'react'
import * as client from '@vindo/react/client'

/**
 * This will be the holder of all components that will be imported
 */
const data = {}

/**
 * Template for components to be imported
 */
{REACT_COMPONENTS}
{IMPORTED_COMPONENTS}


data.Link = client.Link


if(data.head || data.body) {
  throw new SyntaxError(`Component name '${data.head ? 'head' : 'body'}' is a reserved name for SSR client components.`)
}

data.head = function head(meta) {
  const {props:{children}} = React.cloneElement((
    {HEAD_COMPONENT}
  ))
  return children
}

data.body = function body({meta}) {
  var {props:{children}} = React.cloneElement(({BODY_COMPONENT}))

  if(!Array.isArray(children)) {
    children = React.Children.toArray(children)
  }

  return React.Children.map(children, (child, key) => {
    return React.cloneElement(child, {key, ...arguments[0]})
  })
}

client.render(document, data)