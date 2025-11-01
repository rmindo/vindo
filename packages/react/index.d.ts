declare module '@vindo/react' {
  export function server(): Function;
}

declare module '@vindo/react/context'
declare module '@vindo/react/client' {
  type DataType = {
    [key:string]: string | number | boolean
  }
  type HeaderType = {
    [key:string]: string
  }
  export const state: {
    set(args:{data?: DataType, path?: string}): Promise<object>
    get(args:{data?: DataType, path?: string, headers?: HeaderType}): Promise<object>
    post(args:{data?: DataType, path?: string, headers?: HeaderType}): Promise<object>
  }
  export function context(): any
  export function Link(props:any): any
  export function View(props:any): any
  export function Content(props:any): any
  export function Provider(props:any): any
}