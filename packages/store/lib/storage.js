/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



export default function(storage) {
  const key = storage?.key
  const engine = storage?.engine
  const persist = storage?.persist


  function data(cb) {
    get(key)?.then(cb)
  }

  function remove(name) {
    if(engine) {
      engine.removeItem(name)
    }
  }

  function get(name) {
    if(engine) {
      return engine.getItem(name).then(data => JSON.parse(data))
    }
  }

  function set(name, data) {
    get(name)?.then((root) => {
      if(key !== name) {
        root = data
      }
      else {
        if(!root) {
          root = {}
        }
        for(var i in data) {
          if(persist.includes(i)) {
            root[i] = data[i]
          }
        }
      }
      engine.setItem(name, JSON.stringify(root))
    })
  }

  return {key, get, set, data, remove}
}
