import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Task } from "../models/task.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getTasks = asyncHandler(async(req, res) => {
    const {status} = req.query

    let filter = {}

    if(status) {
        filter.status = status
    }

    if(req.user.role !== "admin") {
        filter.assignedTo = req.user._id
    }

    const tasks = await Task.aggregate(
        [
            {
                $match: filter
            },
            {
                $addFields:{
                    CompletedTaskCount:{
                        $size:{
                            $filter:{
                               input:"$todoChecklist",
                               as:"item",
                               cond:{$eq:["$$item.completed",true]}
                            }
                        }
                    }
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"assignedTo",
                    foreignField:"_id",
                    as:"assignedTo",
                    pipeline:[
                        {
                            $project:{
                                name:1,
                                email:1,
                                "profileImageUrl.url":1
                            }
                        }
                    ]
                }
            }
        ]
    )

    const statusSummary = await Task.aggregate([
      { $match: req.user.role === "admin" ? {} : { assignedTo: req.user._id } },
         {
           $group: {
             _id: "$status",
             count: { $sum: 1 },
           },
         },
     ]);

     const summary = { all: 0, pending: 0, inProgress: 0, completed: 0 };
       statusSummary.forEach(item => {
           summary.all += item.count;
           if (item._id === "Pending") summary.pending = item.count;
           if (item._id === "In Progress") summary.inProgress = item.count;
           if (item._id === "Completed") summary.completed = item.count;
       });

    return res
     .status(201)
     .json(new ApiResponse(200, {tasks, summary} ,"Tasks fetched successfully"))

})

const getTaskById =asyncHandler(async(req, res) => {
    const taskId = req.params.id
    console.log(taskId);
    
    if(!taskId){
        throw new ApiError(400, "Task id is required")
    }

    const task = await Task.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"assignedTo",
                foreignField:"_id",
                as:"assignedTo",
                pipeline:[
                    {
                        $project:{
                            name:1,
                            email:1,
                            "profileImageUrl.url":1
                        }
                    }
                ]
            }
        }
    ])

    if(!task || task.length === 0){
        throw new ApiError(404, "Task not found")
    }

    return res.status(200).json(new ApiResponse(200, { task: task[0] }, "Task fetched successfully"))
})

const createTask = asyncHandler(async(req, res) => {
    const { title, description,priority,assignedTo, dueDate, attachments,todoChecklist } = req.body;

    if(!title || !dueDate || !description) {
        throw new ApiError(400, "Title, description and due date are required")
    }

    if(!Array.isArray(assignedTo) && assignedTo.length === 0) {
        throw new ApiError(400, "At least one assignee is required")
    }

    const newTask = await Task.create({
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        attachments,
        todoChecklist,
        createdBy: req.user._id
    })

     return res.status(201).json(new ApiResponse(201,newTask, "Task created successfully"))

})

const updateTask = asyncHandler(async (req, res) => {

  const updateTaskId = req.params.id;
  if (!updateTaskId) {
    throw new ApiError(400, "Task ID is required");
  }

  // Find the task
  const task = await Task.findById(updateTaskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Update only provided fields
  const {
    title,
    description,
    priority,
    todoChecklist,
    dueDate,
    attachments,
    assignedTo,
  } = req.body;

  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (todoChecklist) task.todoChecklist = todoChecklist;
  if (dueDate) task.dueDate = dueDate;
  if (attachments) task.attachments = attachments;

  if (assignedTo) {
    if (!Array.isArray(assignedTo)) {
      throw new ApiError(400, "AssignedTo must be an array of user IDs");
    }
    task.assignedTo = assignedTo;
  }

  // Save task
  await task.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const updateTaskCheckList = asyncHandler(async(req, res) => {

    const taskId = req.params.id
    const {todoChecklist } = req.body

    if(!taskId){
        throw new ApiError(400, "Task ID is required");
    }

    if(!todoChecklist){
        throw new ApiError(400, "input Creditiocial are required") 
    }

    const task = await Task.findById(taskId)

    if(!task){
        throw new ApiError(404, "Task not found")
    }

    if(!task.assignedTo.includes(req.user._id) && req.user.role !== "admin"){
        throw new ApiError(403, "You are not authorized to Update Todo List of task")
    }

    task.todoChecklist = todoChecklist || task.todoChecklist

    const CompletedTaskCount = task.todoChecklist.filter((todo) => todo.completed).length

    const totalItems = task.todoChecklist.length

    task.progress =totalItems > 0 ? (Math.floor((CompletedTaskCount*100)/totalItems)) : 0

    console.log(task.progress)

    if(task.progress === 0){
        task.status = "Pending"
    }else if (task.progress === 100){
        task.status="Completed"
    }else{
        task.status = "In Progress"
    }

    console.log(task.status)
    await task.save({validateBeforeSave:false})

    const updateTask = await Task.findById(taskId).populate(
        "assignedTo",
        "name , email , profileImageUrl.url"
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updateTask,"update Task CheckList successfully"))

})

const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  if (!taskId) {
    throw new ApiError(400, "Task ID is required");
  }

  // Find the task
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // ✅ Fix: Compare ObjectIds properly
  // task.createdBy and req.user._id are ObjectId objects, not strings.
  if (!task.createdBy.equals(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to delete this task");
  }

  await task.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});


const getUserDashboardData = asyncHandler(async(req, res) => {

    const userId = req.user._id


    const [taskStats] = await Task.aggregate([
        {
           $match:{assignedTo:userId}
        },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        pendingCount: [
          { $match: { status: "Pending" } },
          { $count: "count" }
        ],
        completedCount: [
          { $match: { status: "Completed" } },
          { $count: "count" }
        ],
        overdueCount: [
          {
            $match: {
             assignedTo:userId,
              status: { $ne: "Completed" },
              dueDate: { $lt: new Date() }
            }
          },
          { $count: "count" }
        ],
        taskDistributionRaw: [
          {$match:{assignedTo:userId}},
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        taskPriorityRawLevel: [
          {$match:{assignedTo:userId}},
          { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]
      }
    },
    {
      $project: {
        totalTasks: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        pendingTasks: { $ifNull: [{ $arrayElemAt: ["$pendingCount.count", 0] }, 0] },
        completedTasks: { $ifNull: [{ $arrayElemAt: ["$completedCount.count", 0] }, 0] },
        overdueTasks: { $ifNull: [{ $arrayElemAt: ["$overdueCount.count", 0] }, 0] },
        taskDistributionRaw: 1,
        taskPriorityRawLevel: 1
      }
    }
  ]);

  // Format chart data
  const taskStatuses = ["Pending", "In Progress", "Completed"];
  const taskDistribution = taskStatuses.reduce((acc, status) => {
    const found = taskStats.taskDistributionRaw.find((item) => item._id === status);
    acc[status.replace(/\s+/g, "")] = found ? found.count : 0;
    return acc;
  }, {});
  taskDistribution["All"] = taskStats.totalTasks;

  const priorities = ["Low", "Medium", "High"];
  const taskPriorityLevel = priorities.reduce((acc, p) => {
    const found = taskStats.taskPriorityRawLevel.find((item) => item._id === p);
    acc[p] = found ? found.count : 0;
    return acc;
  }, {});

  // Recent tasks
  const recentTasks = await Task.find({assignedTo:userId})
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title status priority dueDate createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: {
          totalTasks: taskStats.totalTasks,
          pendingTasks: taskStats.pendingTasks,
          completedTasks: taskStats.completedTasks,
          overdueTasks: taskStats.overdueTasks
        },
        charts: {
          taskDistribution,
          taskPriorityLevel
        },
        recentTasks
      },
      "Dashboard data fetched successfully"
    )
  );
})

