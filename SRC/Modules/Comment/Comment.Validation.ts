import z from "zod";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
import { Types } from "mongoose";
import { CommonValidationFeilds } from "../../MiddleWares/ValidationMiddleWare.js";

export const CreatePostValidation = {
  body: z
    .object({
      Content: z.string().min(3).max(1000).optional(),
      files: z.array(z.any()).optional(),
      Tages: z.array(z.string()).optional(),
      Privacy: z.coerce.number().default(PostPrivacyEnum.Public),
      createdBy: z.array(z.string()),
    })
    .superRefine((args, ctx) => {
      if (!args.files?.length && !args.Content) {
        ctx.addIssue({
          code: "custom",
          path: ["Content"],
          message: "You MUst add Content Or Attchment",
        });
      }
      for (const tag of args.Tages as string[]) {
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            path: ["Tages"],
            message: `Invalid Tag ObjectId${tag}`,
          });
        }
      }
      const UniqueTag = [...new Set(args.Tages)]; //[1,2,3,1]=>[1,2,3]
      if (UniqueTag.length != args.Tages?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["Tages"],
          message: `Dublicated Tags`,
        });
      }
    }),
};
export const UpdatePostValidation = {
  body: z
    .object({
      Content: z.string().min(3).max(1000).optional(),
      files: z.array(z.any()).optional(),
      Removefiles: z.array(z.string()).optional(),
      Tages: z.array(CommonValidationFeilds.id).optional(),
      RemoveTages: z.array(CommonValidationFeilds.id).optional(),
      Privacy: z.coerce.number().optional(),
      createdBy: z.array(z.string()),
    })
    .superRefine((args, ctx) => {
      for (const tag of args.Tages as string[]) {
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            path: ["Tages"],
            message: `Invalid Tag ObjectId${tag}`,
          });
        }
      }
      const UniqueTag = [...new Set(args.Tages)]; //[1,2,3,1]=>[1,2,3]
      if (UniqueTag.length != args.Tages?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["Tages"],
          message: `Dublicated Tags`,
        });
      }
    }),
  params: z.object({ postId: CommonValidationFeilds.id }),
};

export const FindPostsSchema = {
  query: z.object({
    Page: z.coerce.number().optional(), //because any caracter in query is string b default
    Limit: z.coerce.number().optional(),
    Search: z.string().optional(),
  }),
};
export const LikeDisLikeSchema = {
  query: z.object({
    react: z.coerce.number()
  }),
};
