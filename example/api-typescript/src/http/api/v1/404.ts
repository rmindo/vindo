import {
  Request,
  Response
}
from '@api/types/common'


export default function(req: Request, res: Response) {
  res.result({
    error: 'This is a 404 error page specific for a certain directory.'
  }, 404)
}