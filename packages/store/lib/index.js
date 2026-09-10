/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import storage from './storage'
import store, {merge, assign, isObj, isFunc} from './store'


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
  initReducers(conf.reducers)
  /**
   * Add persisted data to the context
   */
  conf.storage = storage(conf.storage)
  conf.storage.data((store) => {
    assign(context._currentValue, store)
  })
  assign(context._currentValue, {event, storage: conf.storage})

  return conf
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initReducers(reducers) {
  const data = {}
  
  for(var i in reducers) {
    const reducer = reducers[i]

    if(!isObj(reducer)) {
      data[i] = reducer
    }
    
    
    if(isObj(reducer)) {
      if(reducer.__initialState) {
        assign(reducer, reducer.__initialState)
      }

      const hasReducers = Object.values(reducer).filter(v => isFunc(v))      
      if(hasReducers.length) {
        reducer.__reducer = true
      
        data[i] = new Proxy(reducer, {
          set(target, key, value) {
            target[key] = value
            return true
          },
          get(target, key) {
            if(typeof target[key] == 'function') {
              return function(...args) {
                return target[key](...args, context._currentValue)
              }
            }
            return target[key]
          }
        })
      }

      if(hasReducers.length == 0) {
        data[i] = reducer
      }
    }
  }

  assign(context._currentValue, data)
}


/**
 * Invoke reducer
 * @param {object} data 
 */
async function invokeReducer(data, state) {
  const [name, key] = data.type
  if(!key) {
    return data
  }
  const _reducer = state[name][key]


  if(!isFunc(_reducer)) {
    return assign(state[name], {[key]: data.data})
  }

  const newState = await _reducer(data.data, state)
  if(newState) {
    return merge(state, {[name]: newState})
  }
}


/**
 * Context Provider
 */
export function Provider({config, children}) {
  const [state, dispatcher] = React.useReducer(assign, context._currentValue)

  
  state.store = store({
    data: state,
    /**
     * Dispatch reducer or new state
     */
    async dispatch(data) {
      if(!data) {
        return
      }
      /**
       * Invoke if its a reducer function
       */
      if(data.__invokeReducer) {
        data = await invokeReducer(data, state, config?.reducers)
      }
      dispatcher(data)

      return data
    }
  })

  return React.createElement(context, {value: state}, children)
}