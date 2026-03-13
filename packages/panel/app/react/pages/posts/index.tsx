import Table from '../../components/table'


export default function({}:any) {
  return (
    <div id="posts">
      <Table
        columns={[
          'ID',
          'Title',
          'Category',
          'Status',
          'Updated',
        ]}
        resource={'Posts'}
      />
    </div>
  )
}