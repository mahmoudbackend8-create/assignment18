import type { JwtPayload } from "jsonwebtoken";
import UserDbrepo from "../../../DB/DB.Reposatory.js/User.Dbrepo.js";
import type { IHUser } from "../../../DB/Models/UserModel.js";
import { authentication } from "../../../MiddleWares/AuthenticationMiddelWare.js";
import type { ContextType } from "../../gql/type.gql.js";
import AuthorizationGQL from "../../../MiddleWares/AuthorizationMiddelWare.js";
import { UserRole } from "../../../Common/Enums/User.Enums.js";
import { validationGQL } from "../../../MiddleWares/ValidationMiddleWare.js";
import { idValidation } from "./User.Validation.js";

class UserResolver {
  private _userRepo = UserDbrepo;
  userProfile = async (
    parent: any,
    args: { userId: string },
    context: ContextType,
  ) => {
    // const user = await this._userRepo.findOne({});
    // console.log({ args });
    // console.log({ headers: context });
    //  authentication(context.req.headers);//instead of that - we will put auth from out api
    AuthorizationGQL(context.User.Role, [UserRole.User]);
    validationGQL<{ userId: string }>(idValidation, args);
    return context.User;
  };
}
export default new UserResolver();
