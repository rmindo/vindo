/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import state from './state'



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
      if(typeof arg == 'function') {
        arg = await arg(data)
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
      if(data[name]) {
        dispatch({[name]: null})
      }
    },
    /**
     * Dispatch action
     */
    async dispatch(arg) {
      if(typeof arg == 'function') {
        arg = await arg(data)
      }
      if(arg.type) {
        const [reducer, name] = arg.type.split(/\//)
        if(name) {
          arg.reducer = data[reducer][name]
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

