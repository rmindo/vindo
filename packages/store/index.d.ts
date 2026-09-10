/*
 * @vindo/store
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */


declare module '@vindo/store' {
  type ReducerType = {
    [key: string]: Function | object | boolean | string | ReducerType
  }
  type StoreType = {
    config?: ConfigType
  }
  type ConfigType = {
    storage?: {
      key?: string
      engine: any
      persist?: string[]
    },
    reducers?: ReducerType
  }
  export function pure(component:React.FC<any>)
  export function useContext()
  export function configure(conf:ConfigType)
  export function Provider(props: StoreType & React.PropsWithChildren)
}

declare module '@vindo/store/state' {
  export default function(initialState:object):any
}