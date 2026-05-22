import mongoose, { Schema, Types } from "mongoose";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
const CommonSchema = new Schema({
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
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "PostModel", required: true },
    CommentId: { type: Types.ObjectId, ref: "CommentModel" },
    DeletedAt: Date,
}, { timestamps: true });
CommonSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (!query.GetSoftDelete) {
        this.setQuery({ ...query, DeletedAt: { $exists: false } });
    }
});
const CommentModel = mongoose.model("Comment", CommonSchema);
export default CommentModel;
