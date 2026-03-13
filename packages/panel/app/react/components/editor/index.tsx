import {Link, useState} from '@vindo/react/client'

import Save from './save'
import Editor from './lexical'
import Select from '../fields/select'
import Checkbox from '../fields/checkbox'

import {toPath, datetime, sliceWords} from '../../../lib/common'


type EditProps = {
  data?: object,
  action: string,
  resource: string,
}

export default function({data, resource, action}: EditProps) {
  const state = useState(data)
  const descriptionLimit = 20

  return (
    <>
      <header>
        <div className="top">
          <div>
            <div className="back">
              <span
                onClick={() => {
                  Link.back()
                }}>
                <i className="icon-arrow-left"></i>
                <span>Back</span>
              </span>
            </div>
            <h2>{action} {resource.slice(0, -1)}</h2>
          </div>
          <div className="action">
            <Save
              data={state}
              resource={resource}
              saved={(data) => {
                state.set(data)
              }}
              method={action == 'Edit' ? 'put' : 'post'}
            />
          </div>
        </div>
      </header>
      <div className="create">
        <div className="left">
          <div className="editor">
            <Editor
              initialTitle={state.title}
              initialContent={state.content}
              onContentChange={({title, content, description}: {title: string, content: string, description: string}) => {
                if(state.description) {
                  description = state.description
                }
                else {
                  description = sliceWords(description)
                }
                state.set({
                  title,
                  content,
                  description,
                  slug: title && toPath(title),
                })
              }}
            />
          </div>
        </div>
        <div className="right">
          <fieldset>
            <div className="field information">
              <label>Information</label>
              {state.status && (
                <div className="info">
                  <strong>Status</strong>
                  <span className={`text ${state.status.toLowerCase()}`}>{state.status}</span>
                  <Save
                    data={state}
                    plain={true}
                    resource={resource}
                    saved={(data) => {
                      state.set(data)
                    }}
                    method={'put'}
                  />
                </div>
              )}
              {state.user && (
                <div className="info">
                  <strong>Author</strong>
                  <span className="text">{state.user.name}</span>
                </div>
              )}
              {action == 'Edit' ? (
                <>
                  {state.created && (
                    <div className="info">
                      <strong>Created</strong>
                      <span className="text">{datetime(state.created).getFullDateTime()}</span>
                    </div>
                  )}
                  {state.updated && (
                    <div className="info">
                      <strong>Updated</strong>
                      <span className="text">{datetime(state.updated).getFullDateTime()}</span>
                    </div>
                  )}
                </>
              ):(
                <div className="info">
                  <strong>Date</strong>
                  <span className="text">{datetime(Date.now()).getFullDateTime('-')}</span>
                </div>
              )}
            </div>
          </fieldset>
          <fieldset>
            {resource == 'Pages' ? (
              <>
                <div className="field">
                  <label>Menu Location</label>
                  <div className="checkboxes inline">
                    <Checkbox
                      label={'Top'}
                      space={10}
                      onClick={(checked: boolean) => state.set({topMenu: checked})}
                      checked={state.topMenu}
                    />
                    <Checkbox
                      label={'Bottom'}
                      space={10}
                      onClick={(checked: boolean) => state.set({bottomMenu: checked})}
                      checked={state.bottomMenu}
                    />
                    <span></span>
                  </div>
                </div>
                <div className="field">
                  <label>Page Type</label>
                  <Select
                    radio
                    value={state.type}
                    width={{
                      select: '100%',
                      option: '90%'
                    }}
                    onChange={(item: string) => {
                      state.set({type: item})
                    }}
                    icon={'paper'}
                    label={'Select'}
                    option={['Page', 'Category']}
                  />
                </div>
                <div className="field">
                  <label>Page Template</label>
                  <Select
                    radio
                    value={state.template}
                    width={{
                      select: '100%',
                      option: '90%'
                    }}
                    onChange={(item: string) => {
                      state.set({template: item})
                    }}
                    icon={'paper'}
                    label={'Select'}
                    option={['category']}
                  />
                </div>
              </>
            ):(
              <>
                <div className="field">
                  <label>Category</label>
                  <Select
                    radio
                    value={state.categories.join(', ')}
                    width={{
                      option: '90%',
                      select: '100%',
                    }}
                    onChange={(item: string) => {
                      state.set(({parent, categories}: any) => {
                        /**
                         * Page is a primary category
                         */
                        if(!parent) {
                          parent = item
                        }
                        if(!categories.includes(item)) {
                          categories.push(item)
                        }
                        return {parent, categories}
                      })
                    }}
                    icon={'paper'}
                    label={'Select'}
                    option={['Code', 'Network', 'Security', 'Technology']}
                  />
                </div>
                <div className="field">
                  <label>Tags</label>
                  <Select
                    radio
                    value={state.tags}
                    width={{
                      option: '90%',
                      select: '100%',
                    }}
                    onChange={(item: string) => {
                      state.set({tags: item})
                    }}
                    icon={'paper'}
                    label={'Select'}
                    option={['Code', 'Network', 'Security', 'Technology']}
                  />
                </div>
              </>
            )}
            <div className="field">
              <label>Description</label>
              <textarea
                id="description"
                onChange={(e) => {
                  state.set({description: sliceWords(e.target.value)})
                }}
                value={state.description}
              />
              <span className="text">{descriptionLimit} words limit.</span>
            </div>
          </fieldset>
        </div>
      </div>
    </>
  )
}
