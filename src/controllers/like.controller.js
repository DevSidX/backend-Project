import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose ,{isValidObjectId} from "mongoose";
import { Like } from "../models/like.model.js"

const toggleVideoLike = asyncHandler( async (req,res) => {
    const { videoId } = req.params

    const user = req.user?._id

    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "video ID is Invalid!");
    }

    if(!user){
        throw new ApiError(401, "Unauthorized! user");
    }

    const videoStatus = await Like.findOne(
        {
            video: videoId,
            likedBy: user
        }
    )

    if(videoStatus){   // if like found then delete the like document    
        await Like.findByIdAndDelete(videoStatus._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked: false  // indicate that video is disliked
                },
                "Video unliked Successfully!"
            )
        )
    }

    await Like.create({ // if like not found then create a like for the video
        video: videoId,
        likedBy: user
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                isLiked: true   // indicate that video is liked
            },
            "Video liked Successfully!"
        )
    )
})

const toggleCommentLike = asyncHandler( async (req,res) => {
    const { commentId } = req.params
    const user = req.user?._id

    if(!commentId || !mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId!");
    }

    if(!user){
        throw new ApiError(401, "Unauthorized user!");
    }

    const commentStatus = await Like.findOne({
        comment: commentId,
        likedBy: user
    })

    if(commentStatus){ // delete if the comment is liked by the user
        await Like.findByIdAndDelete(commentStatus._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked: false
                },
                "Comment unliked successfully!"
            )
        )
    }

    await Like.create({
        comment: commentId,
        likedBy: user
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                isLiked: true
            },
            "Comment liked successfully!"
        )
    )
})

const toggleTweetLike = asyncHandler( async (req,res) => {
    const { tweetId } = req.params
    const user = req.user?._id

    if(!tweetId || !mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId!");
    }

    if(!user){
        throw new ApiError(401, "Unauthorized user!");
    }

    const tweetStatus = await Like.findOne({
        tweet: tweetId,
        likedBy: user
    })

    if(tweetStatus){ // delete if the tweet is liked by the user
        await Like.findByIdAndDelete(tweetStatus._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked: false
                },
                "Tweet unliked successfully!"
            )
        )
    }

    await Like.create({
        tweet: tweetId,
        likedBy: user
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked: true
                },
                "Tweet liked successfully!"
            )
        )
})

const getLikedVideos = asyncHandler( async (req,res) => {
    const userId = req.user?._id

    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId!");
    }

    const aggregate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $ne: null   // where video field is not null, 
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [{
                    $project: {
                        title: 1,
                        thumbnail: 1,
                        videoFile: 1,
                    }
                }]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $project: {
                _id: 0,
                video: "$videoDetails"
            }
        }
    ])
    
    if (aggregate.length === 0) {
        throw new ApiError(404, "Liked videos not found !")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            aggregate,
            "Liked videos fetched successfully!"
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}