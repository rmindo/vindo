/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



const keys = Object.keys
const values = Object.values
const entries = Object.fromEntries



export const stack = {}
export const isOpen = false
export const isClose = true


/**
 * Get current modal
 */
export function get(name, store) {
  return store.modal.stack[name]
}


/**
 * Open and add modal to stack
 */
export function open(data, store) {
  const event = store.event
  const modal = store.modal


  if(typeof data == 'function') {
    data = data(store)
  }

  if(!data.data) {
    data.data = {}
  }


  store.build(() => {
    data.openEventId = 'modal.open.' + data.name
    data.closeEventId = 'modal.close.' + data.name
    data.optionEventId = 'modal.option.' + data.name

    return data
  })
  .deploy((data) => {
    modal.isOpen = true
    modal.isClose = false

    modal.stack[data.name] = data
    
    modal.current = values(modal.stack).at(-1)

    return {modal}
  })
  .delay(100, () => {
    event.emit(data.openEventId)
  })
}


/**
 * Close top level modal
 */
export function close(data = {}, store) {
  const event = store.event
  const modal = store.modal

  if(typeof data == 'function') {
    data = data(store)
  }

  modal.isOpen = false
  modal.isClose = true
  modal.current = values(modal.stack).at(-1)
  /**
   * Remove top modal
   */
  modal.stack = entries(
    keys(modal.stack).slice(0, -1).map(key => {
      return [key, modal.stack[key]]
    })
  )

  event.emit(modal.current.closeEventId, {...data, modal})
}


/**
 * Remove all opened modals
 */
export function closeAll(data = {}, store) {
  const modal = store.modal
  const event = store.event

  if(typeof data == 'function') {
    data = data(store)
  }

  modal.isOpen = false
  modal.isClose = true
  modal.current = values(modal.stack).at(-1)

  /**
   * Remove top modal
   */
  store.build(() => {
    event.emit(modal.current.closeEventId)
  })
  .delay(100, () => {
    modal.stack = {}
    store.update({...data, modal})
  })
  
}


/**
 * Modal option
 */
export function option(data = {}, store) {
  store.event.emit(store.modal.current.optionEventId, data)
}