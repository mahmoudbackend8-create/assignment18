import { BadRequestExeption, MapGQLError, } from "../Common/Exeptions/DomainExeption.js";
import { regex, z } from "zod";
import { UserGender } from "../Common/Enums/User.Enums.js";
import { error } from "console";
import { fa } from "zod/locales";
import { Types } from "mongoose";
export function validation(ValidationScema, FileInBody = false) {
    return (req, res, next) => {
        const ValidationErrs = [];
        for (const Key of Object.keys(ValidationScema)) {
            if (Key == "body" && FileInBody == false) {
                req.body.files = req.files;
            }
            const ValidationResult = ValidationScema[Key].safeParse(req[Key]);
            if (!ValidationResult.success) {
                ValidationErrs.push(...ValidationResult.error.issues.map((ele) => {
                    return { path: ele.path, message: ele.message };
                }));
            }
        }
        if (ValidationErrs.length > 0) {
            throw new BadRequestExeption("validation ERR", { ValidationErrs });
        }
        next();
    };
}
export const CommonValidationFeilds = {
    id: z.string().refine((value) => {
        return Types.ObjectId.isValid(value);
    }, "Invalid ObjectId"),
    UserName: z.string().min(3, { error: "TooSmall" }).max(100),
    Email: z.email(),
    Password: z.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    ConfirmPassword: z.string(),
    Age: z.number().positive(),
    Gender: z.enum(UserGender),
    Phone: z.string(),
    OTP: z.string().regex(new RegExp(/\d{6}/)),
};
export function validationGQL(ValidationScema, value) {
    const ValidationResult = ValidationScema.safeParse(value);
    if (!ValidationResult.success) {
        MapGQLError(new BadRequestExeption("Validation Err", ValidationResult.error.issues.map((ele) => {
            return { path: ele.path, message: ele.message };
        })));
    }
}
export function validationRealTime(ValidationScema, value) {
    const ValidationResult = ValidationScema.safeParse(value);
    if (!ValidationResult.success) {
        throw new BadRequestExeption("Validation Err", ValidationResult.error.issues.map((ele) => {
            return { path: ele.path, message: ele.message };
        }));
    }
}
