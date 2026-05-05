import {
  ADMIN_TOKEN_SIGNITURE,
  REFRESH_ADMIN_TOKEN_SIGNITURE,
  REFRESH_USER_TOKEN_SIGNITURE,
  USER_TOKEN_SIGNITURE,
} from "../../Config/Config.service.js";
import type { IHUser } from "../../DB/Models/UserModel.js";
import { tokenTypeEnum } from "../Enums/TokenEnums.js";
import { UserRole } from "../Enums/User.Enums.js";
import jwt, {
  type DecodeOptions,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { randomUUID } from "crypto";

class TokenService {
  constructor() {}
  GetSigniture(role: UserRole = UserRole.User) {
    let AccessSigniture = "";
    let RefreshSigniture = "";
    switch (role) {
      case UserRole.User:
        AccessSigniture = USER_TOKEN_SIGNITURE;
        RefreshSigniture = REFRESH_USER_TOKEN_SIGNITURE;
        break;
      case UserRole.Admin:
        AccessSigniture = ADMIN_TOKEN_SIGNITURE;
        RefreshSigniture = REFRESH_ADMIN_TOKEN_SIGNITURE;
        break;
    }
    return { AccessSigniture, RefreshSigniture };
  }

  GenerateToken({
    payload = {},
    Signiture,
    options = {},
  }: {
    payload?: string | object;
    Signiture: string;
    options?: SignOptions;
  }) {
    return jwt.sign(payload, Signiture, options);
  }

  VerifyToken({
    token,
    Signiture,
    options = {},
  }: {
    token: string;
    Signiture: string;
    options?: VerifyOptions;
  }) {
    return jwt.verify(token, Signiture, options);
  }

  DecodedToken({
    token,
    options = {},
  }: {
    token: string;
    options?: DecodeOptions;
  }) {
    return jwt.decode(token, options);
  }

  GetAccesAndRefreshToken(user: IHUser) {
    const { AccessSigniture, RefreshSigniture } = this.GetSigniture(user.Role);
    const AccessToken = this.GenerateToken({
      Signiture: AccessSigniture,
      options: {
        expiresIn: 60 * 15,
        audience: [String(user.Role), String(tokenTypeEnum.AccessToken)],
        subject: user._id.toString(),
        jwtid: randomUUID(),
      },
    });
    const RefreshToken = this.GenerateToken({
      Signiture: AccessSigniture,
      options: {
        expiresIn: "1y",
        audience: [String(user.Role), String(tokenTypeEnum.RefreshToken)],
        subject: user._id.toString(),
        jwtid: randomUUID(),
      },
    });
    return { AccessToken, RefreshToken };
  }
}
export default new TokenService();
