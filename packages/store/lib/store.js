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
 * Store proxy
 */
export function store({data, dispatch}) {
  const target = useStore(data, dispatch)

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


/**
 * The object to proxy
 * 
 * @param {object} data 
 * @param {function} dispatch 
 */
function useStore(state, dispatch) {
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
    async remove(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }

      for(var key of keys) {
        if(state[key]) {
          if(state[key].__reducer) {
            throw new Error('You cannot remove a reducer.')
          }
        }
        dispatch({[key]: undefined})
      }
      state.storage.unset(keys)
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
      if(isFunc(data)) {
        data = await data(state)
      }

      if(state.storage) {
        state.storage.add(data)
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
 * Wrap the native context of react with a custom context
 * @param {object} data
 */
export function createContext(data = {}) {

  const target = {
    get(key) {
      return data[key]
    },
    has(key) {
      return key in data
    },
    add(...obj) {
      if(isFunc(obj[0])) {
        obj = obj[0](data)
      }
      return assign(data, ...obj)
    },
    delete(key) {
      delete data[key]
    }
  }

  return new Proxy(target, {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }

      switch(key) {
        case 'data': return data
        default:
          return data[key]
      }
    },
    set(target, key, value) {
      if(key == 'data') {
        throw new TypeError(`Cannot assign to read-only property '${key}'`)
      }
      target[key] = value
      return true
    }
  })
}