import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {
    app.on('error', ((error) => {
        console.log("Error",error)
    }))
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port : ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MONGO DB connection failed", error);
});








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
