import type z from "zod";
import type { UploadProfilePicSchema } from "./User.Validation.js";

export type UploadProfilePicDTO = z.infer<typeof UploadProfilePicSchema.body>;
