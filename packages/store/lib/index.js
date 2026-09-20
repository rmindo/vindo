/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import persistentStorage from './storage'
import {store, merge, assign, isObj, isFunc, createContext, updateListeners} from './store'



/**
 * Context holder
 */
const context = createContext({event})


/**
 * Get state from context
 * @param {string} key 
 */
export function getState(key) {
  if(context.has(key)) {
    return context.data[key]
  }
  return Object.freeze({...context.data})
}


/**
 * HOC pure component with memo
 * 
 * @param {function} component
 */
export function pure(component) {
  return React.memo(({...props}) => {
    return React.createElement(component, assign(props, context.data))
  })
}


/**
 * Default configuration
 * 
 * @param {object} conf
 */
export function configure(conf) {
  /**
   * Add persisted data to the context
   */
  const storage = persistentStorage(conf.storage)
  storage.data((data) => {
    context.add(data)
  })

  context.add({storage})
  context.add(conf.context)
  /**
   * Initialize
   */
  initReducers(conf.reducers)
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initReducers(reducers) {
  for(var i in reducers) {
    if(!isObj(reducers[i])) {
      continue
    }
    context.add({[i]: proxyReducer(reducers[i])})
  }
}


/**
 * Create proxy for reducer to recreate function
 * @param {object} reducer 
 */
function proxyReducer(reducer) {
  reducer.__reducer = true

  return new Proxy(reducer, {
    set(target, key, value) {
      target[key] = value
      return true
    },
    get(target, key) {
      const item = target[key]
      
      if(isFunc(item)) {
        return async function(data = {}) {
          return await item(data, context.data)
        }
      }
      return item
    }
  })
}


/**
 * Invoke reducer
 * @param {object} data 
 */
async function invokeReducer(data) {
  const [name, key] = data.type
  if(!key) {
    return data
  }

  const reducer = context.data[name][key]
  if(!isFunc(reducer)) {
    return
  }

  const state = await reducer(data?.data)
  if(state) {
    return merge(context.data, {[name]: state})
  }
}


/**
 * Context Provider
 */
export function Provider({children}) {
  context.add({
    store: store({
      context,
      /**
       * Dispatch reducer or new state
       */
      async dispatcher(data) {
        if(!data) {
          return
        }

        /**
         * Invoke if its a reducer function
         */
        if(data.__invokeReducer) {
          data = await invokeReducer(data)
        }
        context.add(data)
        /**
         * Emit listeners
         */
        updateListeners(data, context)

        return data
      }
    })
  })
  
  return React.createElement(React.Fragment, {children})
}