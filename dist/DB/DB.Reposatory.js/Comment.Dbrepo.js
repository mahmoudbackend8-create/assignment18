import DBRepo from "./DB.Repo.js";
import CommentModel from "../Models/Comment.Model.js";
class CommentRepo extends DBRepo {
    constructor() {
        super(CommentModel);
    }
}
export default new CommentRepo();
