import {
  Request,
  Response
}
from '@api/types/common'


/**
 * Path: http://localhost:3000/
 */
export function GET(req: Request, res: Response) {
  res.json({
    greetings: 'Hello World.'
  })
}