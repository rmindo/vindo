import React from 'react'
import {Link, useState} from '@vindo/react/client'

import Search from './fields/search'
import Filter from './fields/filter'
import Select from './fields/select'
import Checkbox from './fields/checkbox'
import Pagination from './fields/pagination'


import {datetime, createPath} from '../../lib/common'


type TableProps = {
  columns: string[],
  resource: string,
}

/**
 * Prompt message
 */
const confirmDelete = (ids: string[]) => {
  return confirm(`You're about to delete the post with ID "${ids.join(', ')}". Please confirm before deleting it.`)
}


export default function Table({columns, resource}: TableProps) {
  const state = useState({
    ids: [],
    items: [],
    limit: 10,
    columns,
    status: null,
    notify: null,
    loading: true,
  })

  
  // React.useEffect(() => {
    // state.get(resource.toLowerCase())
    // .then(({code, data}) => {
    //   if(code == 200) {
    //     state.set({items: data, loading: false})
    //   }
    // })
    // .then((e: any) => console.log(e))
  // }, [])


  const remove = (ids: string[] = []) => {
    const ok = confirmDelete(ids)

    if(ok) {
      state.get(resource.toLowerCase(), {
        query: {
          ids: ids.join(',')
        }
      })
      .then(({code, message}) => {
        state.set(({items}: any) => {
          if(code == 200) {
            items = items.filter((item: any) => !ids.includes(item.id))
          }
          return {items, notify: message, status: code}
        })
      })
      .finally(() => {
        setTimeout(() => {
          state.set({notify: null, status: null})
        }, 3000)
      })
      .then((e: any) => console.log(e))
    }
  }

  

  return (
    <>
      <header>
        <div className="top">
          <h2>{resource}</h2>
          <div className="action">
            <button
              className="button-1"
              onClick={() => {
                Link.redirect(`/panel/${resource.toLowerCase()}/create`)
              }}>
              <i className="icon-edit"></i>
              <span>Create {resource.slice(0, -1)}</span>
            </button>
          </div>
        </div>
        <div className="bottom">
          <div className="left">
            <Search/>
            <Filter
              icon={'grid'}
              label={'Category'}
              option={['Code', 'Security', 'Network', 'Technology']}
            />
            {state.ids.length > 0 && (
              <div
                className="tool delete"
                onClick={() => remove(state.ids)}>
                <span className="icon">
                  <i className="icon-bin"></i>
                </span>
                <span>Delete ({state.ids.length})</span>
              </div>
            )}
          </div>
          <div className="right">
            <Select
              radio
              icon={'sort'}
              label={'Sort'}
              onChange={(val: number) => {
              }}
              option={['Ascending', 'Descending']}
            />
            <Select
              radio
              icon={'column'}
              label={'Column Views'}
              onChange={(val: number) => {
                state.set({columns: []})
              }}
              option={[
                'ID',
                'Title',
                'Status',
                'Author',
                'Category',
                'Created',
                'Updated',
                'Published',
                'Description',
              ]}
            />
          </div>
        </div>
      </header>
      <table>
        <thead>
          <tr>
            {state.columns.map((name: string, key: number) => {
              return (
                <th key={key}>
                  {name == 'ID' ? (
                    <Checkbox
                      label={'ID'}
                      space={30}
                      onClick={(checked: boolean) => {
                        state.set({
                          ids: state.items.reduce(
                            (items: [], item: any) => {
                              if(checked) {
                                items.push(item.id as never)
                              }
                              else {
                                return items.filter((v: number) => v !== item.id)
                              }
                              return items
                            },
                          [])
                        })
                      }}
                      checked={state.ids.length > 0 ? true : false}
                    />
                  ):(
                    <span>{name}</span>
                  )}
                </th>
              )
            })}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.loading ? (
            <tr>
              <td colSpan={6}>
                <span className="spinner"><i className="icon-cog"/></span>
              </td>
            </tr>
          ):(
            <>
              {state.items.length > 0 ? (
                <>
                  {state.items.slice(0, state.limit).map((item: any, key: number) => {

                    const editorPath = createPath(['panel', resource, 'edit', item.id])
                    const publicPath = createPath([item.page ? item.page.slug : '', item.slug])

                    return (
                      <tr key={key}>
                        <td>
                          <Checkbox
                            space={30}
                            label={item.id}
                            onClick={(checked: boolean) => {
                              state.set(({ids}: any) => {
                                if(checked) {
                                  ids.push(item.id)
                                }
                                else {
                                  ids = ids.filter((v: number) => v !== item.id)
                                }
                                return {ids}
                              })
                            }}
                            checked={state.ids.includes(item.id)}
                          />
                        </td>
                        <td className="title">
                          <Link href={editorPath}>{item.title}</Link>
                        </td>
                        <td>{item.type}</td>
                        <td>
                          <span className={`icon ${item.status.toLowerCase()}`}>
                            {item.status == 'Published' ? (
                              <i className="icon-wavy-check"></i>
                            ):(
                              <i className="icon-edit"></i>
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td>{datetime(item.updated).getDateTime()}</td>
                        <td className="action">
                          <span className="icon">
                            <Link target="_blank" href={publicPath}>
                              <i className="icon-eye-open"></i>    
                            </Link>
                          </span>
                          <span className="icon">
                            <Link href={editorPath}>
                              <i className="icon-edit"></i>    
                            </Link>
                          </span>
                          <span
                            className="icon"
                            onClick={() => remove([item.id])}>
                            <i className="icon-bin"></i>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </>
              ):(
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', lineHeight: '22px'}}>
                    <span style={{fontSize: 14, color: '#999'}}>No Entries</span>
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
      <footer>
        <div className="limit">
          <Select
            label={state.limit}
            onChange={(val: number) => {
              state.set({limit: val})
            }}
            option={[5,10,20,30,40,50]}
          />
          <span className="text">Posts per page</span>
        </div>
        <div className="page">
          <Pagination/>
        </div>
      </footer>
    </>
  )
}
