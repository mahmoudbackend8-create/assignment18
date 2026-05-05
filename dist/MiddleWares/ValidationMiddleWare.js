import { BadRequestExeption } from "../Common/Exeptions/DomainExeption.js";
import { regex, z } from "zod";
import { UserGender } from "../Common/Enums/User.Enums.js";
import { error } from "console";
export function validation(ValidationScema) {
    return (req, res, next) => {
        const ValidationErrs = [];
        for (const Key of Object.keys(ValidationScema)) {
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
    UserName: z.string().min(3, { error: "TooSmall" }).max(100),
    Email: z.email(),
    Password: z.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    ConfirmPassword: z.string(),
    Age: z.number().positive(),
    Gender: z.enum(UserGender),
    Phone: z.string(),
    OTP: z.string().regex(new RegExp(/\d{6}/)),
};
