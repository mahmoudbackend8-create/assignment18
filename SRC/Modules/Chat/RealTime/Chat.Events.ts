import type { socketAuthType } from "../../../Common/InterFaces/Express.InterFaces.js";
import { validationRealTime } from "../../../MiddleWares/ValidationMiddleWare.js";
import { validationSC } from "../Chat.Validation.js";

class ChatEvents {
  getChatEvents(socket: socketAuthType) {
    // console.log({ socketData: socket.data.varifyToken }); //made interface type to make (user and varifyToken) appear in socket.data
    return socket.on("getChat", async (args) => {
      console.log(args);
      // console.log(validationSC.safeParse({ meassage: args }));
      validationRealTime(validationSC, args); //make tryCatch
    });
    // UersTapId.push(socket.id);
    // console.log(socket.handshake);

    // console.log({ socket: socket.id });
    // console.log({ socket: socket.handshake });

    // socket.emit("Say", "okDone"); // just send to user who send request

    // io.except(UersTapId[-2] as string).emit("Say", "OkDone");
    //send to all except UserTapId
    // socket.except(UersTapId[-2] as string).emit("Say", "OkDone");
    //send to all except UserTapId and Sender
    // io.emit("Say","okDone") // send to all IDS

    // console.log(UersTapId);

    // console.log({ socketId: socket.id });
    // socket.on("sayHi", (data, callBack) => {
    // console.log(data);
    // io.to([UersTapId[1] as string, UersTapId[0] as string]).emit(
    //   "Test",
    //   "Hi How Are You",
    // );
    //send to IDS eXept sender if we use io
    // callBack("From BE")
    // });
  }
}
export default new ChatEvents()