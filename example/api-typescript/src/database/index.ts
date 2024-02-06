/**
 * Dummy data
 */
const data = [
  {
    "age": 21,
    "firstname": "John",
    "lastname": "Doe",
    "birthday": "Jan 20, 1979",
    "photo": "http://localhost:3000/photos/jdoe.jpg"
  },
  {
    "age": 20,
    "firstname": "Jane",
    "lastname": "Doe",
    "birthday": "Jun 20, 1980",
    "photo": "http://localhost:3000/photos/jdoe.jpg"
  }
]

/**
 * Dummy database CRUD operation that will be going to inject
 */
export default class Database {

  constructor(name: string) {}

  read(name: string, args: any, bulk?: boolean) {
    if(bulk) {
      return data
    }
    if(args.uid) {
      if(args.uid > 0) {
        return data[args.uid-1]
      }
    }
  }

  create(name: string, data: object) {
    return data
  }

  update() {}
  delete() {}
}