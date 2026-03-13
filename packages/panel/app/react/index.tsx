import {View, Content, Provider} from '@vindo/react/client'

import Login from './pages/login'
import Pages from './pages/pages'
import Posts from './pages/posts'
import Editor from './pages/editor'
import Settings from './pages/settings'
import Dashboard from './pages/dashboard'

import Sidebar from './components/sidebar'


export default function(meta:any) {
  return (
    <html>
      <head>
        <title>{meta.title}</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        
        <link rel="stylesheet" href="/assets/css/panel.css" type="text/css"/>
        <link rel="stylesheet" href="/assets/css/editor.css" type="text/css"/>
      </head>
      <body>
        
        {meta.external && (
          <Provider>
            <Content>
              <View name="login" component={Login}/>
            </Content>
          </Provider>
        )}

        {!meta.external && (
          <Provider>
            <Sidebar/>
            <main id="content">
              <Content>
                <View name="edit" component={Editor}/>
                <View name="posts" component={Posts}/>
                <View name="pages" component={Pages}/>
                <View name="panel" component={Dashboard}/>
                <View name="settings" component={Settings}/>
              </Content>
            </main>
          </Provider>
        )}
      </body>
    </html>
  )
}
