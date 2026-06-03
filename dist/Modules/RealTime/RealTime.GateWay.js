import { Server as httpServer } from "http";
import { Server } from "socket.io";
import TokenService from "../../Common/Security/TokenService.js";
import { validationRealTime } from "../../MiddleWares/ValidationMiddleWare.js";
import z from "zod";
import ChatEvents from "../Chat/RealTime/Chat.Events.js";
class RealTimeGateWay {
    _TokenService = TokenService;
    _ChatEvents = ChatEvents;
    initializeIo(server) {
        const UersTapId = [];
        const io = new Server(server, { cors: { origin: "*" } });
        io.use(async (socket, next) => {
            try {
                const { user, varifyToken } = await this._TokenService.CheckToken(socket.handshake.auth.authorization);
                socket.data = { user, varifyToken };
                next();
            }
            catch (error) {
                next(error);
            }
        });
        io.of("/").on("connection", async (socket) => {
            this._ChatEvents.getChatEvents(socket);
        });
        io.of("/user").on("connection", (socket) => {
            socket.on("sayHi", (data, callBack) => {
                console.log(data);
                socket.emit("FromBE", "hELLO");
            });
        });
    }
}
export default new RealTimeGateWay();
