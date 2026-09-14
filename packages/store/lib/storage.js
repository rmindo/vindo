/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



export default function(storage = {}) {
  if(!storage.key) {
    storage.key = 'local:store'
  }

  
  /**
   * Get data
   * @param {function} cb 
   */
  storage.data = function data(cb) {
    if(cb) {
      return storage.get(storage.key)?.then(cb)
    }
  }


  /**
   * Remove data
   * @param {string} name 
   */
  storage.remove = function remove(name) {
    if(storage.engine) {
      storage.engine.removeItem(name)
    }
  }


  /**
   * Get data
   * @param {string} name 
   */
  storage.get = function get(name) {
    if(!storage.engine) {
      return
    }
    const item = storage.engine.getItem(name)

    if(!item?.then) {
      return new Promise((resolve) => {
        resolve(
          JSON.parse(item)
        )
      })
    }
    return item.then(data => JSON.parse(data))
  }


  /**
   * Add data
   * @param {string} name 
   * @param {object} data
   */
  storage.set = function set(name, data) {
    if(!storage.engine) {
      return
    }

    storage.get(name)?.then((store) => {
      if(storage.key !== name) {
        store = data
      }
      else {
        if(!store) {
          store = {}
        }
        store = Object.assign(store, data)
      }
      storage.engine.setItem(name, JSON.stringify(store))
    })
  }

  return storage
}
