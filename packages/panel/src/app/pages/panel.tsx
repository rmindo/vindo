import {Link} from '@vindo/react/client'

import Button from '../components/button'

export default function({}:any) {
  return (
    <div id="panel" className="inner">
      <h1>Welcome to Admin</h1>
      <Button/>
      <button>
        <Link href="/panel/login">Logout</Link>
      </button>
    </div>
  )
}