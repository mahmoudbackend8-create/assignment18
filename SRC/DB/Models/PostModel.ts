import mongoose, { Schema, type HydratedDocument, Types } from "mongoose";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";

export interface Ipost {
  Content?: string;
  Attchments?: string[];
  Likes?: Types.ObjectId;
  Tages?: Types.ObjectId;
  Privacy: PostPrivacyEnum;
  DeletedAt: Date;
  createdBy: Types.ObjectId;
}

export type IHpost = HydratedDocument<Ipost>;
const PostSchema = new Schema<Ipost>(
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

    Privacy: {
      type: Number,
      enum: PostPrivacyEnum,
      default: PostPrivacyEnum.Public,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    DeletedAt: Date,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

PostSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (!query.GetSoftDelete) {
    //undefined if we didn.t send it
    this.setQuery({ ...query, DeletedAt: { $exists: false } }); // adding in query Soft DElete - don.t restore deletedData
  }
});
PostSchema.virtual("Comments", {
  localField: "_id",
  foreignField: "postId",
  ref: "Comment",
  justOne: true, //show first one byDefault - reduce Load On server
});
const PostModel = mongoose.model<Ipost>("Post", PostSchema);
export default PostModel;
