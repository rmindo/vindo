/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'


import useLocalState from './state'

/**
 * List of state keys
 */
export const listners = {}


/**
 * Shorthand of typeof string
 * @param {string} arg 
 */
export function isStr(arg) {
  return typeof arg == 'string'
}


/**
 * Shorthand of typeof function
 * @param {function} arg 
 */
export function isFunc(arg) {
  return arg && typeof arg == 'function'
}


/**
 * Shorthand of typeof string
 * @param {string} arg 
 */
export function isArr(arg) {
  return Array.isArray(arg) && arg.constructor === Array
}


/**
 * Shorthand of typeof object
 * @param {object} arg 
 */
export function isObj(arg) {
  return arg && typeof arg === 'object' && arg.constructor === Object
}


/**
 * Create a shallow copy of the object
 * @param {object} obj
 */
export function copy(obj) {
  if(isStr(obj)) {
    throw new TypeError('The expected argument must be an object.')
  }
  return {...obj}
}


/**
 * Convert object to hash
 * @param {object} obj 
 */
export function toHash(obj) {
  return to16CharHash(JSON.stringify(obj))
}


/**
 * Create 16 character hash
 * @param {string} str
 */
export function to16CharHash(str) {
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
  /**
   * Merge only the object values
   */
  for(var i in arg) {
    if(data[i] == undefined) {
      delete data[i]
    }

    if(i in data) {
      var obj1 = isObj(arg[i])
      var obj2 = isObj(data[i])
      /**
       * Reducers is wrapped with proxy constructor so,
       * create a copy of it as a plain object before checking to avoid false return.
       */
      if(data[i].__reducer) {
        obj2 = isObj(copy(data[i]))
      }

      if(obj1 && obj2) {
        arg[i] = assign(data[i], arg[i])
      }
    }
  }
  return arg
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

  const state = useLocalState(data)
  /**
   * Set to default state if removed from context
   */
  context.event.on(hash, (data = {}) => {
    for(var i in data) {
      if(data[i] == undefined) data[i] = initialState[i]
    }
    state.set(data)
  })
  
  return state.data()
}


/**
 * Go to the next middleware without dispatching data
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} callback
 */
function next(data, resolve, callback) {
  if(callback) {
    data = callback(data)
  }
  resolve(data)
}


/**
 * Timeout before going to the next middleware
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} callback 
 * @param {number} timeout 
 */
function delay(data, resolve, callback, timeout) {
  setTimeout(() => {
    if(callback) {
      data = callback(data)
    }
    resolve(data)
  }, timeout)
}


/**
 * Dispatch state to global context
 * @param {object} data 
 * @param {function} resolve 
 * @param {function} callback 
 * @param {function} dispatcher 
 */
function deploy(data, resolve, callback, dispatcher) {
  if(callback) {
    data = callback(data)
  }
  resolve(dispatcher(data))
}


/**
 * Create a chain of middlewares and dispatch to the context
 * @param {object} initialState 
 * @param {function} dispatcher 
 */
function nextBuild(promise, dispatcher) {
  const build = {}

      
  function resolve(name, callback, timeout = 0) {
    /**
     * Catch error
     */
    if(name == 'catch') {
      promise.catch(callback)
    }
    /**
     * Wrap it again
     */
    promise = new Promise((resolve, reject) => {
      promise.then(data => {
        switch(name) {
          case 'next':
            return next(data, resolve, callback)
          case 'delay':
            return delay(data, resolve, callback, timeout)
          case 'deploy':
            return deploy(data, resolve, callback, dispatcher)
        }
      })
      .catch(reject)
    })

    return build
  }


  /**
   * Go to the next middleware without dispatching data
   */
  build.next = function(callback) {
    return resolve('next', callback)
  }
  /**
   * Catch the error
   */
  build.catch = function(callback) {
    return resolve('catch', callback)
  }
  /**
   * Dispatch state to global context
   */
  build.deploy = function(callback) {
    return resolve('deploy', callback)
  }
  /**
   * Timeout before going to the next middleware
   */
  build.delay = function(timeout, callback) {
    return resolve('delay', callback, timeout)
  }

  return build
}


/**
 * Update component when specific state is dispatched
 * @param {object|array} data 
 * @param {object} context 
 */
export function updateListeners(data, context) {
  var keys = data
  
  if(!isArr(data)) {
    keys = Object.keys(data)
  }
  keys.forEach(key => {
    if(listners[key]) {
      listners[key].forEach(hash => context.event.emit(hash, !isArr(data) ? data : {}))
    }
  })
}


/**
 * Store proxy
 */
export function store({context, dispatcher}) {
  const target = useStore(context, dispatcher)

  return new Proxy(target, {
    set(target, key, value) {
      target[key] = value
      return true
    },
    get(target, key) {
      if(key in target) {
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
 * @param {function} dispatcher 
 */
function useStore(context, dispatcher) {
  const state = context.data
  const storage = context.storage

  return {
    useLocalState,
    /**
     * Get context
     */
    data() {
      return state
    },
    /**
     * Watch for changes of a single state
     */
    get(key) {
      if(!isStr(key)) {
        throw new TypeError('The expected argument must be a string.')
      }
      return watch({[key]: undefined}, context)[key]
    },
    /**
     * Add state to the context without rerendering the current components
     */
    add(data) {
      if(data) {
        data = merge(state, data)
      }
      context.add(add)
    },
    /**
     * Create a middleware and dispatch
     */
    build(callback) {
      var promise = Promise.resolve(state)

      if(isFunc(callback)) {
        try {
          promise = Promise.resolve(callback())
        }
        catch(e) {
          promise = Promise.reject(e)
        }
      }
      return nextBuild(promise, (data) => dispatcher(merge(state, data)))
    },
    /**
     * Watch for state changes and update the current component with new state
     */
    useGlobalState(data) {
      if(isStr(data)) {
        throw new TypeError('The expected argument must be an object.')
      }
      return watch(data, context)
    },
    /**
     * Replace the entire state value instead of merging it with the new value.
     */
    async replace(data) {
      if(isFunc(data)) {
        data = await data(state)
      }
      dispatcher(data)
    },
    /**
     * Rerender without dispatching new state to the global context;
     * only the current component will receive the updated state.
     */
    async update(data) {
      if(isFunc(data)) {
        data = await data(state)
      }
      updateListeners(merge(state, data), context)

      return data
    },
    /**
     * Remove data from both persistent storage and global context
     */
    async remove(keys) {
      if(isStr(keys)) {
        keys = [keys]
      }
      storage.unset(keys)
      context.delete(keys)
      updateListeners(keys, context)
    },
    /**
     * Add data to the persistent storage
     */
    async persist(data) {
      if(isFunc(data)) {
        data = await data(state)
      }
      data = merge(state, data)

      if(storage) {
        storage.add(data)
      }
      return await dispatcher(data)
    },
    /**
     * Dispatch reducer or state
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

      return await dispatcher(data)
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
    add(obj) {
      return assign(data, obj)
    },
    delete(keys) {
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