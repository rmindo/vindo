
import {
  Context,
  HttpRequest,
  HttpResponse,
}
from '@vindo/core'


export interface Database {
  read(name: string, opt: object, bulk?: boolean): object;
  create(name: string, data: object): object;
  update(): object;
  delete(): object;
}

export interface ResponseResult {
  status?: number;
  result?: object | object[] | string[];
  message?: string;
}
export interface Request extends HttpRequest {}
export interface Response extends HttpResponse {
  result(data: object, code: number): void;
}


export interface ExtendedContext extends Context {
  auth: {
    random(length?: number): string
  }
  db: Database
}
