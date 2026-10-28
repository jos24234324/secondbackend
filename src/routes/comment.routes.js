import { Router } from "express"; 
impot { getAllComments,createComment,updateComment,deleteComment } from "../controllers/comment.controller.js"; 
import { auther } from "../middlewares/auth.middleware.js";
const router=Router();
router.use(auther);
