import express, { type Request, type Response } from "express";
import AuthService from "./Auth.Service.js";
import SuccessResponse from "../../Common/Response/SuccessResponse.js";
import type { signUpDTO } from "./Auth.DTO.js";
import Z from "zod";
import { BadRequestExeption } from "../../Common/Exeptions/DomainExeption.js";
import {
  ConfirmEmailOTPSchema,
  LoginSchema,
  ResendConfirmEmailOTPSchema,
  ResendForgetOTPSchema,
  sendForgetOTPSchema,
  SignUpSchema,
  SignUpWithGemailSchema,
  UpdateForgetPassSchema,
  VarifyForgetPassOTPSchema,
} from "./Auth.validation.js";
import { validation } from "../../MiddleWares/ValidationMiddleWare.js";

const AuthRouter = express.Router();

AuthRouter.get("/", (req, res) => {
  return SuccessResponse({ res, Msg: "Auth Page" });
});

AuthRouter.post("/SignUp", validation(SignUpSchema), async (req, res) => {
  // try {
  //     const SignUpSchema = {
  //   body: Z.strictObject({
  //     UserName: Z.string(),
  //     email: Z.email(),
  //     Password: Z.string(),
  //   })}
  //   const ValidationResult = SignUpSchema.body.parse(req.body)
  // } catch (error) {
  //   throw new BadRequestExeption("validation ERR",{error:JSON.parse(error as string)})
  // }

  const result = await AuthService.SignUp(req.body);
  return SuccessResponse<any>({ res, Msg: "SignUp", data: result });
});
AuthRouter.post(
  "/LogIn",
  validation(LoginSchema),
  async (req: Request, res: Response) => {
    const result = await AuthService.Login(req.body);
    return SuccessResponse<{ AccessToken: string; RefreshToken: string }>({
      res,
      data: result,
    });
  },
);
AuthRouter.post(
  "/ConfirmEmail",
  validation(ConfirmEmailOTPSchema),
  async (req: Request, res: Response) => {
    await AuthService.ConfirmEmail(req.body);
    return SuccessResponse({
      res,
      data: "Confirmed",
    });
  },
);
AuthRouter.post(
  "/ResendForgetPass",
  validation(ResendForgetOTPSchema),
  async (req: Request, res: Response) => {
    await AuthService.resendOTPForgetPassword(req.body.Email);
    return SuccessResponse({
      res,
      data: "Confirmed",
    });
  },
);
AuthRouter.post(
  "/SendForgetPassOTP",
  validation(sendForgetOTPSchema),
  async (req: Request, res: Response) => {
    const result = await AuthService.sendOTPForgerpassword(req.body.Email);
    return SuccessResponse({
      res,
      data: "Check Your Inbox",
    });
  },
);
AuthRouter.post(
  "/VarifyForgetPassOTP",
  validation(VarifyForgetPassOTPSchema),
  async (req: Request, res: Response) => {
    const result = await AuthService.verifyOTPForgetPassward(req.body);
    return SuccessResponse({
      res,
      data: "Varified",
    });
  },
);
AuthRouter.post(
  "/UpdateForgetPass",
  validation(UpdateForgetPassSchema),
  async (req: Request, res: Response) => {
    const result = await AuthService.updateForgetPassword(req.body);
    return SuccessResponse({
      res,
      data: "Password Updated",
    });
  },
);
AuthRouter.post(
  "/SignUp/Gmail",
  validation(SignUpWithGemailSchema),
  async (req: Request, res: Response) => {
    const result = await AuthService.signUpWithGmail(req.body.idToken);
    return SuccessResponse<{
      status: number;
      result: {
        AccessToken: string;
        RefreshToken: string;
      };
    }>({
      res,
      data: result,
    });
  },
);
export default AuthRouter;
