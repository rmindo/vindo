declare module '@vindo/react' {
  export function server(): Function;
}

declare module '@vindo/react/store'
declare module '@vindo/react/event'
declare module '@vindo/react/request'
declare module '@vindo/react/client' {
  type DataType = {
    [key:string]: null | undefined | string | number | boolean | object | DataType
  }
  type ViewType = {
    path: string
    component: React.FC
  }
  type LinkPropsType = {
    href: string
    text?: string
    data?: object
    disabled?: boolean
    className?: string
    children?: React.ReactNode
  }
  
  export const Link: React.FC<LinkPropsType> & {
    back: (step: number) => void
    state: () => any
    reload: () => void
    redirect: (href: string) => void
    navigate: (href: string, data?: object) => void
  }

  export function useState(state?:DataType): any
  export function useStore(state?:DataType): any
  export function View(props:ViewType): JSX.Element
  export function Content(props:DataType): JSX.Element
  export function Provider(props:DataType): JSX.Element
}