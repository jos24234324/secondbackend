import { Router } from "express";   
import { registerUser,loginUser,logoutUser,resetPassword,getCurrentUser,updateUserAvatar,updateUserDetails,updateUserCoverImage,getUserWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { auther } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
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
router.route("/reset-password").post(auther,resetPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(auther,getCurrentUser);
router.route("/update-user-details").put(auther,updateUserDetails);
router.route("/update-user-avatar").put(auther,upload.single("avatar"),updateUserAvatar);
router.route("/update-user-cover-image").put(auther,upload.single("coverImage"),updateUserCoverImage);
router.route("/watch-history").get(auther,getUserWatchHistory);
export default router;