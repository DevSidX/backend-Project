import dotenv from "dotenv"; // dotenv is used to load environment variables from a .env file into your Node.js application.
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB() // method
.then(() => {
    const PORT = process.env.PORT || 8000;

    const server = app.listen(PORT, () => {
        console.log(`App is listening on port : ${PORT}`)
    })
    
    server.on("error", (err) => {
        console.log("Server error",err);
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed !!!: ",err);
})






// import express from "express"

//  const app = express()

// // connect database
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

//     app.on("Error", (error) => {
//         console.log("error: ", error)
//         throw error
//     })

//     app.listen(process.env.PORT, () => {
//         console.log(`App is listening on PORT : ${process.env.PORT}`);

//     })

//   } catch (error) {
//     console.log("Error: ", error);
//     throw err;
//   }
// })();
