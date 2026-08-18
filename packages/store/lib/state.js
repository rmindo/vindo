/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'


const merge = Object.assign

/**
 * Use state
 */
export default function state(initialState = {}, otherState = {}) {
  const {current} = React.useRef({})
  const [state, setState] = React.useState({...initialState, ...otherState})
  

  if(typeof initialState !== 'object') {
    throw Error('Expected parameter of type object.')
  }
  
  merge(current, state)
  
  return new Proxy({
    /**
     * Get all data
     */
    data() {
      return current
    },
    /**
     * Get single data
     */
    get(name = null) {
      if(current[name]) {
        return current[name]
      }
    },
    /**
     * Set state
     */
    async set(state = {}) {

      if(typeof state == 'object') {
        setState(state)
      }

      if(typeof state == 'function') {
        const dataState = await state(current)

        if(dataState) {
          setState(dataState)
        }
      }
    }
  },
  {
    /**
     * Get state
     */
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      
      return current[key]
    }
  })
}