import { GraphQLError } from "graphql";
import type { UserRole } from "../Common/Enums/User.Enums.js";
import {
  MapGQLError,
  UnauthorizedExeption,
} from "../Common/Exeptions/DomainExeption.js";

function AuthorizationGQL(UserRole: UserRole, endPointRoles: UserRole[]) {
  if (!endPointRoles.includes(UserRole)) {
    // throw new UnauthorizedExeption("you don.t have to access");
    MapGQLError(new UnauthorizedExeption("you don.t have to access"));
  }
}

export default AuthorizationGQL;
