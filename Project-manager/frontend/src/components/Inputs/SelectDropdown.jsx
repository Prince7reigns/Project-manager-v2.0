import React from 'react'
import { LuChevronDown } from 'react-icons/lu'

const SelectDropdown = ({options,value,onChange,placeholder}) => {
    const [isOpen,setIsOpen] = React.useState(false);

    const handleSelect = (option) =>{
        onChange(option);
        setIsOpen(false);
    }
  return (
    <div className='relative w-full' >
      <button onClick={()=>setIsOpen(!isOpen)} className='w-full text-sm outline-none flex border border-slate-300 rounded-md px-2.5 py-2 bg-white mt-2 justify-between items-center'>
          {value ? options.find((opt)=>opt.value === value)?.label : placeholder || "Select"}
          <span className='ml-2'>{isOpen ? <LuChevronDown className=''/>:<LuChevronDown/>}</span>
      </button>

        {isOpen && (
            <div className='absolute w-full bg-white border border-slate-100 rounded-md mt-1 z-10 shadow-md'>
                {options.map((option)=>(
                    <div
                     key={option.value}
                     className='text-sm px-3 py-2 hover:bg-gray-100 cursor-pointer'
                     onClick={()=>handleSelect(option.value)}
                    >
                        {option.label}

                    </div>
                ))}
            </div>

        )}
    </div>
  )
}

export default SelectDropdown
