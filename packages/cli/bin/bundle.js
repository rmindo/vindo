import * as chunk from '@build/chunk'

import ReactDom from 'node_modules/react-dom/client'
import {
  createElement as element,
  isValidElement as isValid,
}
from 'node_modules/react'


const url = new URL(document.scripts.bundle.src)

const hash = url.searchParams.get('hash')
const port = url.searchParams.get('port')
const name = url.searchParams.get('name')

const get = fetch(
  hash.concat('?',
    (new URLSearchParams({name})).toString()
  )
)


/**
 * Set element type
 */
function children(data) {
  if(isValid(data)) {
    return data
  }

  if(!Array.isArray(data)) {
    data = [data]
  }
  
  return data.map((item, key) => {
    const props = item.props

    if(!props) {
      return item
    }
    if(props.children) {
      props.children = children(props.children)
    }

    if(!item.type) {
      var name = props.name
      if(!name) {
        throw ReferenceError('Component name is not defined.')
      }

      const comp = chunk[name.toLowerCase()]
      if(comp) {
        return element.bind(null, comp)({...props, key})
      }
    }
    return {...item, key, $$typeof: Symbol.for('react.transitional.element')}
  })
}


/**
 * Get the props in the backend
 */
async function map(res) {
  var data = await res.json()
  if(data) {
    ReactDom.hydrateRoot(document.getElementById('root'), children(data))
  }
}
get.then(map)

/**
 * Live reload for development
 */
function reload({origin}) {
  if(port) {
    (new EventSource(origin.replace(/\d+/, port))).onmessage = function() {
      location.reload()
    }
  }
}
reload(location)