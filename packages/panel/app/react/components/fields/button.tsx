type Props = {
  type: number,
  icon: string,
  label: string,
  style?: object,
  loading: string,
  spinner?: string,
  onClick: Function,
  disabled?: boolean,
}

export default function Button({spinner = 'cog', ...props}: Props) {
  return (
    <button
      style={props.style}
      disabled={props.disabled}
      className={`button-${props.type}`}
      onClick={() => {
        props.onClick()
      }}>
      {props.loading ? (
        <span className="spinner">
          <i className={`icon-${spinner}`}/>
        </span>
      ):(
        <i className={`icon-${props.icon}`}/>
      )}
      <span>{props.label}</span>
    </button>
  )
}
