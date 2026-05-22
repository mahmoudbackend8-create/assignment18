import { BadRequestExeption, NotFoundExeption, } from "../../Common/Exeptions/DomainExeption.js";
import NotificationsService from "../../Common/Notifications/NotificationsService.js";
import S3BucketService from "../../Common/S3Bucket/S3BucketService.js";
import PostDbrepo from "../../DB/DB.Reposatory.js/Post.Dbrepo.js";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisService from "../../DB/Redis/Redis.Service.js";
import { PostPrivacyEnum } from "../../Common/Enums/PostEnums.js";
class PostService {
    _UserRepo = UserDbrepo;
    _RedisService = RedisService;
    _NotificationService = NotificationsService;
    _Post_Repo = PostDbrepo;
    _S3BucketService = S3BucketService;
    async CreatePost(BodyData, userId, files) {
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
                files: files,
                path: `/post/${post?._id}`,
            });
            post.Attchments = filesPaths;
        }
        for (const Tag of Tages || []) {
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
        post.createdBy = userId;
        return await this._Post_Repo.saveDBDoc(post);
    }
    async UpdatePost(BodyData, postId, userId, files) {
        const post = await this._Post_Repo.findOne({
            filter: { _id: postId, createdBy: userId },
        });
        if (!post) {
            throw new NotFoundExeption("No Post Exist");
        }
        if (!post.Content &&
            !BodyData.Content &&
            !post.Attchments?.length &&
            !files?.length &&
            post.Attchments?.length == files?.length) {
            throw new BadRequestExeption("Post Can.t be Empty");
        }
        const { Tages } = BodyData;
        if (Tages?.length) {
            const MetionedUsers = await this._UserRepo.Find({
                filter: { _id: { $in: Tages } },
            });
            if (MetionedUsers?.length != Tages?.length) {
                throw new BadRequestExeption(" Failed to find some tagges Users");
            }
        }
        let UploadedFiled = [];
        if (files?.length) {
            const filesPaths = await this._S3BucketService.UploadFiles({
                files: files,
                path: `/post/${post?._id}`,
            });
            UploadedFiled = filesPaths;
        }
        if (BodyData.Removefiles?.length) {
            const FilesDetele = BodyData.Removefiles.map((path) => {
                return { Key: path };
            });
            await this._S3BucketService.DeleteFiles(FilesDetele);
        }
        for (const Tag of Tages || []) {
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
    async FindPosts(User, queryData) {
        const QuerySearch = queryData.Search?.length
            ? { Content: { $regex: queryData.Search, $options: "i" } }
            : {};
        return await this._Post_Repo.Paginate({
            filter: {
                $or: this._Post_Repo.checkPostPrivacy(User),
                ...QuerySearch,
            },
            Page: +queryData.Page,
            Limit: +queryData.Limit,
            options: {
                populate: { path: "Comments", populate: { path: "CommentId" } },
            },
        });
    }
    async LikeAndDislikePost(postId, User, react) {
        const UpdateQuery = react === 1
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
