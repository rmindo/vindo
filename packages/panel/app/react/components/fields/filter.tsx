import {useState} from '@vindo/react/client'
import Select from './select'


export default function Filter({icon, label, option}: any) {
  var state = useState({filter: false})

  return (
    <>
      <div
        className="tool filter"
        onClick={() => {
          state.set({filter: state.filter ? false : true})
        }}>
        <span className="icon">
          <i className="icon-filter"></i>
        </span>
        <span>Filters</span>
      </div>

      {state.filter && (
        <>
          <Select
            radio
            icon={'wavy-check'}
            label={'Status'}
            option={['Draft', 'Published']}
          />
          <Select
            radio
            icon={icon}
            label={label}
            option={option}
          />
        </>
      )}
    </>
  )
}
