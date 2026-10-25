import { Router } from "express";   
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();
router.route("/register").post(
    //multer will take the files from here and put them in the 
    //multre will upload the elemnts while taking from the request with same name;
    upload.fields([{
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1,
    }])
,
    registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(auther,logoutUser);
export default router;