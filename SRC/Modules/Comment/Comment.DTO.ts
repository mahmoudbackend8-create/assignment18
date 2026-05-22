import type z from "zod";
import type {
  CreatePostValidation,
  FindPostsSchema,
  UpdatePostValidation,
} from "./Post.Validation.js";

export type CreatePostDTO = z.infer<typeof CreatePostValidation.body>;
export type FindPostsDTO = z.infer<typeof FindPostsSchema.query>;
export type UpdatePostDTO = z.infer<typeof UpdatePostValidation.body>;
