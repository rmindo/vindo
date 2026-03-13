import {DateTimeInterface} from '../interface/common'


/**
 * Text to pathname
 * @param str
 * @returns {string}
 */
export function toPath(str: string) {
  return str.replace(/\s/g, '-').replace(/(?!-|\/)([\W])/g, '').toLowerCase()
}

/**
 * Page and post path
 * @param path The path as array
 * @returns {string}
 */
export function createPath(path: string[]) {
  return toPath([''].concat(path.filter(v => v)).join('/'))
}


/**
 * Active menu
 * @param item 
 * @param name 
 */
export function isActive(item, name) {
  if(item.name) {
    const path = toPath(item.name)
    if(path) {
      if(item.root === name || path === name) {
        return 'active'
      }
    }
  }
}


/**
 * Make path
 */
export function makePath(item) {
  if(item.root) {
    return createPath([item.root])
  }
  if(item.name) {
    return createPath(['panel', item.name])
  }
  return ''
}



/**
 * Limit the words
 * @param words 
 * @param limit 
 * @returns {string}
 */
export function sliceWords(words: string, limit = 20) {
  if(words) {
    return words.split(/\s/g).slice(0, limit).join(' ')
  }
  return words
}

/**
 * Format date
 * @param ts 
 */
export function datetime(ts: number): DateTimeInterface {
  var today: Date = new Date()
  var date: Date = new Date(ts)
 

  return {
    date,
    today, 
    /**
     * Get day of the week
     * @example Sat
     */
    getDay() {
      return date.toDateString().substring(0,3)
    },

    /**
     * Get date
     * @example Jul 2 2023
     */
    getDate() {
      return date.toDateString().substring(4)
    },

    /**
     * Get time without senconds
     * @example 04:20 AM
     */
    getTime() {
      return date.toLocaleTimeString().replace(/:(\d+)\s/g, ' ')
    },
    
    /**
     * Get formatted full date and time
     * @example Sat, Jul 2 2023 at 5:41 PM
     */
    getDateTime() {
      return this.getFullDateTime().slice(5)
    },
    
    /**
     * Get formatted full date
     * @example Sat, Jul 2 2023
     */
    getFullDate() {
      return date.toDateString().replace(/^(\w+)\s(\w+)(\s0){1}/g, '$1, $2 ')
    },
    
    /**
     * Get formatted full date and time
     * @example Sat, Jul 2 2023 at 5:41 PM
     */
    getFullDateTime(div = 'at') {
      return `${this.getFullDate()} ${div} ${this.getTime()}`
    },
  }
}