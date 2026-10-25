import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { fullname, email, password, username } = req.body;
  for (const [name, field] of Object.entries({
    fullname,
    email,
    password,
    username,
  })) {
    if (!field) {
      throw new ApiError(400, `${name} is required`);
    }
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  // console.log(req);
  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = coverImagePath
    ? await uploadOnCloudinary(coverImagePath)
    : null;

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succesfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  for (const [name, field] of Object.entries({ password, username })) {
    if (!field) {
      throw new ApiError(400, `${name} is required`);
    }
  }
  //all the fields are present;
  //now check if password corresponding to the username is correct;
  const user = await User.findOne({ username });
  if (!user) {
    throw new ApiError(400, `user does not exist`);
  }
  //now the user exists;
  //checking the password mathches;
  //now he is log
  if (await user.verifyPassword(password)) {
    
  } else {
    throw new ApiError(400, `password doesnt match`);
  };

  //giving him the refresh and access tokens;
  const accestoken=await user.generateAccessToken();
  const refreshtoken=await user.generateRefreshToken();
  user.refreshToken=refreshtoken;
  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure:true,
  };

  return res
      .status(201)
      .cookie("accessToken", accestoken, options)
      .cookie("refreshToken", refreshtoken, options )
      .json(new ApiResponse(200,user.select("-password -refreshToken"),"User logged in succesfully"));
});
const logoutUser = asyncHandler(async (req, res) => {
  //now we need to know which user is logged in and logout him;
  const user = req.user;
  user.refreshToken = "";
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "User logged out succesfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token not received");
  };
  //verify the jwt
  const decoded = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) {
    throw new ApiError(400, "Refresh token expired or compromised");
  };
  const id = decoded._id;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(400, "User with this id is not found");
  }
  if (user.refreshToken !== refreshToken) {
    throw new ApiError(400, "Refresh token does not match");
  }
  //now we need to generate a new access token and refresh token for this user;

  const accessToken = await user.generateAccessToken();
  const newrefreshToken = await user.generateRefreshToken();
  user.refreshToken=newrefreshToken;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", newrefreshToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, null, "Access token refreshed successfully"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
