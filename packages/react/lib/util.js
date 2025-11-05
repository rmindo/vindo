import runtime from 'react/jsx-runtime'


export const str = JSON.stringify
export const merge = Object.assign
export const isArr = Array.isArray


export function has(val) {
  if(isObj(val) && Object.keys(val).length > 0) {
    return val
  }
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

    if(isArr(type)) {
      type = data[type[0]]
    }

    for(var i in props) {
      var v = props[i]

      if(isStr(v) || isNum(v)) {
        p[i] = v
      }
      if(isObj(v)) {
        if(i == 'children') {
          p.children = transform(v, data)
        }
        else {
          if(v.mouseevent) {
            p[i] = toFunc(v.name, {
              args: v.args,
              code: v.code,
              refs: data.refs
            })
          }
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

    return runtime.jsx(type, p, key)
  })
}