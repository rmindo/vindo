declare module '@vindo/react' {
  export function server(): Function;
}

declare module '@vindo/react/request'
declare module '@vindo/react/client' {
  type DataType = {
    [key:string]: string | number | boolean | object | DataType
  }
  type ViewType = {
    path: string
    component: React.FC
  }
  type LinkPropsType = {
    href: string
    text?: string
    disabled?: boolean
    children: React.ReactNode
  }
  
  export const Link: React.FC<LinkPropsType> & {
    back: (step: number) => void
    redirect: (href: string, text?: string) => void
  }

  export function useState(state?:DataType): any
  export function useContext(name?:string | null): any
  export function View(props:ViewType): JSX.Element
  export function Content(props:DataType): JSX.Element
  export function Provider(props:DataType): JSX.Element
}