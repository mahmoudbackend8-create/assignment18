import { ADMIN_TOKEN_SIGNITURE, REFRESH_ADMIN_TOKEN_SIGNITURE, REFRESH_USER_TOKEN_SIGNITURE, USER_TOKEN_SIGNITURE, } from "../../Config/Config.service.js";
import { tokenTypeEnum } from "../Enums/TokenEnums.js";
import { UserRole } from "../Enums/User.Enums.js";
import jwt, {} from "jsonwebtoken";
import { randomUUID } from "crypto";
import { BadRequestExeption, UnauthorizedExeption, } from "../Exeptions/DomainExeption.js";
import RedisServices from "../../DB/Redis/Redis.Service.js";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
class TokenService {
    _RedisServices = RedisServices;
    _UserDbrepo = UserDbrepo;
    constructor() { }
    GetSigniture(role = UserRole.User) {
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
    GenerateToken({ payload = {}, Signiture, options = {}, }) {
        return jwt.sign(payload, Signiture, options);
    }
    VerifyToken({ token, Signiture, options = {}, }) {
        return jwt.verify(token, Signiture, options);
    }
    DecodedToken({ token, options = {}, }) {
        return jwt.decode(token, options);
    }
    GetAccesAndRefreshToken(user) {
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
    async CheckToken(token, tokenTypeParam = tokenTypeEnum.AccessToken) {
        const deCoded = this.DecodedToken({ token: token });
        if (!deCoded || !deCoded.aud) {
            throw new UnauthorizedExeption("Invalid token payload");
        }
        const [userRole, TokenType] = deCoded.aud;
        if (Number(TokenType) != tokenTypeParam) {
            throw new BadRequestExeption("invaild token type");
        }
        const { AccessSigniture, RefreshSigniture } = this.GetSigniture(Number(userRole));
        const varifyToken = this.VerifyToken({
            token: token,
            Signiture: tokenTypeParam == tokenTypeEnum.AccessToken
                ? AccessSigniture
                : RefreshSigniture,
        });
        if (varifyToken.jti &&
            (await RedisServices.isKeyExistF(RedisServices.BlackListKeys({
                userID: varifyToken.sub,
                TokenID: varifyToken.jti,
            })))) {
            throw new UnauthorizedExeption("you Need to LOgIn aGain ");
        }
        const user = await UserDbrepo.findById({
            id: varifyToken.sub,
        });
        if (!user) {
            throw new UnauthorizedExeption("user not found , signUp ");
        }
        if (new Date(varifyToken.iat * 1000) < user.ChangeCreditTime) {
            throw new UnauthorizedExeption("you Need to LOgIn aGain ");
        }
        return { user, varifyToken };
    }
}
export default new TokenService();
