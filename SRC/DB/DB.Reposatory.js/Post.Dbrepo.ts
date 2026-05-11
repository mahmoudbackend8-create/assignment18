

import DBRepo from "./DB.Repo.js";
import type { Ipost } from "../Models/PostModel.js";
import PostModel from "../Models/PostModel.js";

class PostRepo extends DBRepo<Ipost> {
  constructor() {
    super(PostModel);
  }
}
export default new PostRepo();
