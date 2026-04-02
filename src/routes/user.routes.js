import { Router } from "express";
import { loginUser, logoutUSer, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    // middlewares injected
    upload.fields([
        {
            name: "avatar", // file 
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]) ,
    /////////
    registerUser  // controller
)

router.route("/login").post(
    loginUser  // controller
)

// secured router

router.route("/logout").post(
    verifyJWT, // middleware
    logoutUSer  // controller
)

router.route("/refresh-token").post(
    refreshAccessToken
)

export default router;
