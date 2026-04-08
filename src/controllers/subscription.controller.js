import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js"

const toggleSubscription = asyncHandler ( async (req, res) => {
    const { channelId } = req.params
    const subscriber = req.user?._id

    if(!channelId){
        throw new ApiError(400, "channel ID is Invalid!");
    }

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "channel ID is missing!");
    }

    if(!subscriber){
        throw new ApiError(401, "subscriber is missing!");
    }

    if(subscriber.toString() === channelId){
        throw new ApiError(400, "you cannot subscribe to your channel!");
    }

    const subscriptionStatus = await Subscription.findOne({
        subscriber,
        channel: channelId
    })

    if(subscriptionStatus){
        // Unsubscribe
        await Subscription.findOneAndDelete({
            subscriber,
            channel: channelId
        });

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Unsubscribed Successfully!"
            )
        )
    }

    // Subscribe
    await Subscription.create({
        subscriber,
        channel: channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Subscribed successfully!"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscriber = asyncHandler( async (req, res) => {
    const { channelId } = req.params
    if(!channelId){
        throw new ApiError(400, "Channel ID is missing")
    }

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id!");
    }

    // subscribers is present
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber", // subscriber details array
                pipeline: [{
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }]
            },
        },
        {
            $unwind: "$subscriber"  // $unwind operator in MongoDB is an aggregation pipeline stage used to deconstruct an array field 
        },
        {
            $replaceRoot: {
                newRoot : "$subscriber"  // to replace the whole array of unwanter items to subscribers details
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "userChannel subscribers fetched!"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannel = asyncHandler( async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(400, "subscriber I'd is missing!");
    }

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber!");
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)   // document where subscriber field is equals to user subscriberId
            }
        }, // subscriber contains multiple rows with subscriberId with channelId
        {
            $lookup: {
                from: "users",
                localField: "channel",  // channel I'ds
                foreignField: "_id",  // use _id
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $replaceRoot: {
                newRoot: "$channelDetails"
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channels,
            "Channel list fetched"
        )
    )
})

export { toggleSubscription, getUserChannelSubscriber, getSubscribedChannel }