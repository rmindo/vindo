import {parser} from '@vindo/body'
import {server, exception, Exception} from '@vindo/core'

import {
  Request,
  Response,
  ResponseResult,
  ExtendedContext
}
from '@api/types/common'


/**
 * A dummy database dependency to inject,
 * it could be any external packages you want.
 */
import Database from './database'


/**
 * Create server
 */
const api = server()

/**
 * Status Code
 */
const statuses: Exception.StatusType = {
  ...exception.statuses,
  200: {code: 200, message: 'Ok'},
  201: {code: 201, message: 'Created'}
}

/**
 * Body parser
 */
api.set(parser)

/**
 * Custom template
 */
api.set((req: Request, res: Response, next: Function) => {
  /**
   * API response template
   */
  res.result = function result(data: object | object[] | string[], code: number = 401) {

    if(code == 200) {
      if(!data || Object.keys(data).length == 0) {
        code = 401
      }
    }
    var json: ResponseResult = {
      status: code,
      result: data,
      message: statuses[code].message,
    }
    return res.json(json, json.status)
  }
  next()
})


/**
 * Run the api
 */
api.run(({env}: ExtendedContext) => {
  console.log(`Listening on port ${env.PORT}`)
  /**
   * Inject dependencies here
   */
  return {
    db: new Database(env.DATABASE_NAME),
  }
})