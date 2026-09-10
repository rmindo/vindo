/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import useState from './state'


/**
 * Shorthand of typeof string
 * @param {function} arg 
 */
export function isStr(arg) {
  return typeof arg == 'string'
}

/**
 * Shorthand of typeof function
 * @param {function} arg 
 */
export function isFunc(arg) {
  return typeof arg == 'function'
}

/**
 * Shorthand of typeof object
 * @param {function} arg 
 */
export function isObj(arg) {
  return typeof arg === 'object' && arg.constructor === Object
}

/**
 * Merge object with empty object as default
 * @param {object} origin 
 * @param  {array} obj
 */
export function assign(origin, ...obj) {
  return Object.assign(
    {},
    Object.assign(origin, ...obj)
  )
}

/**
 * Make a shallow merge of old and new state object
 * @param {object} arg
 * @param {object} data
 */
export function merge(data, arg) {
  for(var i in arg) {
    if(data[i]) {
      if(data[i].__reducer) {
        delete arg[i]
      }
      if(isObj(arg[i])) {
        arg[i] = assign(data[i], arg[i])
      }
    }
  }
  return arg
}

/**
 * The object to proxy
 * 
 * @param {object} data 
 * @param {function} dispatch 
 */
function store(state, dispatch) {
  return {
    __reducer: true,
    state: useState,
    /**
     * Set global state
     */
    async set(data) {
      if(isFunc(data)) {
        data = await data(state)
      }
      /**
       * Merge old and new state
       */
      if(data) {
        data = merge(state, data)
      }
      return await dispatch(data)
    },
    /**
     * Get data
     */
    get(name, fallback) {
      if(!name) {
        return state
      }
      if(state[name]) {
        return state[name]
      }
      return fallback
    },
    /**
     * Remove data
     */
    remove(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }
      return dispatch(
        Object.fromEntries(keys.map(key => {
          if(state[key]) {
            if(state[key].__reducer) {
              throw new Error('You cannot remove a reducer.')
            }
          }
          return [key, null]
        }))
      )
    },
    /**
     * Replace value
     */
    replace(arg) {
      if(arg) {
        /**
         * Exclude reducer
         */
        for(var i in arg) if(state[i].__reducer) delete arg[i]
      }
      dispatch(arg)
    },
    /**
     * Persist data
     */
    async persist(data) {
      if(!isObj(data)) {
        return
      }

      if(state.storage) {
        state.storage.set(state.storage.key, data)
      }
      return await dispatch(data)
    },
    /**
     * Dispatch action
     */
    async dispatch(data, param) {
      if(isFunc(data)) {
        data = await data(state)
      }
      data = merge(state, data)

      if(isStr(data)) {
        data = {
          data: param,
          type: data.split(/\//)
        }
        if(data.type.length == 1) {
          data = {[data.type[0]]: data.data}
        }
      }

      if(isStr(data.type)) {
        data.__invokeReducer = true
        data.type = data.type.split(/\//)
      }

      return await dispatch(data)
    }
  }
}


/**
 * Store proxy
 */
export default function({data, dispatch}) {
  const target = store(data, dispatch)

  const storeProxy = new Proxy(target, {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      return data[key]
    }
  })
  return Object.freeze(storeProxy)
}

