import type z from "zod";
import type { CreatePostValidation } from "./Post.Validation.js";

export type CreatePostDTO = z.infer<typeof CreatePostValidation.body>;
