import React,{createContext,useState,useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext()

const UserProvider =({children}) =>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        if(user) return;

        const accessToken = localStorage.getItem("accessToken")

        if(!accessToken){
            setLoading(false)
            return
        }

        const fetchUser = async () =>{
            try {
             const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE)  
             setUser(response.data.data.user)
            } catch (error) {
                console.error("User not Authenticated",error);
                clearUser();
            }finally{
                setLoading(false)
            }
        }
        fetchUser()
    },[])

    const updateUser = (userData) =>{
        setUser(userData)
        localStorage.setItem("accessToken",userData.accessToken)
        setLoading(false)
    }

    const clearUser = () =>{
        setUser(null)
        localStorage.removeItem("accessToken")
    }

    return (
        <UserContext.Provider value={{user,loading,updateUser,clearUser}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider