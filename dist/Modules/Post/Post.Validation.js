import z from "zod";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
import { Types } from "mongoose";
export const CreatePostValidation = {
    body: z
        .object({
        Content: z.string().optional(),
        files: z.array(z.any()).optional(),
        Tages: z.array(z.string()).optional(),
        Privacy: z.coerce.number().default(PostPrivacyEnum.Public),
    })
        .superRefine((args, ctx) => {
        if (!args.files?.length && !args.Content) {
            ctx.addIssue({
                code: "custom",
                path: ["Content"],
                message: "You MUst add Content Or Attchment",
            });
        }
        for (const tag of args.Tages) {
            if (!Types.ObjectId.isValid(tag)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["Tages"],
                    message: `Invalid Tag ObjectId${tag}`,
                });
            }
        }
        const UniqueTag = [...new Set(args.Tages)];
        if (UniqueTag.length != args.Tages?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["Tages"],
                message: `Dublicated Tags`,
            });
        }
    }),
};
