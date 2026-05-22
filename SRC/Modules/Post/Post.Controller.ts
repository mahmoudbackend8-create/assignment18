import express, { type Request, type Response } from "express";
import { validation } from "../../MiddleWares/ValidationMiddleWare.js";
import {
  CreatePostValidation,
  FindPostsSchema,
  LikeDisLikeSchema,
  UpdatePostValidation,
} from "./Post.Validation.js";
import CloudFileUpload from "../../Common/Multer/Multer.Config.js";
import SuccessResponse from "../../Common/Response/SuccessResponse.js";
import PostService from "./Post.Service.js";
import { authentication } from "../../MiddleWares/AuthenticationMiddelWare.js";
const PostRouter = express.Router();

PostRouter.patch(
  "/UpdatePost/:postId",
  authentication(),
  CloudFileUpload({}).array("Attchments", 5),
  validation(UpdatePostValidation),
  async (req: Request, res: Response) => {
    const result = await PostService.UpdatePost(
      req.body,
      req.params.postId as string,
      req.user._id,
      req.files as Express.Multer.File[],
    );
    return SuccessResponse({ res, Msg: "Done", data: result });
  },
);
PostRouter.post(
  "/CreatePost",
  authentication(),
  CloudFileUpload({}).array("Attchments", 5),
  validation(CreatePostValidation),
  async (req: Request, res: Response) => {
    const result = await PostService.CreatePost(
      req.body,
      req.user._id,
      req.files as Express.Multer.File[],
    );
    return SuccessResponse({ res, Msg: "Done", data: result });
  },
);
PostRouter.post(
  "/GetPosts",
  authentication(),
  validation(FindPostsSchema),
  async (req: Request, res: Response) => {
    const result = await PostService.FindPosts(req.user, req.query);
    return SuccessResponse({ res, Msg: "Done", data: result });
  },
);
PostRouter.post(
  "/ReactPost/:postId",
  authentication(),
  validation(LikeDisLikeSchema),
  async (req: Request, res: Response) => {
    const result = await PostService.LikeAndDislikePost(
      req.params.postId as string,
      req.user,
      req.query.react as string,
    );
    return SuccessResponse({ res, Msg: "Done", data: result });
  },
);

export default PostRouter;
