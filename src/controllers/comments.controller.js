import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//TODO: get all comments for a video
const getVideoComments = asyncHandler( async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10,} = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if(pageNum < 1 || limitNum < 1){
        throw new ApiError(400, "Invalid page or limit!");
    }

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // aggregation pipeline
    // retrive only those comments that belongs to the user
    // show comments order - Latest first
    // join each comments with its corresponding userx

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)  // filter by video
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner", // user who comments
                pipeline: [{
                    $project: {
                        _id: 1,
                        username: 1,
                        avatar: 1
                    }
                }]
            }
        },
        {
            $unwind: "$owner" // Convert owner array → object
        },
        {
            // sort
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: 1
            }
/*
{
  "_id": "commentId",
  "content": "Nice video",
  "createdAt": "2026-04-10T...",
  "owner": {
    "_id": "userId",
    "username": "siddharth",
    "avatar": "image.png"
}
}
*/
        }
    ])

    //pagination
    const commentsPaginate = await Comment.aggregatePaginate(
        aggregate,
        {
            page: pageNum,
            limit: limitNum
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            commentsPaginate,
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler( async(req,res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if(!content?.trim()){
        throw new ApiError(400, "Content is required!");
    }

    const comment = await Comment.create({ // created a document and added the comment
        content: content,
        owner: req.user?._id,
        video: videoId
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler( async (req,res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    if(!content?.trim()){
        throw new ApiError(400, "Content is required!");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id // ownership
        },
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    if(!updatedComment){
        throw new ApiError(404, "Comment not found! or Unauthorized")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler( async (req,res) => {
    const { commentId } = req.params

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const deleteComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })

    if(!deleteComment){
        throw new ApiError(404, "Comment not found or Unauthorized");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deleteComment,
            "comment deleted successfully"
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}