/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import store from './store'
import event from './event'


/**
 * Shorthand
 */
const parse = JSON.parse
const stringify = JSON.stringify


/**
 * Context holder
 */
const context = React.createContext({})


/**
 * Shorthand of typeof function
 * @param {function} arg 
 * @returns 
 */
function isFunc(arg) {
  return typeof arg == 'function'
}

/**
 * Merge object with empty object as default
 * @param {object} origin 
 * @param  {array} obj
 */
function merge(origin, ...obj) {
  return Object.assign(
    {},
    Object.assign(origin, ...obj)
  )
}


/**
 * Set context
 * 
 * @param {object} initial 
 * @param {object} value 
 * @returns 
 */
function reducer(initial, value) {
  return merge(initial, value)
}



function initDefaultState(reducers) {
  Object.values(reducers).forEach(({initialState}) => {
    if(initialState) {
      merge(context._currentValue, initialState)
    }
  })
}


async function initStoredState(storage) {
  storage.get('root').then((root) => {
    if(root) {
      merge(context._currentValue, root)
    }
  })
}


/**
 * HOC pure component
 * 
 * @param {function} component
 * @returns {object}
 */
export function pure(component) {
  return React.memo((props) => {
    return component(
      merge({...props}, React.useContext(context))
    )
  })
}


/**
 * Use store from context
 * @returns {object}
 */
export function useStore() {
  const {store} = React.useContext(context)
  return store
}


function getStorage({key, engine, persist}) {
  return {
    key,
    async set(name, data) {
      this.get(name).then((root) => {
        if(!root) {
          root = {}
        }
        for(var i in data) {
          if(persist.includes(i)) {
            root[i] = data[i]
          }
        }
        engine.setItem(name, stringify(root))
      })
    },
    async get(name) {
      try {
        return engine.getItem(name).then(data => parse(data))
      }
      catch(e) {}
    },
    async remove(name) {
      await engine.removeItem(name)
    }
  }
}


/**
 * Default configuration
 * 
 * @param {object} conf
 * @returns {object}
 */
export function configure({storage, reducers}) {
  var storage = getStorage(storage)

  initStoredState(storage)
  initDefaultState(reducers)

  return {
    storage,
    reducers: merge({}, reducers),
  }
}


/**
 * Set a proxy reducer to call
 * the action directly using its name from store
 * 
 * @param {object} name  - Reducer's name
 * @param {object} reducer  - Reducers and actions to execute
 * @param {object} store - All context added in the store
 * @param {function} dispatcher
 * @returns {object}
 */
function proxyReducer(name, store, reducer, dispatcher) {

  return new Proxy(reducer, {
    get(target, key) {
      const item = target[key]

      if(!target[key]) {
        return
      }

      if(isFunc(item)) {
        return async function(arg) {
          const data = await item(arg, store)
          dispatcher(data)
          return data
        }
      }
      
      return item
    }
  })
}


/**
 * Set reducer to global state
 * 
 * @param {object} store - All context added in the store
 * @param {object} reducers - Reducers and actions to execute
 * @param {function} dispatcher 
 * @returns {object}
 */
function setReducers(store, reducers, dispatcher) {
  const data = {}
  
  for(var i in reducers) {
    const reducer = reducers[i]

    if(isFunc(reducer)) {
      data[i] = reducer(store)
    }
    else {
      data[i] = proxyReducer(i, store, reducer, dispatcher)
    }
  }
  return merge(store, data)
}


/**
 * Execute action from reducers
 * 
 * @param {object} data - Reducer's type and action name
 * @param {object} store - All context added in the store
 * @param {object} reducers 
 * @returns 
 */
async function setState(data, state, reducers) {
  const reducer = reducers[data.type[0]]
  if(!reducer) {
    return
  }

  const action = reducer[data.type[1]]
  if(!action) {
    return
  }

  return await action(data.data, state)
}


/**
 * Context Provider
 * @returns {object}
 */
export function Provider({config, children}) {
  const [state, dispatcher] = React.useReducer(reducer, context._currentValue)

  const storage = config?.storage
  const reducers = config?.reducers


  React.useEffect(() => {
    setReducers(state, reducers, dispatch)
  }, [])

  
  /**
   * Dispatch action
   */
  async function dispatch(data) {
    if(Array.isArray(data.type)) {
      data = await setState(data, state, reducers)
    }
    if(storage) {
      storage.set(storage.key, data)
    }
    dispatcher(data)
  }

  state.event = event
  state.store = store({data: state, storage, dispatch})

  return React.createElement(context, {value: state}, children)
}


