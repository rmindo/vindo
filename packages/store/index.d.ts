/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */


declare module '@vindo/store' {
  type ConfigType = {
    watchlist?: {
      [key: string]: object | boolean | string | number
    }
    storage?: {
      key?: string
      engine: any
    }
    reducers?: object
  }
  type StoreType = {
    config?: ConfigType
  }
  export function pure(component:React.FC<any>)
  export function getContext()
  export function subscribe(initial?:any)
  export function configure(conf:ConfigType)
  export function Provider(props: StoreType & React.PropsWithChildren)
}

declare module '@vindo/store/state' {
  export default function(initialState:object):any
}