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

export default app;
