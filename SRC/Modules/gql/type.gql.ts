import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/UserModel.js";

export type ContextType = { User: IHUser; TokenPayLoad: JwtPayload };
