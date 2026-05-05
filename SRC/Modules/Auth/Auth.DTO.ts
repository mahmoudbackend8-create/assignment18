import type Z from "zod";
import type { ConfirmEmailOTPSchema, LoginSchema, ResendConfirmEmailOTPSchema, ResendForgetOTPSchema, sendForgetOTPSchema, SignUpSchema, UpdateForgetPassSchema, VarifyForgetPassOTPSchema } from "./Auth.validation.js";

export type signUpDTO = Z.infer<typeof SignUpSchema.body>; //type of schema
export type LoginDTO = Z.infer<typeof LoginSchema.body>; //type of schema
export type ConfirmEmailDTO = Z.infer<typeof ConfirmEmailOTPSchema.body>; //type of schema
export type ResendConfirmEmailDTO = Z.infer<typeof ResendConfirmEmailOTPSchema.body>; //type of schema
export type ResendForgetDTO= Z.infer<typeof ResendForgetOTPSchema.body>; //type of schema
export type sendForgetOTPDTO= Z.infer<typeof sendForgetOTPSchema.body>; //type of schema
export type VarifyForgetPassOTPDTO= Z.infer<typeof VarifyForgetPassOTPSchema.body>; //type of schema
export type UpdateForgetPassDTO= Z.infer<typeof UpdateForgetPassSchema.body>; //type of schema

// export interface signUpDTO extends LoginDTO {
//   UserName: string;
// }
