import React, { useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { validateEmail } from '../../utils/helper'
import Input from '../../components/Inputs/input'
  import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector'
  import { Link } from 'react-router-dom'
import { API_PATHS } from '../../utils/apiPaths'

const Signup = () => {
  const [profilePic , setProfilePic] = useState(null)
  const [fullName,setFullName] = useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword] =useState("")
  const [adminInviteToken ,setadminInviteToken] = useState("")

  
  const [error ,setError]=useState(null)

    const handleSignUp =async (e)=>{
     e.preventDefault()
  
     if(!validateEmail(email)){
      setError("Please enter a valid email address")
      return 
     }
     
     if(!fullName){
      setError("Please enter a valid Full Name")
      return 
     }
  
     if(!password){
      setError("Please enter the password")
      return
     }

     if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
  
     setError("")

     try{
         const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
          name:fullName,
          email,
          password,
          adminInviteToken,
          profileImageUrl:profilePic ? profilePic : ""
         });
   
        const accessToken = response.data.data.accessToken
        const role = response.data.data.user.role
          
        if(accessToken){
          localStorage.setItem("token",accessToken)
          updateUser(response.data.data)
          if(role === "admin"){
            navigate("/admin/dashboard")
       }else{
            navigate("/user/dashboard")
        }
    }

     }catch (error) {
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
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
       <h3 className='text-xl font-semibold text-black '>create an Account</h3>
       <p className='text-xs text-slate-700 mt-[5px] mb-6'>
        Join us today by entering your details below
       </p>

       <form onSubmit={handleSignUp}>
         <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>

         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
             value={fullName}
             onChange={({target}) => setFullName(target.value)}
             label="full name"
             placeholder="john"
             type="text"
            />

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

            <Input
             value={adminInviteToken}
             onChange={({target})=> setadminInviteToken(target.value)}
             label="Admin Invite Token"
             placeholder="6 Digit Code"
             type="text"
            />
        </div>
             {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

              <button type='submit' className='btn-primary w-full py-2 mt-3 disabled:opacity-50 hover:opacity-90 transition'>
                SIGN UP
              </button>
      
              <p className='text-[13px] text-slate-800 mt-3'>
                Already an account? {" "}
                <Link className='font-medium text-primary underline ' to="/login">
                  Login
                </Link>
              </p>
       </form>
      </div>
    </AuthLayout>
  )
}

export default Signup
