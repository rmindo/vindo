import {exception} from '@vindo/core'
import {
  Request,
  Response,
  ExtendedContext
}
from '@api/types/common'



/**
 * Path: http://localhost:3000/api/v1/users
 */
export async function GET(req: Request, res: Response, {db}: ExtendedContext) {
  const data = await db.read('users', {}, true)

  if(data) {
    res.result(data, 200)
  }
}


/**
 * Path: http://localhost:3000/api/v1/users
 */
export async function POST(req: Request, res: Response, {db, auth, object}: ExtendedContext) {
  const data = {
    ...req.body,
    uid: auth.random()
  }
  const user = await db.create('users', data)

  if(object.has('username', req.body)) {
    res.result(user, 201)
  }
  else {
    const error = {
      data: {
        error: 'Missing required fields.'
      }
    }
    throw new exception.BadRequestException(error, false)
  }
}