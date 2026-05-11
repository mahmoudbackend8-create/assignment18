import DBRepo from "./DB.Repo.js";
import PostModel from "../Models/PostModel.js";
class PostRepo extends DBRepo {
    constructor() {
        super(PostModel);
    }
}
export default new PostRepo();
