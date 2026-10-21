import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  for (const field of [fullname, email, password, username]) {
    if (!field) {
      throw new ApiError(400, `Please fill the field ${field}`);
    }
    const existingUser = User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ApiError(409, "User already exists");
    };
    const avatarPath=req.files?.avatar[0]?.path;
    const coverImagePath=req.files?.coverImage[0]?.path;
    //avatar must be there;
    if(!avatarPath){
        throw new ApiError(400,"Avatar is required")
    };
    //now we upload to cloudinary;
    const avatar=await uploadOnCloudinary(avatarPath);
    const coverImage=await uploadOnCloudinary(coverImagePath);
    if(!avatar){
        throw new ApiError(400,"Avatar is required error during cloudinary")
    };
    //enter into the database;
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
        
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    };
    //user has been created now we have to give it back in response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )



    
  }
});
export { registerUser };
