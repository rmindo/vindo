/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import useState from './state'




export const watchlist = {}

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
 * Convert object to hash
 * @param {object} obj 
 */
function toHash(obj) {
  return to16CharHash(JSON.stringify(obj))
}


/**
 * Create 16 character hash
 * @param {object} obj
 */
function to16CharHash(str) {
  var h1 = 0xdeadbeef
  var h2 = 0x41c6ce57

  for(var i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')

  return hex1 + hex2
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
    if(!data[i]) {
      continue
    }
    if(isObj(arg[i])) {
      arg[i] = assign(data[i], arg[i])
    }
  }
  return arg
}


/**
 * Add subscriber to the watchlist
 * @param {object} data
 */
export function watch(data) {
  if(!isObj(data)) {
    throw new TypeError('The expected argument must be an object.')
  }
  const hash = toHash(data)

  for(var i in data) {
    if(i == 'target') {
      continue
    }
    if(!watchlist[i]) {
      watchlist[i] = {
        keys: [],
        target: !!data.target
      }
    }
    if(!watchlist[i].keys.includes(hash)) watchlist[i].keys.push(hash)
  }

  return hash
}


/**
 * Store proxy
 */
export function store({context, dispatch}) {
  const target = useStore(context, dispatch)

  return new Proxy(target, {
    set(target, key, value) {
      target[key] = value
      return true
    },
    get(target, key) {
      if(target[key]) {
        return target[key]
      }
      return context.data[key]
    }
  })
}


/**
 * The object to proxy
 * 
 * @param {object} data 
 * @param {function} dispatch 
 */
function useStore(context, dispatch) {
  const state = context.data

  return {
    __reducer: true,
    useLocalState: useState,
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
     * Watch for state changes
     */
    state(data) {
      if(!isObj(data)) {
        throw new TypeError('The expected argument must be an object.')
      }
      const update = useState(data)

      for(var i in data) {
        if(state[i]) {
          data[i] = state[i]
        }
        context.event.on(watch({[i]: true}), update.set)
      }
      return data
    },
    /**
     * Replace value
     */
    replace(data) {
      dispatch(data)
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