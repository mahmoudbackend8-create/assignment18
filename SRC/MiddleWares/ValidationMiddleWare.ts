import type { NextFunction, Request, Response } from "express";
import { BadRequestExeption } from "../Common/Exeptions/DomainExeption.js";
import { regex, z, type ZodType } from "zod";
import { UserGender } from "../Common/Enums/User.Enums.js";
import { error } from "console";

type KeyReqType = keyof Request; //=>body |params|file|..........
export function validation(
  ValidationScema: Partial<Record<KeyReqType, ZodType>>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ValidationErrs: { path: PropertyKey[]; message: string }[] = [];

    /*  
      "ErrCause": {
        "ValidationErrs": [
            {
                "path": [
                    "UserName"
                ],
                "Message": "Too small: expected string to have >=3 characters"
            }
        ]
    },
     */
    for (const Key of Object.keys(ValidationScema) as KeyReqType[]) {
      //   if (ValidationScema[Key] == undefined) {
      //     continue;
      //   }
      const ValidationResult = ValidationScema[Key]!.safeParse(req[Key]);
      if (!ValidationResult.success) {
        // ValidationErrs.push(
        //   JSON.parse(ValidationResult.error.message).map((ele) => {
        //     return { path: ele.path, Message: ele.message };
        //   }),
        // ); zod already having errorPurse
        ValidationErrs.push(
          ...ValidationResult.error.issues.map((ele) => {
            // [[]] - []
            return { path: ele.path, message: ele.message };
          }),
        );
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

// Record<KeyReqType, ZodType>---keyof Request=> body: --ZodType=> z.strictObject .............
/* body: Z.strictObject({
    UserName: Z.string().min(3).max(100),
    email: Z.email(),
    Password: Z.string().regex(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}/),
    ConfirmPassword: Z.string(),
  }).refine(
    (data) => {
      return data.ConfirmPassword === data.Password;
    },
    {
      error: "Confirm password doesn.t match",
    },
  ),
*/

//Partial we put it to not send all keys (body - params )just one or two what we determine[]

//as KeyReqType[] we make it array because return of ( Object.keys(ValidationScema))

// ValidationScema[Key]! => that mean - iam sure value will come or make this
//      if (ValidationScema[Key] == undefined) {
//     continue;
//   }
