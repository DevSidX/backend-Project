import { Router } from "express";
import { verifyJWT } from 'jsonwebtoken'

const router = Router();

router.use(verifyJWT) // apply veriftJWT middleware to all the routes in this file

router.route("/").get(

)

router.route("/").get(
    
)

export default router