import express from "express";
import AuthRouter from "./Modules/Auth/AuthController.js";
import GlobalErrHandling from "./MiddleWares/GlobalErrHandling.js";
import { Server_PORT } from "./Config/Config.service.js";
import TestDBConnection from "./DB/DB.Connection.js";
import { TestConnectionRedis } from "./DB/Redis/Redis.Connection.js";
import UserRouter from "./Modules/User/User.Control.js";
import cors from "cors";
import UserModel from "./DB/Models/UserModel.js";
import S3BucketService from "./Common/S3Bucket/S3BucketService.js";
// import type { Request, Response, NextFunction } from "express";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import SuccessResponse from "./Common/Response/SuccessResponse.js";
import PostRouter from "./Modules/Post/Post.Controller.js";
async function AppBoostrab() {
  const PORT = Server_PORT;
  const App: express.Express = express();
  App.use(express.json(), cors());
  await TestDBConnection();
  await TestConnectionRedis();

  // const [user] = await UserModel.create(
  //   [
  //     {
  //       UserName: "Mahmoud Emaira",
  //       Email: "m.emaira@yahoo.com",
  //       Password: "Mahmoud Emaira",
  //       Gender: 1,
  //       Phone: "01117957825",
  //     },
  //   ],
  //   // { validateBeforeSave: false },
  // ); //stoped pre-post Validate
  ///////////////////////////////////////////////////////////////
  // const user1 = await UserModel.findOne();
  // await user?.updateOne({ UserName: "updated" }); //here we can determine whether we want doc or query
  // await UserModel.updateOne({ _id: user?._id }, { UserName: "uPDATED" }); //here we can.t determine whether we want doc or query - just query
  //////////////////////////////////////////////////////////////////
  // const userDe = await UserModel.findOne({
  //   Email: "m.emaira@yahoo.com",
  //   GetSoftDelete: false, // we added it by hand - to control of soft delete in hooks- if we didn.t send it will be undifined that equal false in hook
  //   // DeletedAt: { $exists: false }, // hooks in db - restore data if isn.t deleted soft delete - put in hooks
  // });
  // console.log({ userDe });

  // user?.UserName = "Updated";
  // user?.save(); // this will run schema Pre in user model for every run so - another hash and encryption
  //and we use this .modifies in user model-Pre to avoid this
  App.use("/Auth", AuthRouter);
  App.use("/User", UserRouter);
  App.use("/Post", PostRouter);

  App.get("/uploads/*path", async (req, res, next) => {
    // console.log(req.params.path);
    const { path } = req.params;
    const { fileName, downLoad } = req.query;
    //data of URL will be in path Key as array
    // console.log(req.params.path.join("/")); // merge them as URL
    const Key = path.join("/");
    const result = await S3BucketService.GetFile(Key);
    //we need to write buffer on response - so we need pipeLine
    //pipe take res return dist
    // console.log({ result });
    const pipLinePromise = promisify(pipeline);

    //to downLoad File with its name
    if (downLoad == "true") {
      res.setHeader(
        "content-disposition",
        `attachment; fileName=${fileName || path[path.length - 1]}`,
      );
    }
    await pipLinePromise(result.Body as NodeJS.ReadableStream, res);

    //reed from result.Body as NodeJS.ReadableStream, - write in res
    // pipeline(result.Body as NodeJS.ReadableStream, res);//old
    //pipeline want callBack -- but we makeing aswnk and await -so we will transfere callback to async by (promisify)

    //insert key in res header -
  });
  App.get("/Pre-Signed-Upload/*path", async (req, res, next) => {
    // console.log(req.params.path);
    const { path } = req.params;
    const { fileName, downLoad } = req.query;
    //data of URL will be in path Key as array
    // console.log(req.params.path.join("/")); // merge them as URL
    const Key = path.join("/");
    const result = await S3BucketService.CreatePreSignedGetFile({
      Key,
      downLoad: downLoad as string,
      fileName: (fileName as string) || (path[path.length - 1] as string),
    });

    return SuccessResponse({ res, Msg: "Done", data: result });
    //we need to write buffer on response - so we need pipeLine
    //pipe take res return dist
    // console.log({ result });
    // const pipLinePromise = promisify(pipeline);

    //to downLoad File with its name
    // if ((downLoad == "true")) {
    //   res.setHeader(
    //     "content-disposition",
    //     `attachment; fileName=${fileName || path[path.length - 1]}`,
    //   );
    // }
    // await pipLinePromise(result.Body as NodeJS.ReadableStream, res);

    //reed from result.Body as NodeJS.ReadableStream, - write in res
    // pipeline(result.Body as NodeJS.ReadableStream, res);//old
    //pipeline want callBack -- but we makeing aswnk and await -so we will transfere callback to async by (promisify)

    //insert key in res header -
  });

  //we put it bootsatrab to be common on the project

  App.get(
    "/",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      res.status(200).send("Landing Page");
    },
  );
  App.post("/sendNotification", async (req, res) => {
    return res.json({ body: req.body });
  });
  App.get(
    "/*dummy",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ): void => {
      res.status(404).json({ Msg: "Invalid Url Or Method" });
    },
  );
  App.use(GlobalErrHandling);
  App.listen(3000, () => {
    console.log("port is runing on prot 3000");
  });
}
export default AppBoostrab;

/*
tsc --w
npm i -D typescript
npm i -D concurrently
npm i -D @types/express

DTO - DATA TO OBJECT - determine input and output API

 "types": ["node"]
   // and npm install -D @types/node 

   CustomErr
   
*/

/*
[1] [Object: null prototype] {
[1]   path: [
[1]     'social',
[1]     'User',
[1]     '69f3c8b585aae935961cd547',
[1]     'ProfilePics',
[1]     '6970cd67-044f-41cf-bceb-ee18b14f6996_1.png'
[1]   ]
[1] }


 */
