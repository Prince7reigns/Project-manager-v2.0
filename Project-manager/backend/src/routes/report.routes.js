import { Router } from "express";
import { verifyJWT,adminOnly } from "../middlewares/auth.middleware.js";
import {
    exportTasksReport,
   exportUsersReport
} from "../controllers/report.controller.js"

const router = Router();

router.get("/export/tasks",verifyJWT,adminOnly,exportTasksReport)
router.get("/export/users",verifyJWT,adminOnly,exportUsersReport)

export default router