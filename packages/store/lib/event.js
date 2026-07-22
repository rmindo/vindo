/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



const events = {}

/**
 * Default export
 */
export default Object.freeze({
  /**
   * Add event
   */
  on(name, cb) {
    events[name] = {type: 'on', event: cb}
  },

  /**
   * Execute the event
   */
  emit(name, ...data) {
    if(events[name]) {
      events[name].event.call({}, ...data)
    }
  },

  /**
   * Remove event
   */
  remove: (name) => delete events[name]
})