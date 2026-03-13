import {useState} from '@vindo/react/client'


export default function Radio() {
  var state = useState({check: false})

  return (
    <span
      className={state.check ? 'radio checked' : 'radio'}
      onClick={() => {
        state.set({check: state.check ? false : true})
      }}>
      {state.check && (
        <i className={'icon-check'}></i>
      )}
    </span>
  )
}
