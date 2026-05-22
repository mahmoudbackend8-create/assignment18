import DBRepo from "./DB.Repo.js";
import type { Ipost } from "../Models/PostModel.js";
import PostModel from "../Models/PostModel.js";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
import type { IHUser } from "../Models/UserModel.js";

class PostRepo extends DBRepo<Ipost> {
  constructor() {
    super(PostModel);
  }
  checkPostPrivacy(User: IHUser) {
    return [
      {
        Privacy: PostPrivacyEnum.Public,
      },
      {
        createdBy: { $in: User.Friends! },
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
