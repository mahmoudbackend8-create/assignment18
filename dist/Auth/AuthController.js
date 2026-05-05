import express from "express";
import AuthService from "./Auth.Service.js";
const AuthRouter = express.Router();
AuthRouter.get("/", (req, res) => {
    return res.status(200).send("Auth Page");
});
AuthRouter.post("/SignUp", (req, res) => {
    const result = AuthService.SignUp(req.body);
    return res.status(201).json({ Msg: "done", result: result });
});
AuthRouter.post("/LogIn", (req, res) => {
    const result = AuthService.Login(req.body);
    return res.status(201).json({ Msg: "done", result: result });
});
export default AuthRouter;
