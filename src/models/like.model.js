import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"  
const likeSchema = new mongoose.Schema(
  {
    // Define your like schema fields here  
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

  },
  { timestamps: true }
);
likeSchema.plugin(mongooseAggregatePaginate);
const Like = mongoose.model("Like", likeSchema);