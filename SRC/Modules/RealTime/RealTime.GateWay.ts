import { Server as httpServer } from "http";
import { Server, type ExtendedError } from "socket.io";
import TokenService from "../../Common/Security/TokenService.js";
import type { socketAuthType } from "../../Common/InterFaces/Express.InterFaces.js";
import { validationRealTime } from "../../MiddleWares/ValidationMiddleWare.js";
import z from "zod";
import ChatEvents from "../Chat/RealTime/Chat.Events.js";

class RealTimeGateWay {
  private _TokenService = TokenService;
  private _ChatEvents = ChatEvents;
  initializeIo(server: httpServer) {
    const UersTapId: string[] = [];
    const io = new Server(server, { cors: { origin: "*" } });

    io.use(async (socket, next) => {
      //globally
      try {
        const { user, varifyToken } = await this._TokenService.CheckToken(
          socket.handshake.auth.authorization,
        );
        socket.data = { user, varifyToken };
        next();
      } catch (error) {
        // socket.emit("connect_error", error);//or send error in next
        next(error as ExtendedError); // when adding value in next() - it will automatic emit connect-error -socket.emit("connect_error", error)
      }
    });

    io.of("/").on("connection", async (socket: socketAuthType) => {
      this._ChatEvents.getChatEvents(socket);
    });
    io.of("/user").on("connection", (socket) => {
      //if you want to open new live ( use of)
      // console.log(socket);
      socket.on("sayHi", (data, callBack) => {
        console.log(data);
        socket.emit("FromBE", "hELLO");
        // callBack("From BE")
      });
    });
  }
}
export default new RealTimeGateWay();
