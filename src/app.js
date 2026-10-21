import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";   

const app=express();
//use is used for middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,

}));
app.use(express.json({
    limit:"16kb",

}));
//for the spaceers
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(express.static("public"))

app.use(cookieParser())

//importing the routes;
import userRouter from "/Users/joshuafernandes/Desktop/backendProject/src/routes/user.routes.js"
 
//decalring the routes
app.use("/api/v1/users",userRouter)//passes control to routes


export default app;