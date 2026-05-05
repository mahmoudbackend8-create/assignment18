import z from "zod";
export const LogOutSchema = {
    body: z.object({
        LogOutOption: z.enum(["All", "One"]),
    }),
};
export const UploadProfilePicSchema = {
    body: z.strictObject({
        originalname: z.string(),
        ContentType: z.string(),
    }),
};
