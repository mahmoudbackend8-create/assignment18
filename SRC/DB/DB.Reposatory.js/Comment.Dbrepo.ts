import DBRepo from "./DB.Repo.js";
import type { IComment } from "../Models/Comment.Model.js";
import CommentModel from "../Models/Comment.Model.js";

class CommentRepo extends DBRepo<IComment> {
  constructor() {
    super(CommentModel);
  }

}
export default new CommentRepo();
