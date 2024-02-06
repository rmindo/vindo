import {
  Request,
  Response,
  ExtendedContext
}
from '@api/types/common'



/**
 * Export as default with aggregated routes using object literal.
 */
export default function(ctx: ExtendedContext) {
  return {
    /**
     * Path: http://localhost:3000/api/v1/photos
     */
    GET(req: Request, res: Response) {
      const photos = [
        'http://localhost:3000/photos/photo1.jpg',
        'http://localhost:3000/photos/photo2.jpg',
        'http://localhost:3000/photos/photo3.jpg',
        'http://localhost:3000/photos/photo4.jpg',
      ]
      res.result(photos, 200)
    },

    /**
     * Path: http://localhost:3000/api/v1/users/1/photos
     */
    POST(req: Request, res: Response) {
      res.result({}, 200)
    },

    /**
     * Path: http://localhost:3000/api/v1/users/1/photos/upload
     */
    async upload(req: Request, res: Response) {
      return {
        async POST() {
          res.result({uploaded: true}, 201)
        },
      }
    }
  }
}