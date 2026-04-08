import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from '../models/video.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

// TODO: get all the videos based on query, sort, pagination
const getAllVideos = asyncHandler ( async (req,res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
})

// TODO: get video, upload to cloudinary, create video
const publishAVideo = asyncHandler ( async (req,res) => {
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
        ApiResponse(
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

})

export { getAllVideos, publishAVideo }