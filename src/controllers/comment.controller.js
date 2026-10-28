import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apierror.js";
// import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiresponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  //i have to use aggregate to get the comments for a video and also get the owner of the comment
  const allcomments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        pipeline: [
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
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        mongoose.paginate(allcomments, { page, limit }),
        "Comments fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const user = req.user._id;
  for (const [name, field] of Object.entries({
    videoId,
    content,
  })) {
    if (!field) {
      throw new ApiError(400, `${name} is required`);
    }
  }
  const newComment = await Comment.create({
    content,
    owner: user,
    video: videoId,
  });
  if (!newComment) {
    throw new ApiError(500, "Something went wrong while adding comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));

  // Implementation for adding comment
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // Implementation for updating comment
  //first we need to check if the comment exists and if the user is the owner of the comment
  const { commentId } = req.params;
  const { content } = req.body;
  const user = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment.owner.toString() !== user.toString()) {
    throw new ApiError(403, "You are not the owner of this comment");
  }
  //run validation on the content field to check if it is not empty
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(500, "Something went wrong while updating comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const user = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment.owner.toString() !== user.toString()) {
    throw new ApiError(403, "You are not the owner of this comment");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(500, "Something went wrong while deleting comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
