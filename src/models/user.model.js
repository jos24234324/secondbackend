import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"  
import jwt from "jsonwebtoken"
import bcrypt, { compare } from "bcryptjs"

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        

    },
    fullname:{
        type:String,
        required:true,
        
        lowercase:true,
        trim:true,
        

    },
    
    avatar:{
        type:String,//we will get from cloudnary
        required:true,
        

    },
    coverImage:{
        type:String,

    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,"password is required"]

    },
    refreshToken:{
        type:String,
    }

},{timestamps:true});

// userSchema.plugin(mongooseAggregatePaginate);
userSchema.pre("save",async function(){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
    }
    
})
userSchema.methods.verifyPassword=async function (password) {
   return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken=async function () {
    return await jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,


        },
        process.env.ACCESS_TOKEN_SECRET,
        {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
)
}
userSchema.methods.generateRefreshToken=async function () {
    return await jwt.sign({
        _id:this._id,
        


        },
        process.env.REFRESH_TOKEN_SECRET,
        {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    })
}
export const User=mongoose.model("User",userSchema);