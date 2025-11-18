import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteOnCloudinary }from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async(userId) =>{
    try {
       const user = await User.findById(userId) 
        if(!user) throw new ApiError(404, "User not found")

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
}

const register = asyncHandler(async(req,res) =>{

    const { name,email, password,adminInviteToken} = req.body
    console.log(req.files)

    console.log(process.env.ADMIN_INVITE_CODE);
     if ([name, email, password].some(
            (field) => ( field?.trim() === "" )
        )) {
            throw new ApiError(400, "All fields are required")
        }
    const userExists = await User.findOne({
        email
    })

    if(userExists){
        throw new ApiError(409, "User with this email or username already exists")
    }

    let role = "member"

    
    if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_CODE){
        role = "admin"
    }
   const avatarLocalPath = req.files?.profileImageUrl?.[0]?.path ?? null;

    let avatar;
    if(avatarLocalPath){
         avatar = await uploadOnCloudinary(avatarLocalPath).catch((error) => console.log(error))

    }
    const user = await User.create({
        name,
        email,
        password,
        role,
        profileImageUrl: avatar ? { public_id: avatar.public_id, url: avatar.secure_url } : null
    })

     const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

    return res.status(201)
    .json(new ApiResponse(201, { user: createdUser } , "User registered successfully", ))
})

const login = asyncHandler(async(req,res) =>{
    const { email, password } = req.body;

    if ([email, password].some(
            (field) => ( field?.trim() === "" )
        )) {
            throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email login credentials")
    }
    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid login credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

     const loggedInUser = await User.findById(user._id).select(" -password -refreshToken");
    
        const options = {
            httpOnly: true,
            secure: true,
           // sameSite: "None" on when hosted on different domain
        };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { user: loggedInUser, accessToken , refreshToken }, "User logged in successfully"));
    
})

const refreshToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "No refresh token found, please login again")
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decoded._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }


    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Invalid refresh token, please login again")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true,
       // sameSite: "None" on when hosted on different domain
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"));
})

const logout = asyncHandler(async(req,res) =>{
    const userId = req.user._id

    await User.findByIdAndUpdate(
        userId,
        {
            $unset:{
                refreshToken: 1
            },
        },
         {
                new: true
         }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logout successfull !!!."
            )
        );
})

const getUserProfile = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "User profile fetched successfully"))
})

const updateUserProfile = asyncHandler(async(req,res) =>{
    const {email,name} = req.body

    if (!email && !name)
     {
            throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    user.email = email || user.email
    user.name = name || user.name

    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile updated successfully"))
})

const updateUserprofileImage=asyncHandler(async(req,res) =>{

     const avatarLocalPath = req.files?.profileImageUrl[0]?.path

     if(!avatarLocalPath){
        throw new ApiError(400, "Profile image is required")
     }

    const user = await User.findById(req.user._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath).catch((error) => console.log(error))

    if(!avatar || !avatar.secure_url){
        throw new ApiError(500, "Something went wrong while uploading image on cloudinary")
    }

    const avatarToDelete = user.profileImageUrl?.public_id

    if(avatarToDelete){
        await deleteOnCloudinary(avatarToDelete).catch((error) => console.log(error))
    }

    user.profileImageUrl = { public_id: avatar.public_id, url: avatar.secure_url }
    await user.save({ validateBeforeSave: false })


    return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User profile image updated successfully"))
})

export {register, login, refreshToken, logout, getUserProfile, updateUserProfile}