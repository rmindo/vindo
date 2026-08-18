/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



const keys = Object.keys
const assign = Object.assign
const entries = Object.fromEntries


/**
 * Modal properties
 */
export default function({event, store}) {
  const modal = {}
  const initialValue = {
    stack: {},
    isOpen: false,
    isClose: true,
  }


  event.on('modal.close', (data) => {
    if(typeof data == 'function') {
      data = data(store)
    }

    store.modal.isOpen = false
    store.modal.isClose = true

    /**
     * Remove top modal
     */
    store.modal.stack = entries(
      keys(store.modal.stack).slice(0, -1).map(key => [key, store.modal.stack[key]])
    )
    /**
     * Dispatch with updated stack
     */
    store.dispatch({
      ...data,
      modal: store.modal
    })
    event.emit('modal.closing')
  })
  

  /**
   * Get current modal
   */
  modal.get = function get(name) {
    return store.modal.stack[name]
  }

  
  /**
   * Open and add modal to stack
   */
  modal.open = function open(arg) {
    if(typeof arg == 'function') {
      arg = arg(store)
    }

    store.modal.isOpen = true
    store.modal.isClose = false

    if(!arg.data) {
      arg.data = {}
    }
    if(!store.modal.stack[arg.name]) {
      store.modal.stack[arg.name] = arg
    }

    store.dispatch({modal: store.modal})
  }


  /**
   * Close top level modal
   */
  modal.close = function close(data = {}) {
    event.emit('modal.close', data)
  }


  /**
   * Modal option
   */
  modal.option = function option(data = {}) {
    event.emit('modal.option', data)
  }

  return assign(initialValue, store.modal, modal)
}

