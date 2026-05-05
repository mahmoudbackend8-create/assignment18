import type { EmailTypeEnum } from "../../Common/Enums/EmailEnums.js";
import { Client } from "../Redis/Redis.Connection.js";
class RedisServices {
  async set({
    key,
    value,
    EXtype = "EX",
    EXvalue = 50,
  }: {
    key: string;
    value: number | string;
    EXtype?: "EX" | "PX" | "EXAT" | "PXAT";
    EXvalue?: number;
  }) {
    return await Client.set(key, value, {
      expiration: { type: EXtype, value: Math.floor(EXvalue) }, // Math.floor(EXvalue) تقريب حتي لا تكون decimal
    });
  }
  async incr(key: string) {
    return await Client.incr(key);
  }
  async isKeyExistF(key: string) {
    return await Client.exists(key);
  }
  async decr(key: string) {
    return await Client.decr(key);
  }

  async update({ key, value }: { key: string; value: number | string }) {
    const existFiled = await Client.exists(key);
    if (!existFiled) {
      return 0;
    }
    return await Client.set(key, value);
  }

  async remove(keys: string | string[]) {
    return await Client.del(keys);
  }
  //   async hSet(fileds) {
  //     return await Client.hSet(fileds);
  //   }
  async ttl(key: string) {
    return await Client.ttl(key);
  }
  async setExpire(key: string, second: number) {
    return await Client.expire(key, second);
  }
  async removeExpire(key: string) {
    return await Client.persist(key);
  }
  async get(key: string) {
    return await Client.get(key);
  }
  async mget(key: string[]) {
    return await Client.mGet(key);
  }
  BlackListKeys({ userID, TokenID }: { userID: string; TokenID: string }) {
    return `blackListTokens :: ${userID}::${TokenID}`;
  }
  getOTPKey({ Email, emailType }: { Email: string; emailType: EmailTypeEnum }) {
    return `OTP::${Email}::${emailType}`;
  }
  getOTPKeyAtempsNum({
    Email,
    emailType,
  }: {
    Email: string;
    emailType: EmailTypeEnum;
  }) {
    return `OTP::${Email}::${emailType}::NUM`;
  }
  getOTPKeyBlocked({
    Email,
    emailType,
  }: {
    Email: string;
    emailType: EmailTypeEnum;
  }) {
    return `OTP::${Email}::${emailType}::BLOCKED`;
  }
}

export default new RedisServices();
