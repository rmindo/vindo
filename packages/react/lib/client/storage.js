/*
 * @vindo/react
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import React from 'react'
import http from '@vindo/react/request'
import {copy, isStr, isObj, isFunc, merge, toHash} from '@vindo/react/util'


/**
 * List of state keys
 */
export const listners = {}


/**
 * Get data from local storage related to the current hostname
 */
function data() {
  const data = {}
  const entries = Object.entries(localStorage)

  for(var [key, value] of entries) {
    try {
      if(key.includes(location.hostname)) {
        data[key.split(/\//)[1]] = JSON.parse(value)
      }
    }
    catch(e) {
      continue
    }
  }
  return data
}

/**
 * Add data using current hostname as key
 * @param {object} data 
 */
function add(data) {
  if(typeof data !== 'object') {
    throw TypeError('The second argument must be of type object.')
  }

  for(var i in data) {
    if(data[i] !== undefined) {
      localStorage.setItem(location.hostname.concat('/', i), JSON.stringify(data[i]))
    }
  }
}

/**
 * Remove persisted data from local storage
 * @param {string|array} keys 
 */
function remove(keys) {
  if(typeof keys == 'string') {
    keys = [keys]
  }
  for(var key of keys) {
    localStorage.removeItem(location.hostname.concat('/', key))
  }
}

/**
 * Add storage to the global context
 * @param {object} context
 */
export function persistent(context) {
  return context.add({storage: {add, data, remove}}).storage
}


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
  
  return state.data
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

  const store = {
    data: context.data,
    /**
     * Remove data from both persistent storage and global context
     */
    remove(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }
      context.remove(keys)
      context.storage.remove(keys)
      updateListeners(Object.fromEntries(keys.map(key => [key, undefined])), context)
    },
    /**
     * Persist data
     */
    async persist(data) {
      if(isFunc(data)) {
        data = await data(state)
      }
      context.storage.add(data)
      return store.dispatch(data)
    },
    /**
     * Dispatch reducer or state
     */
    async dispatch(data) {
      if(isFunc(data)) {
        data = await data(context.data)
      }
      context.add(data)
      updateListeners(data, context)
      return data
    }
  }

  return new Proxy(store, {
    get(target, key) {
      if(key in target) {
        return target[key]
      }
      if(key in state) {
        return state[key]
      }
      if(key in target.data) {
        return target.data[key]
      }
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
    data: current,
    
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
    remove(keys) {
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
      return target.data[key]
    }
  })
}