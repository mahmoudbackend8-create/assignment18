import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/UserModel.js";

declare module "express-serve-static-core" {
    interface Request {

        user:IHUser,
        payLoad:JwtPayload
    }
}