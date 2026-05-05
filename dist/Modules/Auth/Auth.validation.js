import Z from "zod";
import { UserGender } from "../../Common/Enums/User.Enums.js";
import { CommonValidationFeilds } from "../../MiddleWares/ValidationMiddleWare.js";
export const LoginSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
        Password: CommonValidationFeilds.Password,
    }),
};
export const SignUpSchema = {
    body: LoginSchema.body
        .extend({
        UserName: CommonValidationFeilds.UserName,
        ConfirmPassword: CommonValidationFeilds.ConfirmPassword,
        Age: CommonValidationFeilds.Age.optional(),
        Gender: CommonValidationFeilds.Gender.optional(),
        Phone: CommonValidationFeilds.Phone.optional(),
    })
        .refine((data) => {
        return data.ConfirmPassword === data.Password;
    }, {
        error: "Confirm password doesn.t match",
    }),
};
export const ConfirmEmailOTPSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
        OTP: CommonValidationFeilds.OTP,
    }),
};
export const ResendConfirmEmailOTPSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
    }),
};
export const ResendForgetOTPSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
    }),
};
export const sendForgetOTPSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
    }),
};
export const VarifyForgetPassOTPSchema = {
    body: Z.strictObject({
        Email: CommonValidationFeilds.Email,
        OTP: CommonValidationFeilds.OTP,
    }),
};
export const UpdateForgetPassSchema = {
    body: VarifyForgetPassOTPSchema.body.extend({
        Password: CommonValidationFeilds.Password,
    }),
};
export const SignUpWithGemailSchema = {
    body: Z.object({
        idToken: Z.string(),
    }),
};
