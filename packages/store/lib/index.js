/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


import event from './event'
import storage from './storage'
import {store, merge, assign, isObj, isFunc, createContext} from './store'


/**
 * Context holder
 */
const watchers = {}
const context = createContext({event})


/**
 * Global context
 */
export function getContext() {
  return Object.freeze({...context.data})
}


/**
 * Convert object to hash
 * @param {object} obj 
 */
function toHash(obj) {
  return to16CharHash(JSON.stringify(obj))
}


/**
 * Check reducers 
 * @param {object} data
 */
function checkReducers(data) {
  return Object.values(data).filter(v => isFunc(v)).length
}


/**
 * Create 16 character hash
 * @param {object} obj
 */
function to16CharHash(str) {
  var h1 = 0xdeadbeef
  var h2 = 0x41c6ce57

  for(var i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')

  return hex1 + hex2
}


/**
 * Add subscriber to the watchlist
 * @param {object} data
 */
function watch(data) {
  if(!isObj(data)) {
    throw new TypeError('The expected argument must be an object.')
  }
  const hash = toHash(data)

  for(var i in data) {
    if(!watchers[i]) {
      watchers[i] = {
        keys: [],
        target: !!data.target
      }
    }
    if(!watchers[i].keys.includes(hash)) watchers[i].keys.push(hash)
  }

  return hash
}


/**
 * Default configuration
 * 
 * @param {object} conf
 */
export async function configure(conf) {
  /**
   * Initialize default state of reducers
   */
  initReducers(conf.reducers)
  /**
   * Add persisted data to the context
   */
  storage(conf.storage).data(context.add)
}


/**
 * HOC pure component with memo
 * 
 * @param {function} component
 */
export function pure(component) {

  return React.memo(({...props}) => {
    const state = context.store.state({})

    Object.values(watchers).forEach(({keys, target}) => {
      if(target) {
        keys.forEach(hash => {
          event.on(hash, state.set)
        })
      }
    })
    return React.createElement(component, assign(props, context.data, state.data()))
  })
}


/**
 * Subscribe to changes
 * @param {object} def Default value of a state
 */
export function subscribe(def) {

  return function(component) {
    const hash = watch(def)

    return React.memo(({...props}) => {
      const state = context.store.state(def)

      event.on(hash, (data) => {
        state.set(data)
      })
      return React.createElement(component, assign(props, context.data, state.data()))
    })
  }
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initReducers(reducers) {
  
  for(var i in reducers) {
    const reducer = reducers[i]

    if(!isObj(reducer)) {
      continue
    }
    
    const isReducer = checkReducers(reducer)
    if(isReducer == 0) {
      watch({
        [i]: true,
        target: true
      })
      context.add({[i]: reducer})
    }

    if(isReducer) {
      if(reducer.__initialState) {
        assign(reducer, reducer.__initialState)
      }

      context.add({[i]: proxyReducer(reducer)})
    }
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
      if(isFunc(target[key])) {
        return function(...args) {
          return target[key](...args, context.data)
        }
      }
      return target[key]
    }
  })
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

  const newState = await _reducer(...[data.data, state].filter(Boolean))
  if(newState) {
    return merge(state, {[name]: newState})
  }
}


/**
 * Context Provider
 */
export function Provider({config, children}) {
  context.add({
    store: store({
      data: context.data,
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
          data = await invokeReducer(data, context.data, config?.reducers)
        }
        context.add(data)

        /**
         * Emit update event for subscribers
         */
        Object.keys(data).forEach(key => {
          if(watchers[key]) {
            watchers[key].keys.forEach(hash => event.emit(hash, data))
          }
        })

        return data
      }
    })
  })
  
  return React.createElement(React.Fragment, {children})
}