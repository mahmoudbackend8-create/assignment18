import { validationGQL } from "../../../MiddleWares/ValidationMiddleWare.js";
import PostService from "../Post.Service.js";
import { ReactPostSchema } from "./Post.valicationGQL.js";
class PostResolver {
    _postService = PostService;
    PostReact = async (parent, args, context) => {
        validationGQL(ReactPostSchema, args);
        const result = await this._postService.LikeAndDislikePost(args.postId, context.User, args.react);
        return {
            _id: result._id,
            likes: result.Likes,
        };
    };
}
export default new PostResolver();
