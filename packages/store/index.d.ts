/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */


declare module '@vindo/store' {
  type ConfigType = {
    storage?: {
      key?: string
      engine: any
    }
    context?: {
      [key: string]: object | boolean | string | number | Function
    }
    reducers?: {
      [key: string]: object
    }
  }
  export function pure(component:React.FC<any>)
  export function getState(key?:string)
  export function configure(config:ConfigType)
  export function Provider(props: React.PropsWithChildren)
}

declare module '@vindo/store/state' {
  export default function(initialState:object):any
}