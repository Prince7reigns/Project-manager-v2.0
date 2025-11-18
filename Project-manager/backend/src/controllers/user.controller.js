import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";


const getAllUsers = asyncHandler(async(req, res) => {
   
    
     const usersWithTaskCounts = await User.aggregate([
      // 1️⃣ Match users with role 'member'
      { $match: { role: "member" } },

      // 2️⃣ Join tasks collection
      {
        $lookup: {
          from: "tasks",           // tasks collection
          localField: "_id",       // user _id
          foreignField: "assignedTo", // tasks.assignedTo
          as: "tasks",             // output array
        },
      },

      // 3️⃣ Compute counts for each status
      {
        $addFields: {
          pendingTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "t",
                cond: { $eq: ["$$t.status", "Pending"] },
              },
            },
          },
          inProgressTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "t",
                cond: { $eq: ["$$t.status", "In Progress"] },
              },
            },
          },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "t",
                cond: { $eq: ["$$t.status", "Completed"] },
              },
            },
          },
        },
      },

      // 4️⃣ Exclude the tasks array and sensitive fields
      {
        $project: {
          tasks: 0,
          password: 0,
          refreshToken: 0,
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, { users: usersWithTaskCounts }, "All members fetched successfully"));

})

const getUserById = asyncHandler(async(req, res) => {
    const userId = req.params.id

    if(!userId){
        throw new ApiError(400, "User id is required")
    }

    const user = await User.findById(userId).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"))
})

// next update 1.0 
//const deleteUser = asyncHandler(async(req, res) => {})


export {
    getAllUsers,
    getUserById,
}
