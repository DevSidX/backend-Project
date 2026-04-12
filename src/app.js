import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares functions
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); // the data limit could be max 16 kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); //  serves static assets such as images, CSS, and JavaScript files directly to the client
app.use(cookieParser()) // to access and set



// routes IMPORT

import userRouter from './routes/user.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import VideoRouter from './routes/video.routes.js'
import commentRouter from './routes/comments.routes.js'
import tweetRouter from './routes/tweet.routes.js'

// routes declaration

app.use("/api/v1/users", userRouter)  // redirected to userRouter , EX :- https://localhost/8000/api/v1/users/register
app.use("/api/v1/subscriptions", subscriptionRouter)  // redirected to userRouter , EX :- https://localhost/8000/api/v1/users/register
app.use("/api/v1/video", VideoRouter)  // redirected to userRouter , EX :- https://localhost/8000/api/v1/users/register
app.use("/api/v1/comments", commentRouter)  // redirected to userRouter , EX :- https://localhost/8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter)  // redirected to userRouter , EX :- https://localhost/8000/api/v1/users/register

export default app;