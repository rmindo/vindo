import {
  Request,
  Response
}
from '@api/types/common'


export default function(this:any, req: Request, res: Response) {
  const except = this.exception

  if(except.data) {
    res.result(except.data, except.code)
  }
  else {
    res.result({error: 'Unknown'}, except.code)
  }
}