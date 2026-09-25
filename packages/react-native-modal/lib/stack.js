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
export const StackContainer = pure(({store, children}) => {
  const modal = store.get('modal')
  
  /**
   * Stact reducer
   */
  function reducer(items, {props}) {
    items[props.name] = props.component
    return items
  }
  
  const stack = Object.values(modal.stack)

  /**
   * Handles multiple layers of modals
   */
  return stack.map((current, key) => {
    return React.createElement(
      content,
      {
        key,
        current,
        items: children.reduce(reducer, {}),
        isOpen: key == (stack.length - 1) ? modal.isOpen : false,
      }
    )
  })
})