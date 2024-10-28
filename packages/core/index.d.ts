import Http from 'http'

export {Utility} from '@vindo/utility'
export {Exception} from '@vindo/exception'

import type {Utility as UtilityNamespace} from '@vindo/utility'
import type {Exception, Exception as ExceptionNamespace} from '@vindo/exception'


/**
 * Dynamic type
 */
type DynamicAnyType = {
  [key: string]: any;
}
type DynamicStringType = {
  [key: string]: string;
}

type UtilityType = typeof UtilityNamespace;
type ExceptionType = typeof ExceptionNamespace;

/**
 * Configuration
*/
export interface Configuration {
  port?: number;
}

/**
 * Context
 */
export interface Context extends UtilityType {
  lib: DynamicAnyType;
  env: DynamicStringType;
  exert: DynamicStringType;
}
export const utility: UtilityType;
export const exception: ExceptionType;


/**
 * Server
 */
export interface Server extends Http.Server {
  set(middleware: Function): void;
  run(dependencies?: Function, cb?: Function): void;
}
export function server(config?: Configuration | Function): Server;


/**
 * Http Request
 */
export interface HttpRequest extends Http.IncomingMessage {
  body: DynamicAnyType;
  query: DynamicAnyType;
  params: DynamicStringType;
  route: {
    path: string;
    query: DynamicAnyType;
    rerouted: boolean;
    segments: string[];
    pathname: string;
    basename: string;
    extension: string | undefined;
  };
  basename: string;
  pathname: string;
  extension: string | undefined;
  is(basename:string): boolean;
}

/**
 * Http Response
 */
export interface HttpResponse extends Http.ServerResponse {
  status(code: number): void;
  headers(headers: object): void;
  redirect(url: string): void;
  json(body: object, code?: number, headers?: object): void;
  html(body: string | null, code?: number, headers?: object): void;
  print(body: string | null, code?: number, headers?: object): void;
}

/**
 * Http Server
 */
export interface HttpServer extends Http.Server {
  context: Context;
  request: HttpRequest;
  response: HttpResponse;
  exception: Exception.OptionArgs,
}