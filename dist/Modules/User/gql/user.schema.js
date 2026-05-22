import { UserGender, UserProvider, UserRole, } from "../../../Common/Enums/User.Enums.js";
import UserDbrepo from "../../../DB/DB.Reposatory.js/User.Dbrepo.js";
import { UserProfileTypes } from "./User.Type.js";
import UserResolver from "../gql/User.Resolve.js";
import { GraphQLNonNull, GraphQLString } from "graphql";
import { GetProfileArgs } from "./User.Args.js";
class UserSchema {
    userQuries() {
        return {
            GetUserProfile: {
                type: UserProfileTypes,
                args: GetProfileArgs,
                resolve: UserResolver.userProfile,
                description: "get user",
            },
        };
    }
}
export default new UserSchema();
