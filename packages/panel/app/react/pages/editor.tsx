import Editor from '../components/editor'


export default function({data, action, resource}:any) {
  return (
    <Editor data={data} action={action} resource={resource}/>
  )
}