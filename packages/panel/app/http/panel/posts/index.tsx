import Posts from '../../../react/pages/posts'



export default function({meta}:any) {
  meta.title = 'Posts'
  meta.bundle = true

  return (
    <Posts name="posts"/>
  )
}