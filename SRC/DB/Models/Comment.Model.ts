import mongoose, { Schema, type HydratedDocument, Types } from "mongoose";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
import type { Ipost } from "./PostModel.js";

export interface IComment {
  Content?: string;
  Attchments?: string[];
  Likes?: Types.ObjectId;
  Tages?: Types.ObjectId;
  postId: Types.ObjectId | Ipost;
  CommentId: Types.ObjectId;
  DeletedAt: Date;
  createdBy: Types.ObjectId;
}

export type IHComment = HydratedDocument<IComment>;
const CommonSchema = new Schema<IComment>(
  {
    Content: {
      type: String,
      required: function (): boolean {
        return !this.Attchments?.length;
      },
    },
    Attchments: {
      type: [String],
    },
    Likes: {
      type: Types.ObjectId,
      ref: "User",
    },
    Tages: {
      type: Types.ObjectId,
      ref: "User",
    },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "PostModel", required: true },
    CommentId: { type: Types.ObjectId, ref: "CommentModel" },
    DeletedAt: Date,
  },
  { timestamps: true },
);

CommonSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (!query.GetSoftDelete) {
    //undefined if we didn.t send it
    this.setQuery({ ...query, DeletedAt: { $exists: false } }); // adding in query Soft DElete - don.t restore deletedData
  }
});

const CommentModel = mongoose.model<IComment>("Comment", CommonSchema);
export default CommentModel;
