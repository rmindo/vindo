import {Link, useContext} from '@vindo/react/client'

import Brand from './brand'
import navigation from '../../navigation.json'
import {isActive, makePath} from '../../lib/common'



export default function Sidebar() {
  const {meta} = useContext()

  return (
    <aside id="panel">
      <Brand/>
      <div id="menu">
        <ul>
          {navigation.map((item, index) => {
            return (
              <li key={index} className={isActive(item, meta.name)}>
                {item.label ? (
                  <label>{item.label}</label>
                ):(
                  <>
                     {item.group ? (
                        <>
                          <Link href={makePath(item)}>
                            <i className={`icon-${item.icon}`}></i>
                            <span>{item.name}</span>
                          </Link>
                          {item.name?.toLowerCase() === meta.name && (
                            <ul>
                              {item.group.map((sub, key) => (
                                <li key={key} className={isActive(sub, meta.name)}>
                                  <Link href={makePath(item)}>{sub?.name}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ):(
                        <Link href={makePath(item)}>
                          <i className={`icon-${item.icon}`}></i>
                          <span>{item.name}</span>
                        </Link>
                      )}
                  </>
                )}
              </li>
            )
          })}
          <li>
            <a href="/panel/login">
              <i className="icon-lock"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  )
}