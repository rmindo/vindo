declare module '@vindo/react' {
  export const HTTPResponse: {
    get(cb:Function): void
    post(cb:Function): void
  }
  export function server(): Function;
}

declare module '@vindo/react/client' {
  export const http:any;
  export function View(props): any;
  export function Hydrate(props): any;
  export function HydrateContent(props): any;
}