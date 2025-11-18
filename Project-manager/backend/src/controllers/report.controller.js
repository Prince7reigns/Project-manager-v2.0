import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Task } from "../models/task.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import excelJs from "exceljs"

const exportTasksReport = asyncHandler(async (req, res) => {
  const tasks = await Task.find().populate("assignedTo", "name email");

  const workBook = new excelJs.Workbook();
  const workSheet = workBook.addWorksheet("Task Report");

  workSheet.columns = [
    { header: "Task ID", key: "_id", width: 25 },
    { header: "Title", key: "title", width: 30 },
    { header: "Description", key: "description", width: 50 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Status", key: "status", width: 20 },
    { header: "Due Date", key: "dueDate", width: 20 },
    { header: "Assigned To", key: "assignedTo", width: 40 },
  ];

  // Add rows
  tasks.forEach((task) => {
    const assignedTo =
      task.assignedTo?.length > 0
        ? task.assignedTo.map((u) => `${u.name} (${u.email})`).join(", ")
        : "Unassigned";

    workSheet.addRow({
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? task.dueDate.toISOString().split("T")[0]
        : "N/A",
      assignedTo,
    });
  });

  // Send Excel headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=tasks-report.xlsx"
  );

  // Write workbook
  await workBook.xlsx.write(res);
  return res.end();
});



const exportUsersReport = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email _id").lean();
  const userTasks = await Task.find().populate("assignedTo", "name email _id");

  const userTaskMap = {};

  users.forEach((user) => {
    userTaskMap[user._id] = {
      name: user.name,
      email: user.email,
      taskCount: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
    };
  });

  userTasks.forEach((task) => {
    task.assignedTo?.forEach((assignedUser) => {
      const item = userTaskMap[assignedUser._id];
      if (!item) return;

      item.taskCount++;

      if (task.status === "Pending") item.pendingTasks++;
      if (task.status === "In Progress") item.inProgressTasks++;
      if (task.status === "Completed") item.completedTasks++;
    });
  });

  const workbook = new excelJs.Workbook();
  const worksheet = workbook.addWorksheet("User Tasks Report");

  worksheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Total Tasks", key: "taskCount", width: 15 },
    { header: "Pending", key: "pendingTasks", width: 15 },
    { header: "In Progress", key: "inProgressTasks", width: 15 },
    { header: "Completed", key: "completedTasks", width: 15 },
  ];

  Object.values(userTaskMap).forEach((user) => {
    worksheet.addRow(user);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=user-tasks-report.xlsx"
  );

  await workbook.xlsx.write(res);
  return res.end();
});




export {
  exportTasksReport,
  exportUsersReport
}