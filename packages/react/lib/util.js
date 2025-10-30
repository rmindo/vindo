
export function str(val) {
  return JSON.stringify(val)
}

export function has(val) {
  if(isObj(val) && Object.keys(val).length > 0) {
    return val
  }
}

export function isArr(val) {
  return Array.isArray(val)
}

export function isMore(val) {
  return isObj(val) || val == undefined ? 'jsx' : 'jsxs'
}

export function isNum(val) {
  return val && typeof val === 'number' && {}.toString.call(val) === '[object Number]'
}

export function isStr(val) {
  return val && typeof val === 'string' && {}.toString.call(val) === '[object String]'
}

export function isFunc(val) {
  return val && typeof val === 'function' && {}.toString.call(val) === '[object Function]'
}

export function isObj(val) {
  return val && typeof val === 'object' && val.constructor === Object && Object.prototype === Object.getPrototypeOf(val)
}