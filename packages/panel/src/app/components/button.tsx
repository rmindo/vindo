import {useState} from '@vindo/react/client'


export default function button() {
  const state:any = useState({count: 1})

  return (
    <button
      onClick={() => {
        state.set({count: state.count + 1})
      }}>
      Count {state.count}
    </button>
  )
}