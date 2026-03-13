import React from 'react'
import {useState} from '@vindo/react/client'

/**
 * Export images
 */
export default function Select({width, value, icon, radio, label, option, onChange, disabled = false}: any) {
  var state = useState({value: null, selecting: false})
  var isFlatSelectionOptions = true

  /**
   * options = [{id: 123, value: 'string representation'}]
   */
  if (option?.length > 0 && option[0].id !== undefined) {
    isFlatSelectionOptions = false
  }

  // React.useEffect(() => {
  //   state.set({value})
  // }, [value])


  return (
    <div className="select">
      <button
        disabled={disabled}
        style={{
          width: width ? width.select : 'auto'
        }}
        onClick={() => {
          state.set({selecting: state.selecting ? false : true})
        }}>
        <span className="text">
          <i className={`icon icon-${icon}`}/>
          <span>
            {value ? value : state.value ? state.value : label}
          </span>
        </span>
        <i className="caret icon-caret-down"/>
      </button>

      {state.selecting && (
        <div
          className="option"
          style={{
            width: width ? width.option : 'auto'
          }}>
          {(option?.length > 0) && option?.map((item: any, key: number) => (
            <span
              key={key}
              className={state.value == item ? 'value selected' : 'value'}
              onClick={() => {
                if(onChange) {
                  onChange(item)
                }
                state.set({
                  selecting: false,
                  value: isFlatSelectionOptions ? item : item.value
                })
              }}>
              {radio && (
                <span className="radio"/>
              )}
              <span className="text">{isFlatSelectionOptions ? item : item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}