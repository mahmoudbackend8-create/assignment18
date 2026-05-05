import { Client } from "../Redis/Redis.Connection.js";
class RedisServices {
    async set({ key, value, EXtype = "EX", EXvalue = 50, }) {
        return await Client.set(key, value, {
            expiration: { type: EXtype, value: Math.floor(EXvalue) },
        });
    }
    async incr(key) {
        return await Client.incr(key);
    }
    async isKeyExistF(key) {
        return await Client.exists(key);
    }
    async decr(key) {
        return await Client.decr(key);
    }
    async update({ key, value }) {
        const existFiled = await Client.exists(key);
        if (!existFiled) {
            return 0;
        }
        return await Client.set(key, value);
    }
    async remove(keys) {
        return await Client.del(keys);
    }
    async ttl(key) {
        return await Client.ttl(key);
    }
    async setExpire(key, second) {
        return await Client.expire(key, second);
    }
    async removeExpire(key) {
        return await Client.persist(key);
    }
    async get(key) {
        return await Client.get(key);
    }
    async mget(key) {
        return await Client.mGet(key);
    }
    BlackListKeys({ userID, TokenID }) {
        return `blackListTokens :: ${userID}::${TokenID}`;
    }
    getOTPKey({ Email, emailType }) {
        return `OTP::${Email}::${emailType}`;
    }
    getOTPKeyAtempsNum({ Email, emailType, }) {
        return `OTP::${Email}::${emailType}::NUM`;
    }
    getOTPKeyBlocked({ Email, emailType, }) {
        return `OTP::${Email}::${emailType}::BLOCKED`;
    }
}
export default new RedisServices();
