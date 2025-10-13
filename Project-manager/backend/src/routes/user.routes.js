import {
    getAllUsers,
    getUserById
} from "../controllers/user.controller.js"
import { Router } from "express";
import { verifyJWT,adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, adminOnly, getAllUsers);
router.get("/:id", verifyJWT, getUserById);
//router.delete("/:id", verifyJWT, adminOnly, deleteUser);




export default router;