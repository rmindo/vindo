/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import state from './state'


/**
 * Store methods
 */
export default function({data, dispatch}) {

  return new Proxy({
    state,
    /**
     * Set global state
     */
    set(arg) {
      if(typeof arg == 'function') {
        arg = arg(data)
      }
      dispatch(arg)
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
    dispatch(arg) {
      if(typeof arg == 'function') {
        arg = arg(data)
      }
      if(arg.type) {
        arg.type = arg.type.split(/\//)
      }
      dispatch(arg)
    }
  },
  {
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      return data[key]
    }
  })
}

