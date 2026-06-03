import express from "express";
import AuthRouter from "./Modules/Auth/AuthController.js";
import GlobalErrHandling from "./MiddleWares/GlobalErrHandling.js";
import { Server_PORT } from "./Config/Config.service.js";
import TestDBConnection from "./DB/DB.Connection.js";
import { TestConnectionRedis } from "./DB/Redis/Redis.Connection.js";
import UserRouter from "./Modules/User/User.Control.js";
import cors from "cors";
import S3BucketService from "./Common/S3Bucket/S3BucketService.js";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import SuccessResponse from "./Common/Response/SuccessResponse.js";
import PostRouter from "./Modules/Post/Post.Controller.js";
import CommentRouter from "./Modules/Comment/Comment.Controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import schema from "./Modules/gql/schema.gql.js";
import { authentication } from "./MiddleWares/AuthenticationMiddelWare.js";
import { Server, Socket } from "socket.io";
import TokenService from "./Common/Security/TokenService.js";
import z from "zod";
import { validationRealTime } from "./MiddleWares/ValidationMiddleWare.js";
import RealTimeGateWay from "./Modules/RealTime/RealTime.GateWay.js";
async function AppBoostrab() {
    const PORT = Server_PORT;
    const App = express();
    App.use(express.json(), cors());
    await TestDBConnection();
    await TestConnectionRedis();
    App.use("/Auth", AuthRouter);
    App.use("/User", UserRouter);
    App.use("/Post", PostRouter);
    App.use("/Comment", CommentRouter);
    App.get("/uploads/*path", async (req, res, next) => {
        const { path } = req.params;
        const { fileName, downLoad } = req.query;
        const Key = path.join("/");
        const result = await S3BucketService.GetFile(Key);
        const pipLinePromise = promisify(pipeline);
        if (downLoad == "true") {
            res.setHeader("content-disposition", `attachment; fileName=${fileName || path[path.length - 1]}`);
        }
        await pipLinePromise(result.Body, res);
    });
    App.get("/Pre-Signed-Upload/*path", async (req, res, next) => {
        const { path } = req.params;
        const { fileName, downLoad } = req.query;
        const Key = path.join("/");
        const result = await S3BucketService.CreatePreSignedGetFile({
            Key,
            downLoad: downLoad,
            fileName: fileName || path[path.length - 1],
        });
        return SuccessResponse({ res, Msg: "Done", data: result });
    });
    App.get("/", (req, res, next) => {
        res.status(200).send("Landing Page");
    });
    App.post("/sendNotification", async (req, res) => {
        return res.json({ body: req.body });
    });
    App.all("/graphql", authentication(), createHandler({
        schema: schema,
        context: (req) => ({ User: req.raw.user, TokenPayLoad: req.raw.payLoad }),
    }));
    App.get("/*dummy", (req, res, next) => {
        res.status(404).json({ Msg: "Invalid Url Or Method" });
    });
    App.use(GlobalErrHandling);
    const server = App.listen(3000, () => {
        console.log("port is runing on prot 3000");
    });
    RealTimeGateWay.initializeIo(server);
}
export default AppBoostrab;
