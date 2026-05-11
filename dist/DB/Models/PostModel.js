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
    DeletedAt: Date,
}, { timestamps: true });
PostSchema.pre(["findOne", "find"], function () {
    const query = this.getQuery();
    if (!query.GetSoftDelete) {
        this.setQuery({ ...query, DeletedAt: { $exists: false } });
    }
});
const PostModel = mongoose.model("Post", PostSchema);
export default PostModel;
