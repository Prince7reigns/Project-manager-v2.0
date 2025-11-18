import {
    getTasks,
    getTaskById,
    createTask,
    updateTaskStatus,
    updateTaskCheckList,
    deleteTask,
    getUserDashboardData,
    getDashboardData,
    updateTask
} from "../controllers/task.controller.js"
import { Router } from "express";
import { verifyJWT, adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

// Task Management Routes
router.get("/dashboard-data", verifyJWT, getDashboardData);
router.get("/user-dashboard-data", verifyJWT, getUserDashboardData);
router.get("/", verifyJWT, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", verifyJWT, getTaskById); // Get task by ID
router.post("/", verifyJWT, adminOnly, createTask); // Create a task (Admin only)
router.put("/:id", verifyJWT, updateTask); // Update task details
router.delete("/:id", verifyJWT, adminOnly, deleteTask); // Delete a task (Admin only)
router.put("/:id/status", verifyJWT, updateTaskStatus); // Update task status
router.put("/:id/todo", verifyJWT, updateTaskCheckList); // Update task checkList

export default router;