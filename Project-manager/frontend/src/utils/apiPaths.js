// Base URL
export const BASE_URL = "http://localhost:8000";


// All API/v1 Endpoints
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/v1/auth/register", // Register a new user (Admin or Member)
    LOGIN: "/api/v1/auth/login",       // Authenticate user & return JWT token
    GET_PROFILE: "/api/v1/auth/profile", // Get logged-in user details
    UPLOAD_IMAGE: "/api/v1/auth/upload-image", // Upload profile image
  },

  USERS: {
    GET_ALL_USERS: "/api/v1/users", // Get all users (Admin only)
    GET_USER_BY_ID: (userId) => `/api/v1/users/${userId}`, // Get user by ID
    CREATE_USER: "/api/v1/users", // Create a new user (Admin only)
    UPDATE_USER: (userId) => `/api/v1/users/${userId}`, // Update user details
    DELETE_USER: (userId) => `/api/v1/users/${userId}`, // Delete a user (Admin only)
  },

  TASKS: {
    GET_DASHBOARD_DATA: "/api/v1/tasks/dashboard-data", // Admin dashboard
    GET_USER_DASHBOARD_DATA: "/api/v1/tasks/user-dashboard-data", // User dashboard
    GET_ALL_TASKS: "/api/v1/tasks", // Get all tasks (Admin: all, User: assigned only)
    GET_TASK_BY_ID: (taskId) => `/api/v1/tasks/${taskId}`, // Get task by ID
    CREATE_TASK: "/api/v1/tasks", // Create a new task (Admin only)
    UPDATE_TASK: (taskId) => `/api/v1/tasks/${taskId}`, // Update task details
    DELETE_TASK: (taskId) => `/api/v1/tasks/${taskId}`, // Delete a task (Admin only)
    UPDATE_TASK_STATUS: (taskId) => `/api/v1/tasks/${taskId}/status`, // Update task status
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/v1/tasks/${taskId}/todo`, // Update task checklist
  },

  REPORTS: {
    EXPORT_TASKS: "/api/v1/reports/export/tasks", // Download all tasks as an Excel
    EXPORT_USERS: "/api/v1/reports/export/users", // Download user-task report
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image"
  }
};
