import UserModel from "../Models/UserModel.js";
import DBRepo from "./DB.Repo.js";
class UserRepo extends DBRepo {
    constructor() {
        super(UserModel);
    }
    async CheckUserExist(Id) {
        return (await this.findOne({ filter: { _id: Id } })) != null;
    }
}
export default new UserRepo;
