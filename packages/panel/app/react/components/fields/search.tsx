import {useState} from '@vindo/react/client'



export default function Search() {
  var input:any = null
  var state:any = useState({keyword: ''})

  return (
    <div className="tool search">
      <span>
        <input
          type="text"
          ref={(ref) => {
            input = ref
          }}
          onChange={(e) => {
            state.set({keyword: e.target.value})
          }}/>
      </span>
      <span
        className="icon"
        onClick={() => {
          input.focus()
        }}>
        <i className="icon-search"></i>
      </span>
    </div>
  )
}
