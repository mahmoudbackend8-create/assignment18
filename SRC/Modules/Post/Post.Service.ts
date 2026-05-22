import type { Types } from "mongoose";
import {
  BadRequestExeption,
  NotFoundExeption,
} from "../../Common/Exeptions/DomainExeption.js";
import NotificationsService from "../../Common/Notifications/NotificationsService.js";
import S3BucketService from "../../Common/S3Bucket/S3BucketService.js";
import PostDbrepo from "../../DB/DB.Reposatory.js/Post.Dbrepo.js";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisService from "../../DB/Redis/Redis.Service.js";
import type { CreatePostDTO, FindPostsDTO, UpdatePostDTO } from "./Post.DTO.js";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
import type { IHUser } from "../../DB/Models/UserModel.js";

class PostService {
  private _UserRepo = UserDbrepo;
  private _RedisService = RedisService;
  private _NotificationService = NotificationsService;
  private _Post_Repo = PostDbrepo;
  private _S3BucketService = S3BucketService;
  async CreatePost(
    BodyData: any,
    userId: Types.ObjectId | string,
    files?: Express.Multer.File[],
  ) {
    const { Tages } = BodyData;
    if (Tages?.length) {
      const MetionedUsers = await this._UserRepo.Find({
        filter: { _id: { $in: Tages } },
      });
      if (MetionedUsers?.length != Tages?.length) {
        throw new BadRequestExeption(" Failed to find some tagges Users");
      }
    }

    const post = this._Post_Repo.getDBDoc(BodyData);
    if (files?.length) {
      const filesPaths = await this._S3BucketService.UploadFiles({
        files: files as Express.Multer.File[],
        path: `/post/${post?._id}`,
      });
      post.Attchments = filesPaths;
    }
    for (const Tag of Tages! || []) {
      const token = await this._RedisService.GetMemberFCMTokens(Tag);
      if (token.length) {
        await this._NotificationService.SendNotifications({
          tokens: token,
          data: {
            title: "Post Tagged",
            body: JSON.stringify({
              postId: post?._id,
              message: "you have been tagged",
              PostId: post._id,
            }),
          },
        });
      }
    }
    post.createdBy = userId as Types.ObjectId;
    return await this._Post_Repo.saveDBDoc(post); //////////////////////skip in video
  }
  async UpdatePost(
    BodyData: UpdatePostDTO,
    postId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    files?: Express.Multer.File[],
  ) {
    const post = await this._Post_Repo.findOne({
      filter: { _id: postId, createdBy: userId },
    });
    if (!post) {
      throw new NotFoundExeption("No Post Exist");
    }
    if (
      !post.Content &&
      !BodyData.Content &&
      !post.Attchments?.length &&
      !files?.length &&
      post.Attchments?.length == files?.length
    ) {
      throw new BadRequestExeption("Post Can.t be Empty");
    }

    const { Tages } = BodyData;
    if (Tages?.length) {
      //new tags
      const MetionedUsers = await this._UserRepo.Find({
        filter: { _id: { $in: Tages } },
      });
      if (MetionedUsers?.length != Tages?.length) {
        throw new BadRequestExeption(" Failed to find some tagges Users");
      }
    }
    let UploadedFiled: string[] = [];
    if (files?.length) {
      const filesPaths = await this._S3BucketService.UploadFiles({
        files: files as Express.Multer.File[],
        path: `/post/${post?._id}`,
      });
      UploadedFiled = filesPaths;
    }
    if (BodyData.Removefiles?.length) {
      const FilesDetele: { Key: string }[] = BodyData.Removefiles.map(
        (path) => {
          return { Key: path };
        },
      );
      await this._S3BucketService.DeleteFiles(FilesDetele);
    }
    for (const Tag of Tages! || []) {
      const token = await this._RedisService.GetMemberFCMTokens(Tag);
      if (token.length) {
        await this._NotificationService.SendNotifications({
          tokens: token,
          data: {
            title: "Post Tagged",
            body: JSON.stringify({
              postId: post?._id,
              message: "you have been tagged",
            }),
          },
        });
      }
    }
    return await this._Post_Repo.findOneAndUpdate({
      filter: { _id: postId },
      update: [
        {
          $set: {
            Content: BodyData.Content || post.Content,
            Privacy: BodyData.Privacy || post.Privacy,
            Tages: {
              $setUnion: [
                {
                  $setDifference: ["$Tages", BodyData.RemoveTages || []],
                },
                BodyData.Tages || [],
              ],
            },
            Attchments: {
              $setUnion: [
                {
                  $setDifference: ["$Attchments", BodyData.files || []],
                },
                UploadedFiled || [],
              ],
            },
          },
        },
      ],
      options: {
        updatePipeline: true,
        returnDocument: "after",
      },
    });
  }
  async FindPosts(User: IHUser, queryData: FindPostsDTO) {
    const QuerySearch = queryData.Search?.length
      ? { Content: { $regex: queryData.Search as string, $options: "i" } }
      : {};
    return await this._Post_Repo.Paginate({
      filter: {
        $or: this._Post_Repo.checkPostPrivacy(User),
        ...QuerySearch,
      },
      Page: +(queryData.Page as number),
      Limit: +(queryData.Limit as number),
      options: {
        populate: { path: "Comments", populate: { path: "CommentId" } }, //populate in populate because data exist in vertuailFeilds "Comments" not in postData
      },
    });
  }
  async LikeAndDislikePost(
    postId: Types.ObjectId | string,
    User: IHUser,
    react: number | string,
  ) {
    const UpdateQuery =
      react === 1
        ? { $addToSet: { Likes: User._id } }
        : { $pull: { Likes: User._id } };
    const post = await this._Post_Repo.findOneAndUpdate({
      filter: { _id: postId, $or: this._Post_Repo.checkPostPrivacy(User) },
      update: UpdateQuery,
    });

    if (!post) {
      throw new NotFoundExeption("No Post Exist");
    }
    return post;
  }
}
export default new PostService();

//i mean capitale or small T same t ($options: "i")
// ...QuerySearch - extract Values from object