const getDashboardData = asyncHandler(async (req, res) => {
  const [taskStats] = await Task.aggregate([
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        pendingCount: [
          { $match: { status: "Pending" } },
          { $count: "count" }
        ],
        completedCount: [
          { $match: { status: "Completed" } },
          { $count: "count" }
        ],
        overdueCount: [
          {
            $match: {
              status: { $ne: "Completed" },
              dueDate: { $lt: new Date() }
            }
          },
          { $count: "count" }
        ],
        taskDistributionRaw: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        taskPriorityRawLevel: [
          { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]
      }
    },
    {
      $project: {
        totalTasks: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        pendingTasks: { $ifNull: [{ $arrayElemAt: ["$pendingCount.count", 0] }, 0] },
        completedTasks: { $ifNull: [{ $arrayElemAt: ["$completedCount.count", 0] }, 0] },
        overdueTasks: { $ifNull: [{ $arrayElemAt: ["$overdueCount.count", 0] }, 0] },
        taskDistributionRaw: 1,
        taskPriorityRawLevel: 1
      }
    }
  ]);

  // Format chart data
  const taskStatuses = ["Pending", "In Progress", "Completed"];
  const taskDistribution = taskStatuses.reduce((acc, status) => {
    const found = taskStats.taskDistributionRaw.find((item) => item._id === status);
    acc[status.replace(/\s+/g, "")] = found ? found.count : 0;
    return acc;
  }, {});
  taskDistribution["All"] = taskStats.totalTasks;

  const priorities = ["Low", "Medium", "High"];
  const taskPriorityLevel = priorities.reduce((acc, p) => {
    const found = taskStats.taskPriorityRawLevel.find((item) => item._id === p);
    acc[p] = found ? found.count : 0;
    return acc;
  }, {});

  // Recent tasks
  const recentTasks = await Task.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title status priority dueDate createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: {
          totalTasks: taskStats.totalTasks,
          pendingTasks: taskStats.pendingTasks,
          completedTasks: taskStats.completedTasks,
          overdueTasks: taskStats.overdueTasks
        },
        charts: {
          taskDistribution,
          taskPriorityLevel
        },
        recentTasks
      },
      "Dashboard data fetched successfully"
    )
  );
});


const updateTaskStatus = asyncHandler(async(req, res) => {

   // TODO: Make more good
    const taskId = req.params.id
    const { status } = req.body

    if(!taskId){
        throw new ApiError(400, "Task id is required")
    }

    if(!status || !["Pending", "In Progress", "Completed"].includes(status)){
        throw new ApiError(400, "Valid status is required")
    }

    const task = await Task.findById(taskId)

    const assignedTo = task.assignedTo.some((userId)=>userId.toString() === req.user._id.toString())

    if(!assignedTo && req.user.role !== "admin"){
        throw new ApiError(403, "You are not authorized to Change this task")
    }

    task.status=status || task.status

    if(task.status === "Completed"){
        task.todoChecklist.forEach((todo)=> todo.completed = true)
        task.progress=100
    }

    await task.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200,task,"Task updated status successfully"))

})

export {
    getTasks,
    getTaskById,
    createTask,
    updateTaskStatus,
    updateTaskCheckList,
    deleteTask,
    getUserDashboardData,
    getDashboardData,
    updateTask
}