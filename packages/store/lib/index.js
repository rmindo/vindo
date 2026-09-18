/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import persistStorage from './storage'
import {store, merge, assign, isObj, isFunc, watch, watchlist, createContext} from './store'



/**
 * Context holder
 */
const context = createContext({event})


/**
 * Global context
 */
export function getContext() {
  return Object.freeze({...context.data})
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
  const storage = persistStorage(conf.storage)
  storage.data((data) => {
    context.add(data)
  })

  context.add({storage})
  context.add(conf.context)
  /**
   * Initialize
   */
  addReducers(conf.reducers)
  addWatchlist(conf.watchlist)
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function addReducers(reducers) {
  
  for(var i in reducers) {
    if(!isObj(reducers[i])) {
      continue
    }
    context.add({[i]: proxyReducer(reducers[i])})
  }
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function addWatchlist(list) {
  list.forEach((key) => {
    watch({[key]: true, target: true})
  })
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
 * Invoke reducer
 * @param {object} data 
 */
async function invokeReducer(data) {
  const [name, key] = data.type
  if(!key) {
    return data
  }
  const reducer = context.data[name][key]

  if(isFunc(reducer)) {
    const state = await reducer(data?.data)
    if(state) {
      return merge(context.data, {[name]: state})
    } 
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
      async dispatch(data) {
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
         * Emit state for subscribers
         */
        Object.keys(data).forEach(key => {
          if(watchlist[key]) {
            watchlist[key].keys.forEach(hash => event.emit(hash, data))
          }
        })

        return data
      }
    })
  })
  
  return React.createElement(React.Fragment, {children})
}