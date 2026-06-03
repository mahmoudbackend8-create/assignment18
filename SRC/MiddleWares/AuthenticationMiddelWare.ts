import type { NextFunction, Request, Response } from "express";
import { tokenTypeEnum } from "../Common/Enums/TokenEnums.js";
import {
  BadRequestExeption,
  UnauthorizedExeption,
} from "../Common/Exeptions/DomainExeption.js";
import TokenService from "../Common/Security/TokenService.js";
import type { JwtPayload } from "jsonwebtoken";

import RedisServices from "../DB/Redis/Redis.Service.js";
import UserDbrepo from "../DB/DB.Reposatory.js/User.Dbrepo.js";
import type { UserRole } from "../Common/Enums/User.Enums.js";

export function authentication(tokenTypeParam = tokenTypeEnum.AccessToken) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedExeption("you need to login First");
    }
    const [BearerKey, token] = authorization.split(" ");
    if (BearerKey != "Bearer") {
      throw new BadRequestExeption("Invalid BearerKey");
    }
    if (!token) {
      throw new UnauthorizedExeption("you need to login First");
    }
    const { user, varifyToken } = await TokenService.CheckToken(
      token,
      tokenTypeParam,
    );
    req.user = user;
    req.payLoad = varifyToken;

    next();

    //   const User = await dbRepo.findById({ model: UserModel, id: userId });
    //   return User;
  };
}
