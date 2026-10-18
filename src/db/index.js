import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

// import express from "express"
// const app=express();

const connectDB=async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGOdb is connected dbhost; ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("Mongo connection error",error);
        process.exit(1);//
    }
};
export default connectDB;