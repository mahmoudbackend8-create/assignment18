import { createClient } from "redis";
import { REDIS_URL } from "../../Config/Config.service.js";
export const Client = createClient({ url: REDIS_URL });
export async function TestConnectionRedis() {
    try {
        await Client.connect();
        console.log("Redis Connected Successfilly");
    }
    catch (error) {
        console.log("Redis Connected Failed", error);
    }
}
