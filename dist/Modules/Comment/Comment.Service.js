import NotificationsService from "../../Common/Notifications/NotificationsService.js";
import S3BucketService from "../../Common/S3Bucket/S3BucketService.js";
import CommentDbrepo from "../../DB/DB.Reposatory.js/Comment.Dbrepo.js";
import PostDbrepo from "../../DB/DB.Reposatory.js/Post.Dbrepo.js";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisService from "../../DB/Redis/Redis.Service.js";
import { BadRequestExeption, NotFoundExeption, } from "../../Common/Exeptions/DomainExeption.js";
class CommentService {
    _CommentRepo = CommentDbrepo;
    _UserRepo = UserDbrepo;
    _RedisService = RedisService;
    _NotificationService = NotificationsService;
    _Post_Repo = PostDbrepo;
    _S3BucketService = S3BucketService;
    async CreateComment(BodyData, User, postId, files) {
        const { Tages } = BodyData;
        const post = await this._Post_Repo.findOne({
            filter: { _id: postId, $or: this._Post_Repo.checkPostPrivacy(User) },
        });
        if (!post) {
            throw new NotFoundExeption("Invalid Post id");
        }
        const Comment = this._CommentRepo.getDBDoc(BodyData);
        if (Tages?.length) {
            const MetionedUsers = await this._UserRepo.Find({
                filter: { _id: { $in: Tages } },
            });
            if (MetionedUsers?.length != Tages?.length) {
                throw new BadRequestExeption(" Failed to find some tagges Users");
            }
        }
        if (files?.length) {
            const filesPaths = await this._S3BucketService.UploadFiles({
                files: files,
                path: `/post/${post?._id}/Comment/${Comment._id}`,
            });
            Comment.Attchments = filesPaths;
        }
        for (const Tag of Tages || []) {
            const token = await this._RedisService.GetMemberFCMTokens(Tag);
            if (token.length) {
                await this._NotificationService.SendNotifications({
                    tokens: token,
                    data: {
                        title: "Comment Tagged",
                        body: JSON.stringify({
                            postId: post?._id,
                            message: "you have tagged on Comment",
                            CommentId: Comment._id,
                        }),
                    },
                });
            }
        }
        Comment.createdBy = User._id;
        Comment.postId = post._id;
        return await Comment.save();
    }
    async ReplyComment(BodyData, User, postId, CommentId, files) {
        const { Tages } = BodyData;
        const parentComment = await this._CommentRepo.findOne({
            filter: {
                _id: CommentId,
                postId,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: { $or: this._Post_Repo.checkPostPrivacy(User) },
                    },
                ],
            },
        });
        if (!parentComment || !parentComment.postId) {
            throw new NotFoundExeption("Invalid Comment id");
        }
        const Comment = this._CommentRepo.getDBDoc(BodyData);
        if (Tages?.length) {
            const MetionedUsers = await this._UserRepo.Find({
                filter: { _id: { $in: Tages } },
            });
            if (MetionedUsers?.length != Tages?.length) {
                throw new BadRequestExeption(" Failed to find some tagges Users");
            }
        }
        if (files?.length) {
            const filesPaths = await this._S3BucketService.UploadFiles({
                files: files,
                path: `/post/${postId}/Comment/${Comment._id}`,
            });
            Comment.Attchments = filesPaths;
            for (const Tag of Tages || []) {
                const token = await this._RedisService.GetMemberFCMTokens(Tag);
                if (token.length) {
                    await this._NotificationService.SendNotifications({
                        tokens: token,
                        data: {
                            title: "Comment Tagged",
                            body: JSON.stringify({
                                postId: postId,
                                message: "you have tagged on Comment",
                                CommentId: Comment._id,
                            }),
                        },
                    });
                }
            }
            Comment.createdBy = User._id;
            Comment.postId = postId;
            Comment.CommentId = CommentId;
            return await Comment.save();
        }
    }
    async GetComments(CommentId, User) {
        const Comment = await this._CommentRepo.findById({
            id: CommentId,
            options: {
                populate: [
                    {
                        path: "postId",
                        match: { $or: this._Post_Repo.checkPostPrivacy(User) },
                    },
                    { path: "CommentId" },
                ],
            },
        });
        if (!Comment || !Comment.postId) {
            throw new NotFoundExeption("Comment not found");
        }
        return Comment;
    }
}
export default new CommentService();
