import Login from '../../react/pages/login'
import Settings from '../../react/pages/settings'
import Dashboard from '../../react/pages/dashboard'




export function login(req:any, res:any, {meta}:any) {
  meta.title = 'Login'
  meta.bundle = true
  meta.external = true

  return (
    <Login name="login"/>
  )
}


export function settings(req:any, res:any, {meta}:any) {
  meta.title = 'Settings'
  meta.bundle = true

  return (
    <Settings name="settings"/>
  )
}


export default function({meta}:any) {
  meta.title = 'Panel'
  meta.bundle = true

  return (
    <Dashboard name="panel"/>
  )
}