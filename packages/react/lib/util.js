import runtime from 'react/jsx-runtime'


export const str = JSON.stringify
export const merge = Object.assign
export const isArr = Array.isArray



export function isEmpty(obj) {
  if(obj && Object.keys(obj).length == 0) {
    return true
  }
  return false
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


/**
 * Create function
 */
export function toFunc(name, {code, args = [], refs}) {
  var arr = ['return', 'function', name]

  if(args) {
    arr.push(
      `(${args.length ? args.join(',') : ''})`
    )
  }
  if(typeof code == 'string') {
    arr.push(`{${code}}`)
  }
  return new Function(...Object.keys(refs), arr.join(' '))(...Object.values(refs))
}


/**
 * Reduce object to necessary props
 * @param {array|object} children 
 */
export function reducer(children) {
  if(!children) {
    return []
  }
  if(!isArr(children)) {
    children = [children]
  }

  return children.map(({type, props}) => {
    var p = {}

    if(!props) {
      return
    }
    /**
     * Component function
     */
    if(isFunc(type)) {
      if(/^default_1/.test(type.name)) {
        throw new ReferenceError(`Component function requires a name. Currently have a default name of '${type.name}'.`)
      }
      type = [type.name]
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isArr(v)) {
        p.children = v.map((v) => {
          if(isObj(v)) {
            return reducer(v)[0]
          }
          return v
        })
      }
      if(isObj(v)) {
        if(i == 'style') {
          p.style = v
        }
        if(i == 'children') {
          p.children = reducer(v)
        }
      }
      if(isFunc(v)) {
        var f = v.toString()
        var m = [
          ...f.matchAll(/\((.*)\)(\s{|\s=>\s{|{)((.|\n)*)\}/g)
        ][0]
        p[i] = {
          name: i,
          mouseevent: true,
          code: m[3].trim(),
          args: m[1].split(',').filter(v => v),
          refs: ['state','meta']
        }
      }
    }

    return {type, props: p}
  })
}


/**
 * Transform back to react object
 */
export function transform(children, data) {
  if(!children) {
    return
  }
  if(!isArr(children)) {
    children = [children]
  }

  return children.map(({type, props}, key) => {
    var p = {}

    if(!props) {
      return
    }
    if(isArr(type)) {
      const key = type[0]
      type = data[key]
      if(!type) {
        throw TypeError(`Cannot read property '${key}'.`)
      }
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isObj(v)) {
        if(i == 'style') {
          p.style = v
        }
        if(i == 'children') {
          p.children = transform(v, data)
        }
        if(v.mouseevent) {
          p[i] = toFunc(v.name, {
            args: v.args,
            code: v.code,
            refs: data.refs
          })
        }
      }
      if(isArr(v)) {
        p.children = v.map((i) => {
          if(isObj(i)) {
            return transform(i, data)
          }
          return i
        })
      }
    }

    return runtime[Array.isArray(p.children) ? 'jsxs' : 'jsx'](type, p, key)
  })
}