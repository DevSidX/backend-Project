import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler( async (req, res) => {
    const userId = req.user._id

    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserId");
    }

    const totalVideoViewsAgg = await Video.aggregate([
        {
            $match: { 
                owner: new mongoose.Types.ObjectId(userId)  // select only videos which are owned by the user
            }
        },
        {
            $group:{
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalViews = totalVideoViewsAgg[0]?.totalViews || 0;

    // total subscribers
    const totalSubscribers = await Subscription.countDocuments({  // return the total number of documents in the subscription collection where channel is the userId
        channel: userId,
    })

    // total videos
    const totalVideos = await Video.countDocuments({  // return the total number of document in the video collection where the owner is userId 
        owner: userId
    })

    // total likes
    const totalLikesAgg = await Like.aggregate([
        {
            $lookup: {  // Join like to Video
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        // filter videos of the channel
        {
            $match: {
                "videoDetails.owner" : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const totalLikes = totalLikesAgg[0]?.totalLikes || 0;

    const stats = {
        totalViews,
        totalSubscribers,
        totalVideos,
        totalLikes
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            stats,
            "channel stats fetched successfully"
        )
    )
})

// TODO: Get all the videos uploaded by the channel/user  - with pagination 
const getChannelVideos = asyncHandler( async (req,res) => {
    const userId = req.user?._id

    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserId");
    }

    // page and limit from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit   // how many documents to ignore from the start

    const allVideos = await Video.find({
        owner: userId
    })
    .sort({ createdAt: -1 })  // latest first
    .skip(page)
    .limit(limit)

    if(allVideos.length === 0){
        throw new ApiError(404, "Videos not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                page,
                limit,
                allVideos
            },
            "Videos fetched successfully!"
        )
    )
})


// const getChannelVideos = asyncHandler( async (req,res) => {
//     const userId = req.user?._id

//     if(!userId || !mongoose.isValidObjectId(userId)){
//         throw new ApiError(400, "Invalid UserId");
//     }

//     const allVideos = await Video.find({
//         owner: userId
//     }).sort({
//         createAt: -1
//     })

//     if(allVideos.length === 0){
//         throw new ApiError(404, "Videos not found");
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             allVideos,
//             "Videos fetched successfully!"
//         )
//     )
// })


export {
    getChannelStats,
    getChannelVideos
}