/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'
import {pure} from '@vindo/store'

/**
 * React Native Components
 */
 import {
  View,
  Easing,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
}
from 'react-native'


/**
 * Screen size
 */
const screen = Dimensions.get('screen')


/**
 * Modal content
 */
export default pure(({store, isOpen, event, items, modal, current}) => {
  const state = store.useLocalState(current)

  const animate = useAnimation({
    fade: {value: isOpen ? 0 : 1},
    slide: {value: isOpen ? screen.height : 0},
  })

  /**
   * Modal option
   */
  event.on(current.optionEventId, state.set)
  
  /**
   * Animate when opening
   */
  event.on(current.openEventId, () => {
    animate.fade.start(1, 800)
    animate.slide.start(0, 500)
  })

  /**
   * Animate when closing
   */
  event.on(current.closeEventId, (data) => {
    store.build(() => {
      animate.fade.start(0, 1000)
      animate.slide.start(screen.height, 1000)
    })
    .delay(200, () => {
      if(data) {
        store.dispatch(data)
      }
    })
  })


  return animatedOverlay(
    animate,
    state,
    touchableClose(
      animate,
      modal.close,
      contentView(state, items[state.name])
    )
  )
})


/**
 * Custom animation
 * 
 * @param {object} data
 */
function useAnimation(data) {

  for(var i in data) {
    const item = data[i]
    
    item.value = new Animated.Value(item.value)
    /**
     * Animation
     * @param toValue Starting point of the animation
     * @param duration Time duration in milliseconds
     */
    item.start = function start(toValue, duration) {
      const option = {
        toValue,
        duration,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp)
      }
      Animated.timing(item.value, option).start()
    }
  }

  return data
}



/**
 * Render the content
 * 
 * @param {object} state
 * @param {object} children 
 */
function contentView(state, children) {
  const {data} = state.data()

  if(!children) {
    return null
  }

  return withoutFeedback(
    React.createElement(View,
      {style: [{
          bottom: 0,
          borderRadius: 15,
          width: screen.width,
          overflow: 'hidden',
          position: 'absolute',
          alignSelf: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        },
        state.containerStyle
      ]},
      React.createElement(children, {data})
    )
  )
}


/**
 * Disable feedback when touching the content
 * 
 * @param {object} children 
 */
function withoutFeedback(children) {
  return React.createElement(TouchableWithoutFeedback, {children})
}


/**
 * Close when touching the overlay
 * 
 * @param {function} animate
 * @param {object} onPress
 * @param {object} content
 */
function touchableClose(animate, onPress, content) {
  return React.createElement(
    TouchableOpacity,
    {
      onPress,
      activeOpacity: 1,
      style: {
        width: screen.width,
        height: screen.height,
        transform: [
          {translateY: animate.slide.value}
        ],
      }
    },
    content
  )
}


/**
 * Animate the overlay holder
 * 
 * @param {number} animate 
 * @param {boolean} state 
 * @param {object} children
 */
function animatedOverlay(animate, state, children) {
  return React.createElement(Animated.View,
    {
      style: [{
        top: 0,
        bottom: 0,
        zIndex: 1,
        elevation: 1,
        position: 'absolute',
        width: screen.width,
        height: screen.height,
        opacity: animate.fade.value,
        backgroundColor: 'rgba(0,0,0,0.6)',
      },
      state.overlayStyle]
    },
    children
  )
}
