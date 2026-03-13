import Table from '../../components/table'


export default function({}:any) {
  return (
    <div id="pages">
      <Table
        columns={[
          'ID',
          'Title',
          'Type',
          'Status',
          'Updated',
        ]}
        resource={'Pages'}
      />
    </div>
  )
}