/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import state from './state'


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
function store(data, dispatch) {
  return {
    state,
    /**
     * Set global state
     */
    async set(arg) {
      if(isFunc(arg)) {
        arg = await arg(data)
      }
      /**
       * Merge old and new state
       */
      if(arg) {
        arg = merge(data, arg)
      }
      return await dispatch(arg)
    },
    /**
     * Get data
     */
    get(name, fallback) {
      if(!name) {
        return data
      }
      if(data[name]) {
        return data[name]
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
          if(data[key]) {
            if(data[key].__reducer) {
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
        for(var i in arg) if(data[i].__reducer) delete arg[i]
      }
      dispatch(arg)
    },
    /**
     * Dispatch action
     */
    async dispatch(arg, param) {
      if(isFunc(arg)) {
        arg = await arg(data)
      }
      arg = merge(data, arg)

      if(isStr(arg)) {
        arg = {
          data: param,
          type: arg.split(/\//)
        }
        if(arg.type.length == 1) {
          arg = {[arg.type[0]]: arg.data}
        }
      }

      if(isStr(arg.type)) {
        arg.type = arg.type.split(/\//)
      }

      return await dispatch(arg)
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

