import {exception} from '@vindo/core'
import {
  Request,
  Response,
  ExtendedContext
}
from '@api/types/common'


/**
 * Path: http://localhost:3000/api/v1/users/1
 */
export async function GET(req: Request, res: Response, {db}: ExtendedContext) {

  const args = {
    uid: req.params.uid,
  }
  const user = await db.read('users', args)

  if(user) {
    res.result(user, 200)
  }
  else {
    const error = {
      data: {
        error: 'No record found.'
      }
    }
    throw new exception.NotFoundException(error, false)
  }
}



/**
 * Path: http://localhost:3000/api/v1/users/1/photo
 */
export function photo(req: Request, res: Response) {
  return {
    GET() {
      res.result({photo: true}, 200)
    }
  }
}