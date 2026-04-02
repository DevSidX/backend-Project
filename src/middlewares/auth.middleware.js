import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from '../models/user.model.js'

export const verifyJWT = asyncHandler (async (req, _, next) => {
   try {
     
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")  // second conditions will be used if the requestion is coming from mobile which doesnt has cookies
     
     if(!token){ // if token doesn't exist
         throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)  // checks Signature Verification, Expiry Check, Token Integrity
     
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401, "Invalid Access token");
     }
 
     req.user = user
     next()

   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
   }
})


/*

                ┌──────────────────────────┐
                │   Client (Browser/App)   │
                └──────────┬───────────────┘
                           │
                           │  Request (with token)
                           ▼
        ┌──────────────────────────────────────┐
        │   Protected Route (e.g. /profile)    │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │        verifyJWT Middleware          │
        └──────────────────┬───────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
   Extract token                  No token found
 (cookie OR header)                    │
            │                          ▼
            ▼                   ❌ 401 Unauthorized
     Token exists?
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
   YES             NO
     │             │
     ▼             ▼
Verify token   ❌ Reject request
(jwt.verify)
     │
     ▼
Is token valid?
     │
 ┌───┴────┐
 │        │
 ▼        ▼
YES       NO
 │        │
 ▼        ▼
Attach     ❌ 401 (Invalid/Expired)
req.user
 │
 ▼
next()
 │
 ▼
┌────────────────────────────┐
│   Controller Executes      │
│  (Access granted)          │
└──────────┬─────────────────┘
           │
           ▼
     Response sent

*/