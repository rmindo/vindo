import {
  Request,
  Response
}
from '@api/types/common'


export function get(req: Request, res: Response) {
  res.json({error: 'Internal Server Error'}, 500)
}