
import React from 'react'
import {render, Link} from '@vindo/react/client'

const chunk = {}

chunk.Link = Link

{CHUNK_IMPORTS}
{ENTRY_IMPORTS}


if(chunk.head || chunk.body) {
  throw new SyntaxError(`Component name '${chunk.head ? 'head' : 'body'}' is a reserved name for SSR client components.`)
}

chunk.head = function head(meta) {
  const {props:{children}} = React.cloneElement((
    {HEAD_COMPONENT}
  ))
  return children
}

chunk.body = function body(props) {
  const {props:{children}, type} = React.cloneElement((
    {BODY_COMPONENT}
  ))
  return type({children, ...props})
}

render(document, chunk)