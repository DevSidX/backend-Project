import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannel, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT) // apply veriftJWT middleware to all the routes in this file

router.route("/:channelId").post(
    toggleSubscription
)

router.route("/:channelId/subscribers").get(
    getUserChannelSubscriber
)

router.route("/user/:subscriberId").get(
    getSubscribedChannel
)

export default router