import {Link} from '@vindo/react/client'


import Panel from './pages/panel'
import Button from './components/button'



export function login(req:any, res:any, {meta, state}:any) {
  meta.ads = false
  meta.title = 'Login Panel'

  state.use({count: 1})

  return (
    <div id="login" className="inner">
      <h1>Login</h1>
      {(state.count >= 5 && state.count <= 10) && (
        <p>Welcome to cointotal</p>
      )}
      <button
        onClick={(e) => {
          state.set({count: state.count + 1})
        }}>
        Count {state.count}
      </button>
      <button>
        <Link href="/panel">Go to Panel</Link>
      </button>
    </div>
  )
}


export function panel(req:any, res:any, {meta, state}:any) {
  meta.ads = false
  meta.title = 'Admin Panel'

  return (
    <Panel name={'panel'}/>
  )
}

