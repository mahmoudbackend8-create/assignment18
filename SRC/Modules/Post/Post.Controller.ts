import express, { type Request, type Response } from "express";
import { validation } from "../../MiddleWares/ValidationMiddleWare.js";
import { CreatePostValidation } from "./Post.Validation.js";
import CloudFileUpload from "../../Common/Multer/Multer.Config.js";
import SuccessResponse from "../../Common/Response/SuccessResponse.js";
import PostService from "./Post.Service.js";
const PostRouter = express.Router();

PostRouter.post(
  "/CreatePost",
  CloudFileUpload({}).array("Attchments", 5),
  validation(CreatePostValidation),
  async (req:Request, res:Response) => {
    const result = await PostService.CreatePost(req.body)
    return SuccessResponse({ res, Msg: "Done",data:result });
  },
);

export default PostRouter;
