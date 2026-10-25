import { asyncHandler } from "../utils/asynchandler.js";
import {User} from "../models/user.model.js"
import ApiError from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const auther=asyncHandler(async (req,res,next)=>{
    //we have to give the 
    //we may resieve it through header auth or fro cookies
    const accessToken=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    if(!accessToken){
        throw new ApiError(400,"accesstoken not receieved")
    };
    const token=await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    if(!token){
        throw new ApiError(400,"accesstoken expired or compromized");
    };
    //access token is available
    const id=token._id;
    const user=await User.findById(id);
    if(!user){
        throw new ApiError(400,"user with this id is not found crazy error")
    };
    //we need to make the refresh token field of this to null;
    
    req.user=user;
    next();
    

    
    
    //now we have the access token lets vaidate it)

    

})
export {auther}