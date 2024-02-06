import {
  Request,
  Response
}
from '@api/types/common'


export default function(req: Request, res: Response) {
  res.json({error: 'Unauthorized'}, 401)
}