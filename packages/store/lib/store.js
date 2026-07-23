/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import state from './state'


/**
 * Shorthand of typeof function
 * @param {function} arg 
 * @returns 
 */
function isFunc(arg) {
  return typeof arg == 'function'
}

/**
 * Remove non object value of a reducer
 * @param {object} arg 
 * @param {object} data 
 */
function clear(arg, data) {
  for(var i in arg) {
    if(!arg[i] && data[i][Symbol.for('type')] == 'reducer') {
      delete arg[i]
    }
  }
  return arg
}

/**
 * Merge old and new state
 * @param {object} arg
 * @param {object} data
 */
function merge(arg, data) {
  for(var i in arg) {
    if(data[i]) {
      arg[i] = Object.assign(data[i], arg[i])
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
     * Replace value
     */
    replace(arg) {
      if(arg) {
        arg = clear(arg, data)
      }
      dispatch(arg)
    },
    /**
     * Set global state
     */
    async set(arg) {
      if(isFunc(arg)) {
        arg = await arg(data)
      }

      if(arg) {
        arg = clear(arg, data)
        arg = merge(arg, data)
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
    remove(name) {
      const type = Symbol.for('reducer')

      if(data[name]) {
        if(data[name][type] == 'reducer') {
          throw new Error('You cannot remove a reducer.')
        }
        dispatch({[name]: null})
      }
    },
    /**
     * Dispatch action
     */
    async dispatch(arg) {
      if(isFunc(arg)) {
        arg = await arg(data)
      }
      /**
       * Remove value of null or boolean for reducers
       */
      arg = clear(arg, data)
      arg = merge(arg, data)
      /**
       * Reducer's type
       */
      if(arg.type) {
        const [reducer, name] = arg.type.split(/\//)
        if(name) {
          /**
           * Use symbol as key to avoid key collision
           */
          arg[Symbol.for('reducer')] = data[reducer][name]
        }
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

