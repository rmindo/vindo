import Http from 'http'

import type {Utility as UtilityNS} from '@vindo/utility'
import type {Exception as ExceptionNS} from '@vindo/exception'


/**
 * Dynamic type
 */
type DynamicType = {
  [key: string]: number | string | boolean | object | DynamicType
}
type DynamicAnyType = {
  [key: string]: any
}
type DynamicStringType = {
  [key: string]: string
}

type UtilityType = typeof UtilityNS
type ExceptionType = typeof ExceptionNS


interface Route {
  back: boolean
  name: string
  path: string[]
  method: string
  args: DynamicAnyType
  query: DynamicAnyType
  params: DynamicAnyType
  exported: boolean
  segments: string[]
  pathname: string
  basename: string
  extension: string | undefined
}


/**
 * Configuration
*/
export interface Configuration {
  port?: number
  meta?: DynamicType
  exert?: DynamicType
  env?: DynamicStringType
  include?: DynamicStringType
}

/**
 * Server
 */
export interface Server extends Http.Server {
  set(middleware: Function): void
  run(dependencies?: Function, cb?: Function): void
}
export function server(config?: Configuration): Server

/**
 * Http Request
 */
export interface HttpRequest extends Http.IncomingMessage, Route {
  body: DynamicAnyType
  route: Route
  get(name:string): string
  is(basename:string | undefined): boolean
  root(): boolean
}

/**
 * Http Response
 */
export interface HttpResponse extends Http.ServerResponse {
  status(code: number): void
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
 * Context
 */
export interface Context extends UtilityType {
  lib: DynamicAnyType
  env: DynamicStringType
  exert: DynamicStringType
  request: HttpRequest
  response: HttpResponse
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

export type Utility = UtilityNS
export type Exception = ExceptionNS