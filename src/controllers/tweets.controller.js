import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from '../models/tweet.model.js'
import { asyncHandler } from "../utils/asyncHandler";

//TODO: create tweet
const createTweet = asyncHandler( async (req,res) => {
    const { content } = req.body

    if(!content){
        throw new ApiError(400, "content is empty!");
    }

    const user = req.user._id  // comes from the middleware verifyJWT

    const tweet = await Tweet.create({
        owner: user,
        content: content
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        )
    )
})

// TODO: get user tweets
const getUserTweets = asyncHandler( async (req,res) => {
    const user = req.user._id

    const tweets = await Tweet.find({
        owner: user
    }).select("content -_id")  // select is used if i only needs to send the tweets instead of sending the whole document
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    )
})

export { 
    createTweet, 
    getUserTweets 
}