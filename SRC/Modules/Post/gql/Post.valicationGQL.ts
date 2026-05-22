import { CommonValidationFeilds } from "../../../MiddleWares/ValidationMiddleWare.js";
import z from "zod";

export const ReactPostSchema = z.object({
  postId: CommonValidationFeilds.id,
  react: z.coerce.number(),
});
