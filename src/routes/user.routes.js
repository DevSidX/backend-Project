import { Router } from "express";
import { loginUser, logoutUSer, refreshAccessToken, registerUser, updateAvatar } from "../controllers/user.controller.js";
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

router.route("/updateAvatar").post(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)

export default router;
