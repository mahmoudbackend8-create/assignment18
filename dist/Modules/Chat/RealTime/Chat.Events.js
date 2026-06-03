import { validationRealTime } from "../../../MiddleWares/ValidationMiddleWare.js";
import { validationSC } from "../Chat.Validation.js";
class ChatEvents {
    getChatEvents(socket) {
        return socket.on("getChat", async (args) => {
            console.log(args);
            validationRealTime(validationSC, args);
        });
    }
}
export default new ChatEvents();
