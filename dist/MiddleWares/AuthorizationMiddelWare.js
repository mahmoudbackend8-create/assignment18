import { GraphQLError } from "graphql";
import { MapGQLError, UnauthorizedExeption, } from "../Common/Exeptions/DomainExeption.js";
function AuthorizationGQL(UserRole, endPointRoles) {
    if (!endPointRoles.includes(UserRole)) {
        MapGQLError(new UnauthorizedExeption("you don.t have to access"));
    }
}
export default AuthorizationGQL;
