import mongoose from "mongoose";

const subscriptionSchema=new mongoose.Schema({
    channel:{
        type:mongoose.Schema.Types.ObjectId,//the channel to which the user is subscribing
        ref:"User", 
    },

    subscribers:{
        type:mongoose.Schema.Types.ObjectId,//one who is subscribing to this subscription
        ref:"User",
        
    }
},{timestamps:true  });

export const Subscription=mongoose.model("Subscription",subscriptionSchema);