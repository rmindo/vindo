import Pages from '../../../react/pages/pages'


export default function({meta}:any) {
  meta.title = 'Pages'
  meta.bundle = true

  return (
    <Pages name="pages"/>
  )
}