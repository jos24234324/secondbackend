import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  //query is the search query, sortBy is the field to sort by, sortType is the type of sort (asc or desc), userId is the id of the user to get videos for
  //lets validate all the fields;
  if (!query) {
    throw new ApiError(400, "Query is required");
  }
  //now we will create the aggregate query to get the videos based on the query, sort, pagination
  if(userId && !isValidObjectId(userId)){
    throw new ApiError(400,"Invalid user id");
  }
  const aggregateQuery = [];
  if(userId){
    aggregateQuery.push({
      $match:{
        owner:new mongoose.Types.ObjectId(userId)
      }
    })
  }
  aggregateQuery=[...aggregateQuery,[
    {
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },
  ]];
  //now we will add the sort to the aggregate query
  
  if (sortBy && sortType) {
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;
    aggregateQuery.push({ $sort: sort });
  }
  //now we will add the pagination to the aggregate query
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const videos = await Video.aggregatePaginate(
    Video.aggregate(aggregateQuery),
    options
  );
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  //now we will get the video from the request
  const video = req.files.video ? req.files.video[0] : null;
  const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null;
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }
  
  if (!video) {
    throw new ApiError(400, "Video is required");
  }
  const uploadedVideo = await uploadOnCloudinary(video.path);
  if (!uploadedVideo) {
    throw new ApiError(500, "Video upload failed");
  };
  const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path);
  if (!uploadedThumbnail) {
    throw new ApiError(500, "Thumbnail upload failed");
  }
  const newVideo = await Video.create({
    title,
    description,
    videoUrl: uploadedVideo.url,
    owner: req.user._id,
    thumbnail: uploadedThumbnail.url,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {    
        throw new ApiError(400, "Invalid video id");
    }
  const video = await Video.findById(videoId).populate("owner", "-password -refreshToken");
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});
  //TODO: get video by id


const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid video id");
  }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"Video not found");
  }
  if(video.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not authorized to update this video");
  }
  const { title, description } = req.body;
  if(title){
    video.title = title;
  }
  if(description){
    video.description = description;
  }
  if(req.files.thumbnail){
    const thumbnail = req.files.thumbnail[0];
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path);
    if(!uploadedThumbnail){
      throw new ApiError(500,"Thumbnail upload failed");
    }
    video.thumbnail = uploadedThumbnail.url;
  }
  await video.save();
  return res.status(200).json(new ApiResponse(200,video,"Video updated successfully")); 
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid video id");
  }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"Video not found");
  }
  if(video.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not authorized to delete this video");
  }

    await video.deleteOne();
    return res.status(200).json(new ApiResponse(200,null,"Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
    if(!isValidObjectId(videoId)){  
        throw new ApiError(400,"Invalid video id");
    }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"Video not found");
  }
  if(video.owner.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not authorized to update this video");
  }
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200,video,"Video publish status updated successfully"));    
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
