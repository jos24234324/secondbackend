
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
})

import express from "express"

const app=express();

import connectDB from "./db/index.js";

connectDB();





















//never connect db directly wihtout using a promise for error handling and 
// (async ()=>{
//     try{
//        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`,);
//        app.on("error",(error)=>{
//             console.log("Error connecting to the database",error)
//        });
//        app.listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`)
//        })

//     }catch(error){
//         console.log("Error connecting to the database",error)
//     }
// })();

