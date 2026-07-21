/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'
import {pure} from '@vindo/store'

/**
 * Modal content
 */
import content from './content'


/**
 * Modal stack
 */
export function Stack() {}


/**
 * Modal container
 */
export const StackContainer = pure(({store, event, children}) => {

  if(!store.modal) {
    return null
  }
  const stack = Object.values(store.modal.stack)

  /**
   * Stact reducer
   */
  function reducer(items, {props}, index) {
    items[props.name] = props.component
    return items
  }

  /**
   * Handles multiple layers of modals
   */
  return stack.map((data, key) => {
    return React.createElement(
      content,
      {
        key,
        data,
        items: children.reduce(reducer, {}),
        isOpen: key == (stack.length - 1) ? store.modal.isOpen : false,
      }
    )
  })
})