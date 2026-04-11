import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from '../models/video.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

// TODO: get all the videos based on query, sort, pagination
const getAllVideos = asyncHandler ( async (req,res) => {
    // fetch all the videos with applied filters from the Video collection
    // apply pagination - return data page wise not all at once
    // apply search (optional) - if query is given then find videos where title matches or description matches
    // apply sorting (optional) - based on sortBy and sortType
    // Filter by user (optional) - if userId is return the videos which are uploaded by the user
    // return only published videos (APPLY IN ALL)
    
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if(pageNum < 1 || limitNum < 1){
        throw new ApiError(400, "Invalid page or limit!");
    }

    if(userId && !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId");
    }

    // Filter - Only fetch published videos
    const match = {
        isPublished: true
    };

    // search query
    if(query && query.trim() !== ""){
        match.$or = [  // logical $or return if even one condition satisfies either title or description
            {
                title: {
                    $regex : query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ];
    }

    // filter - videos by specific users
    if(userId){
        match.owner = new mongoose.Types.ObjectId(userId)
    }

    // sort the results
    const sort = {
        [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
    };

    // aggregation
    const aggregate = Video.aggregate([
        {
            $match: match
        },
        {
            $sort: sort
        }
    ])

    // pagination
    const videos = await Video.aggregatePaginate(
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
            videos,
            "Videos fetched successfully"
        )
    )
})

// TODO: get video, upload to cloudinary, create video
const publishAVideo = asyncHandler ( async (req, res) => {
    const { title, description } = req.body

    if(!title?.trim()){
        throw new ApiError(400, "Title is required!");
    }
    if(!description?.trim()){
        throw new ApiError(400, "Description is required!");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required!")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required!")
    }

    // upload on cloudinary

    const videoUpload = await uploadOnCloudinary(videoLocalPath)

    if(!videoUpload?.url){
        throw new ApiError(400, "Video uploading Failed!!");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail?.url){
        throw new ApiError(400, "Thumbnail uploading Failed!!");
    }

    // store the data in database
    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoUpload.duration,
        owner: req.user?._id
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video published Successfully!"
        )
    )
})

//TODO: get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400, "Video ID is missing");
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video Fetched successfully!"
        )
    )
})

//TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video id");
    }

    const { title, description } = req.body
    const thumbnail = req.files?.thumbnail?.[0]?.path

    const updateDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title !== undefined && { title }),  // Only add the title property if title is not undefined
                ...(description !== undefined && { description }),  // same
                ...(thumbnail !== undefined && { thumbnail })  // same
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if(!updateDetails){
        throw new ApiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateDetails,
            "Video details updated successfully!"
        )
    )
})

//TODO: delete video
const deleteVideo = asyncHandler (async (req, res) => {
    const { videoId } = req.params

    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const deleteVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    })

    if(!deleteVideo){
        throw new ApiError(404, "Video not found or unauthorized!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deleteVideo,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler (async (req,res) => {
    const { videoId } = req.params

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished  // changed status

    await video.save({
        validateBeforeSave: false
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Publish status toggled successfully!"
        )
    )
})

export { 
    getAllVideos, 
    publishAVideo, 
    getVideoById ,
    updateVideo, 
    deleteVideo, 
    togglePublishStatus 
}