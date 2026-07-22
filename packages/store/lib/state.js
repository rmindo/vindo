/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'



/**
 * Use state
 */
export default function state(initialState = {}, otherState = {}) {
  const {current} = React.useRef({})
  const [state, setState] = React.useState(initialState)
  

  if(typeof initialState !== 'object') {
    throw Error('Expected parameter of type object.')
  }
  
  Object.assign(current, state, otherState)
  
  return new Proxy({
    /**
     * Get all data
     */
    data() {
      return current
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