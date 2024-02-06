import {ExtendedContext} from '@api/types/common'


/**
 * See vindo.json configuration from project
 * directory to see how this library included to the global context
 */
export default function({db}: ExtendedContext) {

  return {
    random(length = 20) {
      let o = ''
      let s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

      for(let i = 0; i < length; i++) {
        o += s.charAt(Math.floor(Math.random() * s.length))
      }
      return o
    },
  }
}