declare module '@vindo/static' {
  export function type(ext: string): string;
  export function serve(path: string): Function;
}