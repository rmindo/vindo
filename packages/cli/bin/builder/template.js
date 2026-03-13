
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

  if(Array.isArray(children)) {
    var filtered = children.filter(v => v)

    if(filtered.length > 1) {
      throw new Error('<Provider> should be at the top-level component after the body element.')
    }
    children = filtered[0]
  }

  if(typeof children.type == 'string') {
    return children
  }
  return children.type({children: children.props.children, ...arguments[0]})
}

client.render(document, data)