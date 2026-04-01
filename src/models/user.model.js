import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,  // cloudinary cloud
            required: true,
        },
        coverImage: {
            type: String,  // cloudinary cloud
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

},{ timestamps: true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return;  // if already modified
    }
    this.password = await bcrypt.hash(this.password, 10) // it modifies the password 
    // next()
})

// custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)    // either true or false
}

// JWT Tokens - Mongoose instance method that generates a Short-Lived JWT (JSON Web Token).
userSchema.methods.generateAccessToken = function () {
    return jwt.sign( // generates new token
    {
        _id: this._id //  payload 
    },
    process.env.ACCESS_TOKEN_SECRET,   //  secret key
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY   // expiry time of 1 day
    }
    )
}

// JWT Tokens - a Long-Lived JWT (JSON Web Token) used to request new Access Tokens once the short-lived ones expire
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({      // payload - generates new refresh token
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,  // secret key
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY  // exoiry time of 10days
    }
    )
}

export const User = mongoose.model('User', userSchema)  // this will be used to call mongoose DB