declare module '@vindo/react' {
  export function server(): Function;
}

declare module '@vindo/react/request'
declare module '@vindo/react/client' {
  type DataType = {
    [key:string]: string | number | boolean
  }
  type HeaderType = {
    [key:string]: string
  }
  export const http: {
    set(args:{data?: DataType, path?: string}): Promise<object>
    get(...args:any): Promise<object>
    post(...args:any): Promise<object>
  }
  export function useStore(name?:string): any
  export function useState(state:{[key:string]: any}): any
  export function useContext(): any
  export function Link(props:any): any
  export function View(props:any): any
  export function Content(props:any): any
  export function Provider(props:any): any
}