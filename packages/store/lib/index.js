/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import storage from './storage'
import store, {merge, assign, isFunc} from './store'


/**
 * Context holder
 */
const context = React.createContext({})


/**
 * HOC pure component
 * 
 * @param {function} component
 */
export function pure(component) {
  return React.memo(({...props}) => {
    return component(
      assign(props, React.useContext(context))
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
 */
export function configure(conf) {
  /**
   * Initialize default state of reducers
   */
  initState(conf.reducers)
  /**
   * Add persisted data to the context
   */
  conf.storage = storage(conf.storage)
  conf.storage.data((store) => {
    if(store) {
      assign(context._currentValue, store)
    }
  })

  return conf
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initState(reducers) {
  for(var i in reducers) {
    if(reducers[i].initialState) {
      assign(context._currentValue, reducers[i].initialState)
    }
  }
}


/**
 * Add reducers to global state
 * 
 * @param {object} state - All context added in the store
 * @param {object} reducers - Reducers and actions to execute
 */
function initReducers(state, reducers) {
  const data = {}

  for(var i in reducers) {
    const item = reducers[i]

    if(isFunc(item)) {
      const reducer = item(state)

      if(!reducer) {
        continue
      }
      data[i] = reducer
      data[i].__reducer = true
    }
  }
  assign(state, data)
}


/**
 * Invoke reducer
 * @param {object} data 
 */
async function invokeReducer(data, state, reducers) {
  const [key, method] = data.type
  if(!method) {
    return data
  }

  const reducer = reducers[key][method]
  if(isFunc(reducer)) {
    data = await reducer(data.data, state)
  }
  return merge(state, data)
}


/**
 * Context Provider
 */
export function Provider({config, children}) {
  const [state, dispatcher] = React.useReducer(assign, context._currentValue)


  const storage = config?.storage
  const reducers = config?.reducers


  React.useEffect(() => {
    state.event = event
    /**
     * Load reducers
     */
    initReducers(state, reducers)
  }, [])

  
  state.store = store({
    data: state,
    /**
     * Dispatch reducer or new state
     */
    async dispatch(data) {
      /**
       * Invoke if its a reducer function
       */
      if(data.type) {
        data = await invokeReducer(data, state, reducers)
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