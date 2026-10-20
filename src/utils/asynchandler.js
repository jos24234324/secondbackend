//we will just make a method and export it
const asyncHandler=(requestHandler)=>{
    //now we hadle the requesthandler as a promise
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
    }
   
    
}
export {asyncHandler}






















// const asyncHandler=()=>{

// }
// export {asyncHandler}
// const asyncHandler=(fn)=>{
//     async(req,res,next)=>{
//         try{
//             await fn(req,res,next);
//         }
//         catch(error){
//             res.status(error.code||500).json({
//                 success:"false",
//                 message:"error.message"
//             })
//         }
//     }
// }