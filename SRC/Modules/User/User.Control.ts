import express from "express";
import { authentication } from "../../MiddleWares/AuthenticationMiddelWare.js";
import SuccessResponse from "../../Common/Response/SuccessResponse.js";
import UserService from "./User.Service.js";
import { validation } from "../../MiddleWares/ValidationMiddleWare.js";
import { LogOutSchema, UploadProfilePicSchema } from "./User.Validation.js";
import CloudFileUpload from "../../Common/Multer/Multer.Config.js";
import { StorageApproachEnum } from "../../Common/Enums/Multer.js";
import { allowFileFormats } from "../../Common/Multer/MulterValidation.js";

const UserRouter = express.Router();

UserRouter.get("/Test", authentication(), (req, res) => {
  return SuccessResponse({ res, Msg: "done", data: req.user });
});
UserRouter.post(
  "/Upload-Profile",
  authentication(),
  // CloudFileUpload({
  //   StorageApproach: StorageApproachEnum.Disk,
  //   allowFileFormat: allowFileFormats.img,
  // }).single("ProfilePic"),//after refactor - beacuse we will make frontEnd send (   originalname,ContentType) directly

  validation(UploadProfilePicSchema),
  async (req, res) => {
    const result = await UserService.UploadProfilePic(req.body, req.user);
    return SuccessResponse({ res, Msg: "done", data: result });
  },
);
UserRouter.post(
  "/LogOut",
  authentication(),
  validation(LogOutSchema),
  async (req, res) => {
    const result = await UserService.logOut(
      req.user._id,
      req.payLoad,
      req.body.LogOutOption,
    );

    return SuccessResponse({ res, Msg: "done", data: result });
  },
);
UserRouter.delete("/Delete", authentication(), async (req, res) => {
  const result = await UserService.DeleteUser(req.user);
  return SuccessResponse({ res, Msg: "Deleted", data: result });
});
UserRouter.post(
  "/Upload-CoverPic",
  authentication(),
  CloudFileUpload({
    StorageApproach: StorageApproachEnum.Memory,
    allowFileFormat: allowFileFormats.img,
  }).array("CoverPic", 5),
  async (req, res) => {
    const result = await UserService.UploadCoverPic(
      req.files as Express.Multer.File[],
      req.user,
    );
    return SuccessResponse({ res, Msg: "done", data: result });
  },
);
export default UserRouter;
