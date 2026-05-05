import dotenv from "dotenv";
import path from "path";
export const NODE_ENV = process.env.NODE_ENV;
// export const pathEnv = {
//   dev: path.resolve("./Config/.env.dev"),
//   prod: path.resolve("./Config/.env.prod"),
// };
dotenv.config({ path: path.resolve("./.env.dev") });

export const Server_PORT = process.env.PORT || 3000;
export const DB_URL_LOCAL = process.env.DB_URL_LOCAL as string;
export const SALT_ROUND = Number(process.env.SALT_ROUND) || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const USER_TOKEN_SIGNITURE = process.env.USER_TOKEN_SIGNITURE as string;
export const ADMIN_TOKEN_SIGNITURE = process.env
  .ADMIN_TOKEN_SIGNITURE as string;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const REFRESH_USER_TOKEN_SIGNITURE = process.env
  .REFRESH_USER_TOKEN_SIGNITURE as string;
export const REFRESH_ADMIN_TOKEN_SIGNITURE = process.env
  .REFRESH_ADMIN_TOKEN_SIGNITURE as string;
export const REDIS_URL = process.env.REDIS_URL as string;
export const MAIL_USER = process.env.MAIL_USER as string;
export const MAIL_PASS = process.env.MAIL_PASS as string;
// $env:NODE_ENV="dev", node --watch ./mainModule.js

//AWS
export const REGION = process.env.REGION as string;
export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID as string;
export const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY as string;
export const BUCKET_NAME = process.env.BUCKET_NAME as string;
export const APPLICATION_NAME = process.env.APPLICATION_NAME as string;
export const DB_URL_ATLAS = process.env.DB_URL_ATLAS as string;
