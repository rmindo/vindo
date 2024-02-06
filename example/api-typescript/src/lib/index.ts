import {ExtendedContext} from '@api/types/common'


/**
 * See vindo.json configuration from project
 * directory to see how this library included to the global context
 */
export default function({auth}: ExtendedContext) {

  return {
    random(length?: number) {
      return auth.random(length)
    }
  }
}