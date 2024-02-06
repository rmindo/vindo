declare module '@vindo/body' {
  export function parser(req: Request, res: any, next: Function): void;
}