import exprees,{Router} from "express";
import {register, login, refreshToken, logout, getUserProfile, updateUserProfile} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.post("/register", 
    upload.fields([
            {
                name: "profileImageUrl",
                maxCount: 1
            }
        ]),
    register)
    
router.post("/login",upload.none(), login)
router.post("/refresh-token", refreshToken)
router.post("/logout", verifyJWT, logout)
router.get("/profile", verifyJWT, getUserProfile)
router.put("/profile", verifyJWT, updateUserProfile)

export default router