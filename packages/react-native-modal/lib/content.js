/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */

'use strict'



import React from 'react'
import {pure} from '@vindo/store'
import useState from '@vindo/store/state'

/**
 * React Native Components
 */
 import {
  Text,
  View,
  Easing,
  Animated,
  Dimensions,
  BackHandler,
  TouchableOpacity,
  TouchableWithoutFeedback,
}
from 'react-native'


/**
 * Screen size
 */
const screen = Dimensions.get('screen')

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
          borderRadius: 20,
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
 * @param {object} animate 
 * @param {boolean} overlay 
 * @param {object} children
 */
function animatedOverlay(animate, overlay, children) {
  return React.createElement(Animated.View,
    {
      style: {
        top: 0,
        bottom: 0,
        zIndex: 1,
        elevation: 1,
        position: 'absolute',
        width: screen.width,
        height: screen.height,
        opacity: animate.fade.value,
        backgroundColor: overlay ?? 'rgba(0,0,0,0.6)',
      }
    },
    children
  )
}



/**
 * Modal content
 */
export default pure(({data, store, isOpen, event, items}) => {
  const state = store.state(data)

  const animate = useAnimation({
    fade: {value: isOpen ? 0 : 1},
    slide: {value: isOpen ? screen.height : 0},
  })
  
  /**
   * Set listen to events
   */
  event.on('modal.option', state.set)
  event.on('modal.closing', () => {
    animate.fade.start(0, 1000)
    animate.slide.start(screen.height, 1000)
  })

  /**
   * Start the animation when its open
   */
  React.useEffect(() => {
    if(isOpen) {
      animate.fade.start(1, 800)
      animate.slide.start(0, 500) 
    }
  }, [animate.slide.value])
  

  return animatedOverlay(
    animate,
    state.overlay,
    touchableClose(
      animate,
      function() {
        event.emit('modal.close')
      },
      contentView(state, items[state.name])
    )
  )
})
