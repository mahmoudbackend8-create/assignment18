import DBRepo from "./DB.Repo.js";
import PostModel from "../Models/PostModel.js";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
class PostRepo extends DBRepo {
    constructor() {
        super(PostModel);
    }
    checkPostPrivacy(User) {
        return [
            {
                Privacy: PostPrivacyEnum.Public,
            },
            {
                createdBy: { $in: User.Friends },
                Privacy: PostPrivacyEnum.Friends,
            },
            {
                Tages: { $in: [User._id] },
            },
            { createdBy: User._id },
        ];
    }
}
export default new PostRepo();
