import type { ObjectId } from "mongoose";
import type { IUser } from "../Models/UserModel.js";
import UserModel from "../Models/UserModel.js";
import DBRepo from "./DB.Repo.js";

class UserRepo extends DBRepo<IUser> {
  constructor() {
    super(UserModel);
  }

  async CheckUserExist(Id: ObjectId): Promise<boolean> {
    return (await this.findOne({ filter: { _id: Id } })) != null;
  }
}
export default new UserRepo