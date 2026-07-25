/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import storage from './storage'
import store, {merge, assign, proxy, isFunc} from './store'


/**
 * Context holder
 */
const context = React.createContext({})


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
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initState(reducers) {
  Object.values(reducers).forEach(({initialState}) => {
    if(initialState) {
      assign(context._currentValue, initialState)
    }
  })
}


/**
 * Default configuration
 * 
 * @param {object} conf
 * @returns {object}
 */
export function configure(conf) {
  /**
   * Default state of reducers
   */
  initState(conf.reducers)
  /**
   * Add persisted data to the context
   */
  conf.storage = storage(conf.storage)
  conf.storage.data((root) => {
    if(root) {
      assign(context._currentValue, root)
    }
  })

  return conf
}


/**
 * Add reducers to global state
 * 
 * @param {object} state - All context added in the store
 * @param {object} reducers - Reducers and actions to execute
 * @returns {object}
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
 * Context Provider
 * @returns {object}
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
        data = await invokeReducer(data)
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

  /**
   * Invoke reducer
   * @param {object} data 
   * @param {array} type[] Reducer type
   */
  async function invokeReducer(data) {
    const [key, method] = data.type
    if(!method) {
      return data
    }

    const reducer = reducers[key][method]
    if(isFunc(reducer)) {
      data = await reducer(data.data, state)
    }
    return data
  }

  return React.createElement(context, {value: state}, children)
}


