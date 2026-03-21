import Http from 'http'

import type {Utility as UtilityNS} from '@vindo/utility'
import type {Exception as ExceptionNS} from '@vindo/exception'


/**
 * Dynamic type
 */
type DynamicType = {
  [key: string]: any
}

type UtilityType = typeof UtilityNS
type ExceptionType = typeof ExceptionNS


/**
 * Context
 */
export interface Context extends UtilityType {
  env: DynamicType
  meta: DynamicType
  vindo: DynamicType
}

/**
 * Core type definition
 */
declare module '@vindo/core' {

  interface Route {
    name: string
    path: string[]
    method: string
    args: DynamicType
    query: DynamicType
    params: DynamicType
    segments: string[]
    pathname: string
    basename: string
    extension: string | undefined
  }


  /**
   * Server
   */
  export interface Server extends Http.Server {
    use(middleware: Function): void
    run(dependencies?: Function, cb?: Function): void
  }
  export function start(cb?: Function): Server

  /**
   * Http Request
   */
  export interface HttpRequest extends Http.IncomingMessage, Route {
    body: DynamicType
    route: Route
    method: string
    cookies: {
      [key:string]: string
    }
    get(name:string): string
    is(basename:string | undefined): boolean
    isOrigin(): boolean
  }

  /**
   * Http Response
   */
  export interface HttpResponse extends Http.ServerResponse {
    status(code: number): void
    cookie(data: object): void
    headers(headers: object): void
    redirect(url: string): void
    json(body: object, code?: number, headers?: object): void
    html(body: string | null, code?: number, headers?: object): void
    print(body: string | null, code?: number, headers?: object): void
    eventStream(headers?: object): {
      write(data: object | string): void
    }
  }
  /**
   * Http Server
   */
  export interface HttpServer extends Http.Server {
    context: Context
    request: HttpRequest
    response: HttpResponse
    exception: ExceptionNS.OptionArgs
  }

  export const utility: UtilityType
  export const exception: ExceptionType
}


/**
 * Context type definition
 */
declare module '@vindo/core/context' {
  export function getctx(): Context
  export function getter(path:string, ctx:Context): DynamicType
  export function context(conf:DynamicType, inject:DynamicType): DynamicType
}
