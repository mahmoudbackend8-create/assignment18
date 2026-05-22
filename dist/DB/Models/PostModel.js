import mongoose, { Schema, Types } from "mongoose";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
const PostSchema = new Schema({
    Content: {
        type: String,
        required: function () {
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
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
PostSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (!query.GetSoftDelete) {
        this.setQuery({ ...query, DeletedAt: { $exists: false } });
    }
});
PostSchema.virtual("Comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true,
});
const PostModel = mongoose.model("Post", PostSchema);
export default PostModel;
