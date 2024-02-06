import {
  Request,
  Response
}
from '@api/types/common'


export default function(req: Request, res: Response) {
  res.json({error: '405 Method Not Allowed'}, 405)
}