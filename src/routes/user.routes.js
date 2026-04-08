import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUSer, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage 
} from "../controllers/user.controller.js";
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

router.route("/change-Password").post(
    verifyJWT,
    changeCurrentPassword
)

router.route("/current-User").post(
    verifyJWT,
    getCurrentUser
)

router.route("/update-AccountDetails").patch(  // PATCH method is used to apply partial modifications to a resource, allowing updates to
//                                                specific fields without sending the entire resource body
    verifyJWT,
    updateAccountDetails
)

router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatar
)

router.route("/coverImage").post(
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
)

router.route("/c/:username").get(
    verifyJWT,
    getUserChannelProfile
)

router.route("/watchHistory").get(
    verifyJWT,
    getWatchHistory
)

export default router;
