
import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})


import app from "./app.js"
import connectDB from "./db/index.js";

connectDB().then(()=>{
    console.log("connectDB ran succesfully")
    app.on("error",(err)=>{
        console.log("error",err);
        throw err;
    })
    app.listen(process.env.PORT||8000)
}
).catch((error)=>{
    console.log("connectDB has failed",error);
}

)





















//never connect db directly wihtout using a promise for error handling and 
// (async ()=>{
//     try{
//        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`,);
//        app.on("error",(error)=>{
//             console.log("Error connecting to the database",error)
//        });
//        app.listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`)
//        })

//     }catch(error){
//         console.log("Error connecting to the database",error)
//     }
// })();

