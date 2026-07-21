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

  return React.createElement(View,
    {style: [{
        borderRadius: 20,
        width: screen.width,
        overflow: 'hidden',
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#fff',
      },
      state.containerStyle
    ]},
    React.createElement(children, {data})
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
 * @param {object} state 
 * @param {object} children 
 * @param {function} onPress
 */
function touchableClose(state, children, onPress) {
  return React.createElement(
    TouchableOpacity,
    {
      onPress,
      activeOpacity: 1,
      style: {
        width: screen.width,
        height: screen.height,
        paddingTop: state.autoHeight ? screen.height - state.contentHeight : state.offsetTop,
      }
    },
    children
  )
}


/**
 * Animate the content
 * 
 * @param {object} animate 
 * @param {object} children 
 */
function animatedContent(animate, children) {
  const style = {
    transform: [
      {translateY: animate.slide.value}
    ]
  }
  return React.createElement(Animated.View, {style, children})
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
  const state = useState({offsetTop: 20, contentHeight: 0}, data)


  const animate = useAnimation({
    fade: {value: isOpen ? 0 : 1},
    slide: {value: isOpen ? screen.height : 0},
  })
  

  React.useEffect(() => {
    /**
     * Close when pressing back button on android
     */
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      event.emit('modal.close')
    })

    return () => subscription.remove()
  }, [])


  React.useEffect(() => {
    /**
     * Start the animation when open
     */
    if(isOpen) {
      animate.fade.start(1, 800)
      animate.slide.start(0, 500) 
    }

    /**
     * Set modal option
     */
    event.on('modal.option', state.set)

    /**
     * Execute animation when modal.close() is emitted
     */
    event.on('modal.closing', () => {
      animate.fade.start(0, 1000)
      animate.slide.start(screen.height, 1000)
    })

  }, [animate.slide.value])
  

  /**
   * No feed when touching the content
   */
  const content = withoutFeedback(
    animatedContent(
      animate,
      contentView(state, items[state.name])
    ),
  )

  return animatedOverlay(
    animate,
    state.overlay,
    touchableClose(state, content, () => {
      event.emit('modal.close')
    })
  )
})
