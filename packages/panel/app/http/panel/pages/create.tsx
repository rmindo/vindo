import Editor from '../../../react/pages/editor'


export default function({meta}:any) {
  meta.title = 'Create Page'
  meta.bundle = true

  const initial = {
    user: {},
    tags: [],
    author: 1,
    categories: []
  }
  return (
    <Editor name={'edit'} data={initial} action={'Create'} resource={'Pages'}/>
  )
}