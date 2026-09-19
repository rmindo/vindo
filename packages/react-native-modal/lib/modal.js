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
export function get(name, {modal}) {
  return modal.stack[name]
}


/**
 * Open and add modal to stack
 */
export function open(data, {store, modal, event}) {

  if(typeof data == 'function') {
    data = data(store)
  }

  modal.isOpen = true
  modal.isClose = false

  data.openEventId = 'modal.open.' + data.name
  data.closeEventId = 'modal.close.' + data.name
  data.optionEventId = 'modal.option.' + data.name


  if(!data.data) {
    data.data = {}
  }

  if(!modal.stack[data.name]) {
    modal.stack[data.name] = data
  }
  /**
   * Let the modal dispatched first before emitting animation
   */
  setTimeout(() => {
    event.emit(data.openEventId)
  }, 0)

  store.dispatch({modal})
}


/**
 * Close top level modal
 */
export function close(data = {}, {store, event, modal}) {

  if(typeof data == 'function') {
    data = data(store)
  }
  
  modal.isOpen = false
  modal.isClose = true

  const keys = Object.keys(modal.stack)
  const values = Object.values(modal.stack)

  /**
   * Remove top modal
   */
  modal.stack = entries(
    keys.slice(0, -1).map(key => {
      return [key, modal.stack[key]]
    })
  )

  /**
   * Animate when closing
   */
  event.emit(values.at(-1).closeEventId)

  store.update({...data, modal})
}


/**
 * Modal option
 */
export function option(data = {}, {event, modal}) {
  event.emit(Object.values(modal.stack).at(-1).optionEventId, data)
}