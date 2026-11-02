/*
 * @vindo/react
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import {HTTPRequest} from '@vindo/react/request'
import {copy, isStr, isObj, isFunc, merge, toHash} from '@vindo/react/util'


const http = HTTPRequest()

/**
 * List of state keys
 */
export const listners = {}


/**
 * Add subscriber to the watch list
 * @param {object} initialState
 * @param {object} context
 */
export function watch(initialState, context) {
  const data = copy(initialState)
  const hash = toHash(initialState)

  for(var i in data) {
    /**
     * Replace the default with new value from context after dispatched
     */
    if(context.has(i)) {
      data[i] = context.data[i]
    }
    /**
     * Add to watchlist
     */
    if(!listners[i]) {
      listners[i] = []
    }
    if(!listners[i].includes(hash)) listners[i].push(hash)
  }

  const state = getState(data, context)
  /**
   * Set to default state if removed from context
   */
  context.event.on(hash, (data) => {
    for(var i in data) {
      if(data[i] == undefined) data[i] = initialState[i]
    }
    state.set(data)
  })
  
  return state.data()
}


/**
 * Update component when specific state is dispatched
 * @param {object} data 
 * @param {object} context 
 */
export function updateListeners(data, context) {
  if(!data) {
    return
  }
  Object.keys(data).forEach(key => {
    if(listners[key]) {
      listners[key].forEach(hash => context.event.emit(hash, data))
    }
  })
}


/**
 * Get store proxy
 */
export function getStore(initialState, context) {
  const state = watch(initialState, context)

  return new Proxy({
    /**
     * Remove data from both persistent storage and global context
     */
    remove(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }
      context.delete(keys)
      updateListeners(Object.fromEntries(keys.map(key => [key, undefined])), context)
    },
    /**
     * Dispatch reducer or state
     */
    async dispatch(data) {
      if(isFunc(data)) {
        data = await data(context.data)
      }
      context.add(data)
      /**
       * Emit listeners
       */
      updateListeners(data, context)
      return data
    }
  },
  {
    get(target, key) {
      if(key in target) {
        return target[key]
      }
      if(key in state) {
        return state[key]
      }
      return context.data[key]
    }
  })
}


/**
 * Get state
 * @param {object} initialState 
 * @param {object} context 
 */
export function getState(initialState = {}, context) {
  const {current} = React.useRef({})
  const [state, setState] = React.useState(initialState)

  if(!isObj(initialState)) {
    throw Error('Custom state hook only allow object as parameter.')
  }
  
  merge(current, state)
  
  return new Proxy({
    data() {
      return current
    },
    set(data = {}) {
      /**
       * This allow multiple state arguments to be set
       */
      if(arguments.length > 1) {
        merge(...arguments)
      }

      if(isObj(data)) {
        setState(data)
      }

      if(isFunc(data)) {
        const dataState = data(current)

        if(dataState) {
          setState(dataState)
        }
      }
      context.add({updating: false})
    },
    /**
     * Send GET request to the server
     */
    get(data) {
      if(isObj(data)) {
        return http.get({data})
      }
      if(isFunc(data)) {
        return http.get({}).then(data)
      }
    },
    /**
     * Send POST request to the server
     */
    post(data) {
      if(isObj(data)) {
        return http.post({data})
      }
      if(isFunc(data)) {
        return http.post({}).then(data)
      }
    },
  },
  {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      if(context.updating) {
        merge(current, context.state)
      }
      return current[key]
    }
  })
}


/**
 * Wrap the native context of react with a custom context
 * @param {object} data
 */
export function createContext(data = {}) {
  const target = {
    data,
    has(key) {
      return key in data
    },
    add(obj) {
      return merge(data, obj)
    },
    delete(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }
      keys.forEach(key => delete data[key])
    }
  }

  return new Proxy(target, {
    get(target, key) {
      if(key in target) {
        return target[key]
      }
      return data[key]
    }
  })
}