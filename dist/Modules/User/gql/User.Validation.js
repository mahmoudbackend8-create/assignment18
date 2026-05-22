import { CommonValidationFeilds } from "../../../MiddleWares/ValidationMiddleWare.js";
import z from "zod";
export const idValidation = z.object({
    userId: CommonValidationFeilds.id,
});
