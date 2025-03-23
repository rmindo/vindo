declare module '@vindo/static' {

  export const fs: any
  export const path: any
  export const mime: any

  export function serve(option: object): Function;
}