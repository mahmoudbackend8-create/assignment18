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
    const deCoded = TokenService.DecodedToken({ token: token }) as JwtPayload;
    // const deCoded = jwt.decode(authorization); //extreact from token

    if (!deCoded || !deCoded.aud) {
      throw new UnauthorizedExeption("Invalid token payload");
    }
    const [userRole, TokenType] = deCoded.aud;

    if (Number(TokenType) != tokenTypeParam) {
      throw new BadRequestExeption("invaild token type");
    }
    const { AccessSigniture, RefreshSigniture } = TokenService.GetSigniture(
      Number(userRole) as UserRole,
    );
    // let signiture = "";
    // switch (userRole) {
    //   case User_Roll.User:
    //     signiture = USER_TOKEN_SIGNITURE;
    //     break;
    //   case User_Roll.Admin:
    //     signiture = ADMIN_TOKEN_SIGNITURE;
    //     break;
    // }
    // const varifyToken = jwt.verify(authorization, signiture);
    const varifyToken = TokenService.VerifyToken({
      token: token,
      Signiture:
        tokenTypeParam == tokenTypeEnum.AccessToken
          ? AccessSigniture
          : RefreshSigniture,
    }) as JwtPayload;

    // const findToken = await dbRepo.findOne({
    //   model: TokenModel,
    //   filters: { jwti: varifyToken.jti },
    // });

    if (
      varifyToken.jti &&
      (await RedisServices.isKeyExistF(
        RedisServices.BlackListKeys({
          userID: varifyToken.sub as string,
          TokenID: varifyToken.jti,
        }),
      ))
    ) {
      throw new UnauthorizedExeption("you Need to LOgIn aGain ");
    }
    //   const findToken = await RedisServices.get(
    //     RedisServices.BlackListKeys({
    //       userID: varifyToken.sub,
    //       TokenID: varifyToken.jti,
    //     }),
    //   );

    const user = await UserDbrepo.findById({
      id: varifyToken.sub as string,
    });

    if (!user) {
      throw new UnauthorizedExeption("user not found , signUp ");
    }

    if (new Date(varifyToken.iat! * 1000) < user.ChangeCreditTime) {
      throw new UnauthorizedExeption("you Need to LOgIn aGain ");
    }
    req.user = user;
    req.payLoad = varifyToken;

    next();

    //   const User = await dbRepo.findById({ model: UserModel, id: userId });
    //   return User;
  };
}
