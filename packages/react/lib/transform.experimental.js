import {has, str, isObj, isArr, isStr, isFunc, isMore} from '@vindo/react/util'




function transform({key, type, props:{children:child, ...props}}) {
  var children = ''
  
  if(isStr(child)) {
    children += `children: ['${child}']`
  }

  if(isObj(child)) {
    children += `children: ${transform(child)}`
  }

  if(isArr(child)) {
    var c = []
    
    for(var k in child) {
      var v = child[k]
      if(v) {
        if(isStr(v)) {
          c.push(`'${v}'`)
        }
        else {
          c.push(transform({...v, key: k}))
        }
      }
    }
    children += `children: [${c.join(',')}]`
  }

  var name = `'${type}'`
  if(isFunc(type)) {
    name = `chunk['${type.name}']`
  }

  var p = []
  if(has(props)) {
    for(var i in props) {
      var v = props[i]
      if(isStr(v)) {
        p.push(`${i}: '${v}'`)
      }
      if(isObj(v)) {
        p.push(`${i}: ${str(v)}`)
      }
      if(isFunc(v)) {
        p.push(`${i}: ${v.toString()}`)
      }
    }
  }
  p.push(children)

  return `${isMore(child)}(${name}, {${p.join(',')}}, ${key})`
}


module.exports = function(children) {
  if(!children) {
    return
  }
  if(!isArr(children)) {
    children = [children]
  }

  var str = ''
  for(var child of children) {
    if(typeof child.type == 'string') {
      str += `${transform(child)},`
    }
  }
  return `export default function(chunk, {jsx, jsxs}) {return [${str}]}`
}