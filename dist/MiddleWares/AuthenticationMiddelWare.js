import { tokenTypeEnum } from "../Common/Enums/TokenEnums.js";
import { BadRequestExeption, UnauthorizedExeption, } from "../Common/Exeptions/DomainExeption.js";
import TokenService from "../Common/Security/TokenService.js";
import RedisServices from "../DB/Redis/Redis.Service.js";
import UserDbrepo from "../DB/DB.Reposatory.js/User.Dbrepo.js";
export function authentication(tokenTypeParam = tokenTypeEnum.AccessToken) {
    return async (req, res, next) => {
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
        const deCoded = TokenService.DecodedToken({ token: token });
        if (!deCoded || !deCoded.aud) {
            throw new UnauthorizedExeption("Invalid token payload");
        }
        const [userRole, TokenType] = deCoded.aud;
        if (Number(TokenType) != tokenTypeParam) {
            throw new BadRequestExeption("invaild token type");
        }
        const { AccessSigniture, RefreshSigniture } = TokenService.GetSigniture(Number(userRole));
        const varifyToken = TokenService.VerifyToken({
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
        req.user = user;
        req.payLoad = varifyToken;
        next();
    };
}
