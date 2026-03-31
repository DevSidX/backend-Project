import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler (async (req , res) => {
    // get user deatils from front-end        T
    // validation - not empty                 T
    // check if the user is already registered through username or email      T
    // check for images and avatar      T
    // upload them to cloudinary, avatar     T
    // create user object - create entry in Darabase DB     T
    // remove password and refresh token field from response      T
    // check for for user creation            T
    // return response       T

    const { fullName, username, email, password} = req.body
    
    // console.log("email: ", email);
    // console.log("Username: ", username);

    if ( [fullName, username, email, password].some((field) => !field || field.trim() === "") ) {
        throw new ApiError(400, "All fields are required!!");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Valid email is required!!");
    }

    // find if the username or email already exists in the database or not
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })    

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists!");
    }
    // avatar is file (png,jpg,jpeg ....)
    const avatarLocalPath = req.files?.avatar?.[0]?.path  // trying to safely extract the uploaded avatar file path from the request
    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    // console.log(req.files);
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!");
    }

    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar uploaded failed!");
    }
    
    // entry in the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // bcoz coverImage is not required so check if the coverImage is present the extract its url otherwise empty string
        email,
        password,
        username: username.toLowerCase()
    })

    const userCreated = await User.findById(user._id).select(   // this _id is defined by mongo
        "-password -refreshToken"  // don't want password and refreshToken thats why used (-) minus sign
    ) 

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "user registered Successfully!!")
    )
}) 

export { registerUser }