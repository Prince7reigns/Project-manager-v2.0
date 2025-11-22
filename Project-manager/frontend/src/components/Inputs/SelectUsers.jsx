import React from 'react'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuUsers } from 'react-icons/lu';
import Model from '../model';
import AvatarGroup from '../AvatarGroup';

const SelectUsers = ({setSelectedUsers,selectedUsers}) => {
    const [allUsers,setAllUsers]=React.useState([]);
    const [isMenuOpen,setIsMenuOpen]=React.useState(false); //menu is model
    const [tempSelectedUsers,setTempSelectedUsers]=React.useState([]);

    const getAllUsers = async () =>{
       try {
         const reaponse = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);6
        
  
         if(reaponse.data.data?.users?.length > 0){
            const temp = reaponse.data.data.users
            
             setAllUsers(temp);
         }
       } catch (error) {
        console.error("Error fetching users:",error);
       }
    }

    const toggleUserSelection = (userId) =>{
        setTempSelectedUsers((prev=>
            prev.includes(userId) ? prev.filter(id=>id!==userId) : [...prev,userId]
        ))
    }

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsMenuOpen(false);
    }

    const selectedUserAvatar = allUsers
    .filter(user=>selectedUsers.includes(user._id))
    .map(user=>user.profileImageUrl?.url || "");

    React.useEffect(()=>{
        getAllUsers();
    },[])

    React.useEffect(()=>{
        if(selectedUsers.length === 0){
            setTempSelectedUsers([]);
        }
        return () =>{}
    },[selectedUsers])

  return (
    <div className='space-y-4 mt-2'>
      {selectedUserAvatar.length=== 0 && (
        <button className='card-btn' onClick={()=>setIsMenuOpen(true)}>
            <LuUsers className='text-sm'/> Add Members
        </button>
      )}

      {selectedUserAvatar.length > 0 && (
        <div className='cursor-pointer' onClick={()=>setIsMenuOpen(true)}>
          <AvatarGroup avatars={selectedUserAvatar} maxVisible={3}/>
        </div>
      )}

      <Model 
      isOpen={isMenuOpen}
      title="Select Users"
      onClose={()=>setIsMenuOpen(false)}
      >
        <div className='space-y-4 h-[60vh] overflow-y-auto'>
            {allUsers.map((user)=>(
                <div
                 key={user._id}
                 className='flex items-center gap-4 p-3 border-b border-gray-200'
                >
                    
                  <img
                   src={user.profileImageUrl?.url}
                   alt={user.name}
                   className='w-10 h-10 rounded-full'
                  />

                  <div className='flex-1'>
                    <p className='font-medium text-gray-800 dark:textwhite'>{user.name}</p>
                    <p className='text-[13px] text-gray-500'>{user.email}</p>
                  </div>

                  <input 
                  type='checkbox'
                  checked={tempSelectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)}
                  className='w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none'
                  />
                </div>
            ))}
        </div>

        <div className='flex justify-end gap-4 pt-4'>
            <button className='card-btn' onClick={()=>setIsMenuOpen(false)}>
                CANCEL
            </button>

            <button className='card-btn-fill' onClick={handleAssign}>
                DONE
            </button>
        </div>
      </Model>
    </div>
  )
}

export default SelectUsers
