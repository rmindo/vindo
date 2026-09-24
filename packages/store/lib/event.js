/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



/**
 * Default export
 */
export default Object.freeze({
  events: {},
  /**
   * Add event
   */
  on(name, listener) {
    if(!this.events[name]) {
      this.events[name] = new Set()
    }
    this.events[name].add(listener)
  },

  /**
   * Execute the event
   */
  emit(name, ...args) {
    const data = {}
    const event = this.events[name]

    if(event) {
      event.forEach(listener => {
        data[name] = listener(...args)
      })
    }
    return data[name]
  },

  /**
   * Remove event
   */
  remove(name) {
    if(this.events[name]) {
      delete this.events[name]
    }
  }
})