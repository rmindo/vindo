/*
 * @vindo/react-native-modal
 * Copyright(c) 2026 Ruel Mindo
 * MIT Licensed
 */


declare module '@vindo/react-native-modal' {
  export default function(arg:any):any
}


declare module '@vindo/react-native-modal/stack' {
  export function Stack(props:{name?: string, children?:any, component?:any}):JSX.Element
  export function StackContainer(props:{children?: any}):JSX.Element
}