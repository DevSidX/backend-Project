import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findOne(userId)
        // new tokens generated
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken      // added the refresh token in the user object
        await user.save({ validateBeforeSave: false })  // Bypassing validation

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while gerenating refresh and access token");
    }
}


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

    const { fullName, username, email, password} = req.body   // JSON payload
    
    // console.log("email: ", email);
    // console.log("Username: ", username);

    if ( [fullName, username, email, password].some((field) => !field || field.trim() === "") ) {
        throw new ApiError(400, "All fields are required!!");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {     // if email doesn't has @
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

    return res
    .status(201)
    .json(
        new ApiResponse(200, userCreated, "user registered Successfully!!")
    )
}) 

const loginUser = asyncHandler( async (req, res) => {
    
    // req.body -> data of user
    // login with username or email
    // find the user - if the user found
    // check for the password - if the password also matched
    // then access and refresh token 
    // send cookies - send access and refresh token

    const { username, email, password } = req.body
    
    if(!(username || email)){
        throw new ApiError(400, "Username or Email doesn't exist");
    }

    const user = await User.findOne({
        $or: [{username}, {email}] // either username or email
    })

    if(!user){  // if the user doesn,t exist
        throw new ApiError(400, "User doesn't exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(isPasswordValid){
        throw new ApiError(401, "Incorrect password"); // or invalid user credentials
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) // will get new accessToken and refresh token

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken") // this contain all the fields instead of password refreshToken

    // send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, 
        { // data of ApiResponse
            user: loggedInUser, accessToken, refreshToken 
        },
        "User logged In Successfully"
    )
    )
})

const logoutUSer = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { // whats needs to be updated
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = { //  to update the cookies
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged Out Successfully")
    )
})

export { registerUser, loginUser, logoutUSer }