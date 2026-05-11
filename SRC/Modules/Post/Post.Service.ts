import { BadRequestExeption } from "../../Common/Exeptions/DomainExeption.js";
import NotificationsService from "../../Common/Notifications/NotificationsService.js";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisService from "../../DB/Redis/Redis.Service.js";
import type { CreatePostDTO } from "./Post.DTO.js";

class PostService {
  private _UserRepo = UserDbrepo;
  private _RedisService = RedisService;
  private _NotificationService = NotificationsService;
  async CreatePost(BodyData: CreatePostDTO) {
    const { Tages } = BodyData;
    if (Tages?.length) {
      const MetionedUsers = await this._UserRepo.Find({
        filter: { _id: { $in: Tages } },
      });
      if (MetionedUsers?.length != Tages?.length) {
        throw new BadRequestExeption(" Failed to find some tagges Users");
      }
    }

    for (const Tag of Tages!) {
      const token = await this._RedisService.GetMemberFCMTokens(Tag);
      if (token.length) {
        await this._NotificationService.SendNotifications({
          tokens: token,
          data: { title: "Post Tagged", body: "You Have Been Tagged" },
        });
      }
    }
  }
}
export default new PostService();
