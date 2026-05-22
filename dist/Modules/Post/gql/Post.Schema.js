import { ReactPostArgs } from "./Post.Args.js";
import PostResolver from "./Post.Resolver.js";
import { ReactPostType } from "./Post.Types.js";
class PostSchema {
    postMutations() {
        return {
            ReactPost: {
                type: ReactPostType,
                args: ReactPostArgs,
                resolve: PostResolver.PostReact,
            },
        };
    }
}
export default new PostSchema();
