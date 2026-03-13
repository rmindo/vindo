import {Link, useState, useContext} from '@vindo/react/client'

import Brand from '../components/brand'
import Checkbox from '../components/fields/checkbox'


export default function({name}:any) {
  const state = useState({email: null, password: null})
  const {meta} = useContext()

  return (
    <div id="login">
      <form
        className="box"
        onSubmit={(e) => {
          e.preventDefault()
          
          // state.post('auth', {
          //   data: state
          // })
          // .then(({code, message, data: user}) => {
          //   if(code == 200) {
          //     if(user) {
          //       Link.redirect(meta.query.ref ?? '/panel')
          //     }
          //   }
          //   else {
          //     state.set({error: message})
          //   }
          // })
          // .catch((e: any) => console.log(e))
        }}>
          <Brand/>

          {state.error && (
            <p className="error">{state.error}</p>
          )}
          <div className="field">
            <label>
              <i className="icon-user"></i>
              <span>Email</span>
            </label>
            <input type="email" onChange={(e) => state.set({email: e.target.value})}/>
          </div>
          <div className="field" style={{marginBottom: 15}}>
            <label>
              <i className="icon-lock"></i>
              <span>Password</span>
            </label>
            <input type="password" onChange={(e) => state.set({password: e.target.value})}/>
          </div>
          <div className="flex remember">  
            <Checkbox label={'Remember Me'}/>
          </div>
          <div className="action">
            <button
              className="button-1"
              style={{width: '100%'}}
              onClick={() => {
                Link.redirect('/panel')
              }}>
              Login
            </button>
          </div>
        </form>
    </div>
  )
}
