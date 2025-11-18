import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//basic config
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser());
app.use(express.static("public"))

// cors config
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]

}))

import healthCheckRouter from "./routes/healthcheck.route.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import taskRouter from "./routes/task.routes.js"
import reportTaskRouter from "./routes/report.routes.js"

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/tasks",taskRouter)
app.use("/api/v1/reports",reportTaskRouter)

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);
export default app
