/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import store from './store'
import event from './event'
import storage from './storage'


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
function assign(origin, ...obj) {
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
  return assign(initial, value)
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initDefaultState(reducers) {
  Object.values(reducers).forEach(({initialState}) => {
    if(initialState) {
      assign(context._currentValue, initialState)
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
      assign({...props}, React.useContext(context))
    )
  })
}


/**
 * Global context
 */
export function useContext() {
  return Object.freeze({...context._currentValue})
}


/**
 * Default configuration
 * 
 * @param {object} conf
 * @returns {object}
 */
export function configure(conf) {
  const _storage = storage(conf.storage)
  /**
   * Add persisted data to the context
   */
  _storage.data((root) => {
    if(root) {
      assign(context._currentValue, root)
    }
  })
  /**
   * Default state of reducers
   */
  initDefaultState(conf.reducers)

  return {
    storage: _storage,
    reducers: assign({}, conf.reducers),
  }
}


/**
 * Set a proxy reducer to call
 * the action directly using its name from store
 * 
 * @param {object} name  - Reducer's name
 * @param {object} reducer  - Reducers and actions to execute
 * @param {object} state - All context added in the store
 * @returns {object}
 */
function proxyReducer(name, state, reducer) {
  return new Proxy(reducer, {
    get(target, key) {
      const item = target[key]

      if(!item) return
      if(!isFunc(item)) return item
      
      return async function(arg) {
        const data = await item(arg, state)
        if(data) {
          state.store.set(data)
        }
        return data
      }
    }
  })
}


/**
 * Add reducers to global state
 * 
 * @param {object} state - All context added in the store
 * @param {object} reducers - Reducers and actions to execute
 * @returns {object}
 */
function addReducers(state, reducers) {
  const data = {}
  const type = Symbol.for('type')
  
  for(var i in reducers) {
    const reducer = reducers[i]
    if(isFunc(reducer)) {
      data[i] = reducer(state)
    }
    else {
      data[i] = proxyReducer(i, state, reducer)
    }
    data[i][type] = 'reducer'
  }

  return assign(state, data)
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
    addReducers(state, reducers)
  }, [])


  state.event = event
  state.store = store({
    data: state,
    /**
     * Dispatch reducer or new state
     */
    async dispatch(data) {
      const key = Symbol.for('reducer')
      /**
       * Get the reducer with symbol as key
       * to avoid key collision from user input.
       */
      if(isFunc(data[key])) {
        data = await data[key](data?.data)
      }

      if(data) {
        dispatcher(data)
        /**
         * Store whitelisted state
         */
        if(storage) {
          storage.set(storage.key, data)
        }
        return data
      }
    }
  })

  return React.createElement(context, {value: state}, children)
}


