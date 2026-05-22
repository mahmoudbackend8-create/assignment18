import express, { type Request, type Response } from "express";
import CommentService from "./Comment.Service.js";
import SuccessResponse from "../../Common/Response/SuccessResponse.js";
import { authentication } from "../../MiddleWares/AuthenticationMiddelWare.js";
import CloudFileUpload from "../../Common/Multer/Multer.Config.js";
const CommentRouter = express.Router();

CommentRouter.post(
  "/CreateComment/:postId",
  authentication(),
  CloudFileUpload({}).array("Pics", 10),
  async (req, res) => {
    const result = await CommentService.CreateComment(
      req.body,
      req.user,
      req.params.postId as string,
      req.files as Express.Multer.File[],
    );
    return SuccessResponse({ res, data: result });
  },
);
CommentRouter.post(
  "/:postId/replay/:CommentId",
  authentication(),
  CloudFileUpload({}).array("Pics", 10),
  async (req, res) => {
    const result = await CommentService.ReplyComment(
      req.body,
      req.user,
      req.params.postId as string,
      req.params.CommentId as string,
      req.files as Express.Multer.File[],
    );
    return SuccessResponse({ res, data: result });
  },
);
CommentRouter.get(
  "/:CommentId",
  authentication(),
  async (req, res) => {
    const result = await CommentService.ReplyComment(
      req.body,
      req.user,
      req.params.postId as string,
      req.params.CommentId as string,
      req.files as Express.Multer.File[],
    );
    return SuccessResponse({ res, data: result });
  },
);

export default CommentRouter;
