type CheckProps = {
  label?: any,
  space?: number,
  checked?: boolean,
  onClick?: Function
}

export default function Check({checked = false, label, space = 10, onClick}: CheckProps) {
  return (
    <span
      className={'checkbox'}
      onClick={() => {
        if(onClick) {
          onClick(checked ? false : true)
        }
      }}>
      <span
        className={checked ? 'check checked' : 'check'}>
        {checked && (
          <i className={'icon-check'}></i>
        )}
      </span>
      {label && (
        <span className={'label'} style={{marginLeft: space}}>{label}</span>
      )}
    </span>
  )
}
