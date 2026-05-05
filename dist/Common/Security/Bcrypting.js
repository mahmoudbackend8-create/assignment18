import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../../Config/Config.service.js";
export function bcrypting({ Value, Key = ENCRYPTION_KEY, }) {
    return CryptoJS.AES.encrypt(Value, Key).toString();
}
