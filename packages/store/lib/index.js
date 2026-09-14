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
const keys = {}
const context = createContext()


/**
 * HOC pure component
 * 
 * @param {function} component
 */
export function pure(component) {
  return React.memo(({...props}) => component({...props, ...context.data}))
}


/**
 * Global context
 */
export function getContext() {
  return Object.freeze({...context.data})
}


/**
 * Check reducers 
 * @param {object} data
 */
function checkReducers(data) {
  return Object.values(data).filter(v => isFunc(v)).length
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
  conf.storage = storage(conf.storage)
  /**
   * Add the persisted data to the context
   */
  conf.storage.data(context.add)
}


/**
 * Create id for object
 * @param {object} obj
 */
function createID(obj) {
  const str = JSON.stringify(obj)

  let hash = 0
  for(let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString()
}


/**
 * Add subscriber to the watchlist
 * @param {object} data
 */
function addSubscriber(data) {
  if(!isObj(data)) {
    throw new TypeError('The expected argument must be an object.')
  }
  const id = createID(data)

  for(var i in data) {
    if(!keys[i]) {
      keys[i] = []
    }
    if(!context.has(i)) {
      context.add({[i]: data[i]})
    }
    if(!keys[i].includes(id)) keys[i].push(id)
  }

  return id
}


/**
 * Subscribe to changes
 * @param {object} def Default value of global state
 */
export function subscribe(def) {
  const key = addSubscriber(def)
  
  return function(component) {

    return React.memo(({...props}) => {
      const state = context.store.state(def)
      
      context.event.on(key, (data) => {
        state.set(data)
      })
      return React.createElement(component, context.add(props, state.data()))
    })
  }
}


/**
 * Initialize default state from reducers
 * @param {object} reducers 
 */
function initReducers(reducers) {
  const data = {}
  
  for(var i in reducers) {
    const reducer = reducers[i]
    const isReducer = checkReducers(reducer)


    if(!isObj(reducer) || isReducer == 0) {
      data[i] = reducer
      console.log(createID(reducer))
    }
    

    if(isObj(reducer)) {
      reducer.__reducer = true

      if(!isReducer) {
        continue
      }

      if(reducer.__initialState) {
        assign(reducer, reducer.__initialState)
      }

      data[i] = new Proxy(reducer, {
        set(target, key, value) {
          target[key] = value
          return true
        },
        get(target, key) {
          if(typeof target[key] == 'function') {
            return function(...args) {
              return target[key](...args, context.data)
            }
          }
          return target[key]
        }
      })
    }
  }

  context.add(data)
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
    event,
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
        Object.keys(data).forEach(v => {
          if(keys[v]) {
            keys[v].forEach(e => event.emit(e, data))
          }
        })

        return data
      }
    })
  })

  return React.createElement(React.Fragment, {children})
}