import UserDbrepo from "../../../DB/DB.Reposatory.js/User.Dbrepo.js";
import { authentication } from "../../../MiddleWares/AuthenticationMiddelWare.js";
import AuthorizationGQL from "../../../MiddleWares/AuthorizationMiddelWare.js";
import { UserRole } from "../../../Common/Enums/User.Enums.js";
import { validationGQL } from "../../../MiddleWares/ValidationMiddleWare.js";
import { idValidation } from "./User.Validation.js";
class UserResolver {
    _userRepo = UserDbrepo;
    userProfile = async (parent, args, context) => {
        AuthorizationGQL(context.User.Role, [UserRole.User]);
        validationGQL(idValidation, args);
        return context.User;
    };
}
export default new UserResolver();
