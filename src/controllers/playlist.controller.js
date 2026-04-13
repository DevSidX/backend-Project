import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from '../models/playlist.model.js'
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler( async (req, res) => {
    const { name, description } = req.body
    const user = req.user?._id

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "All fields required");
    }

    const playlist = await Playlist.create({
        owner: user,
        name,
        description,
        videos: [],
    })

    if(!playlist){
        throw new ApiError(500, "Something went wrong while creating playlist!");
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "New playlist created successfully!"
        )
    )
})

const getUserPlaylist = asyncHandler( async (req, res) => {
    const { userId } = req.params

    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userId");
    }

    const playlist = await Playlist.find({
        owner: userId
    }) 

    if(playlist.length === 0){
        throw new ApiError(404, "Playlist doesn't exist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched successfully!"
        )
    )
})

const getPlaylistById = asyncHandler( async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId || !mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist
    .findById(playlistId)
    .populate("owner", "username avatar")
    .populate("videos", "title thumbnail")

    if(!playlist){
        throw new ApiError(404, "Playlist not found!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
})

const updatePlaylist = asyncHandler( async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    
    if(!playlistId || !mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlistId");
    }

    if(!name && !description){
        throw new ApiError(400, "All fields required");
    }

    const updateFields = {}

    if (name) updateFields.name = name
    if (description) updateFields.description = description

    const updatePlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: updateFields // we have used this because we want to partially update this like only name or only description
        },
        {
            new: true
        }
    )

    if(!updatePlaylist){
        throw new ApiError(404, "Playlst updation failed!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatePlaylist,
            "Playlist updated successfully"
        )
    )
})

const deletePlaylist = asyncHandler( async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId || !mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlistId");
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    if(!deletedPlaylist){
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler( async (req,res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId or missing");
    }

    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId or missing");
    }

    const addVideoToPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if(!addVideoToPlaylist){
        throw new ApiError(404, "Playlist not found or Unauthorized!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            addVideoToPlaylist,
            "Video added to the playlist successfully!"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler( async (req,res) => {
    const { playlistId, videoId } = req.params

     if(!playlistId || !mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId or missing");
    }

    if(!videoId || !mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId or missing");
    }

    const videoExist = await Video.exists({ _id: videoId })

    if(!videoExist){
        throw new ApiError(404, "Video doesn't exist in the database!");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or Unauthorized!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from the playlist successfully!"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}