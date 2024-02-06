import {
  Request,
  Response
}
from '@api/types/common'


/**
 * Path: http://localhost:3000/api
 */
export function GET(req: Request, res: Response) {
  res.json({
    version: '1.0'
  })
}