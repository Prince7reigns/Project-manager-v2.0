import React, { useState,useContext } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import {useNavigate,Link} from "react-router-dom"
import Input from '../../components/Inputs/input'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/userContext'

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const {updateUser,user} = useContext(UserContext)

  const handleLogin =async (e)=>{
   e.preventDefault()

   if(!validateEmail(email)){
    setError("Please enter a valid email address")
    return 
   }

   if(!password){
    setError("Please enter the password")
    return
   }

   setError("")

   try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
      email,
      password,
    });
   
   
    const accessToken = response.data.data.accessToken
    const role = response.data.data.user.role
      

    
    if(accessToken){
      localStorage.setItem("token",accessToken)
      updateUser(response.data.data.user)
      if(role === "admin"){
        navigate("/admin/dashboard")
      }else{
        navigate("/user/dashboard")
      }
    }
   } catch (error) {
    console.log(error)
    if(error.response && error.response.data.message){
      setError(error.response.data.message )
    }else{
      console.log(error)
      setError("Something went wrong Please try again. ")
    }
   }
  }
  return (
    
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
         <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
         <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Please enter Your details to log in
         </p>
          <form onSubmit={handleLogin}>
        <Input
         value={email}
         onChange={({target})=> setEmail(target.value)}
         label="Email Address"
         placeholder="jon@example.com"
         type="text"
        />

        <Input
         value={password}
         onChange={({target})=> setPassword(target.value)}
         label="Password"
         placeholder="Min 8 Characters"
         type="password"
        />

        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

        <button type='submit' className='btn-primary w-full py-2 mt-3 disabled:opacity-50 hover:opacity-90 transition'>
          LOGIN
        </button>

        <p className='text-[13px] text-slate-800 mt-3'>
          Don't have an account? {" "}
          <Link className='font-medium text-primary underline ' to="/signup">
            SignUp
          </Link>
        </p>
      </form>
      </div>
    </AuthLayout>
  )
}

export default Login