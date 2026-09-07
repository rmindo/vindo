declare module '@vindo/react' {
  export function server(): Function;
}

declare module '@vindo/react/request'
declare module '@vindo/react/client' {
  type DataType = {
    [key:string]: string | number | boolean | object | DataType
  }
  type HttpType = {
    path?: string
    data?: DataType
  }
  type ViewType = {
    path: string
    component: React.FC
  }
  type HeaderType = {
    [key:string]: string
  }
  type LinkPropsType = {
    href: string
    text?: string
    disabled?: boolean
    children: React.ReactNode
  }
  type LinkType = React.FC<LinkPropsType> & {
    redirect: (href: string, text?: string) => void
  }

  export const http: {
    set(args:HttpType): Promise<object>
    get(...args:any): Promise<object>
    post(...args:any): Promise<object>
  }
  export const Link: LinkType

  export function useStore(name?:string): any
  export function useState(state?:DataType): any
  export function useContext(name?:string | null): any
  export function redirect(href:string, text?:string): void
  export function View(props:ViewType): JSX.Element
  export function Content(props:DataType): JSX.Element
  export function Provider(props:DataType): JSX.Element
}