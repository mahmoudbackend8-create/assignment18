import type { JwtPayload } from "jsonwebtoken";
import type { IHUser, IUser } from "../../DB/Models/UserModel.js";
import { Socket } from "socket.io";

declare module "express-serve-static-core" {
  interface Request {
    user: IHUser;
    payLoad: JwtPayload;
  }
}

export interface socketAuthType extends Socket {
  data: { user: IUser; varifyToken: JwtPayload };
}
