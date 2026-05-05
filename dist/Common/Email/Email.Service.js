import RedisServices from "../../DB/Redis/Redis.Service.js";
import { BadRequestExeption } from "../Exeptions/DomainExeption.js";
import { generateOTP } from "../OTP/OTP.service.js";
import sendMail from "./Email.Config.js";
import { Hashing } from "../Security/Hashing.js";
class EmailService {
    _RedisServices = RedisServices;
    async SendEmailOTP({ Email, emailType, subject, }) {
        const previousOTPTTL = await this._RedisServices.ttl(this._RedisServices.getOTPKey({ Email, emailType }));
        if (previousOTPTTL > 0) {
            throw new BadRequestExeption(`you have valid otp - wait ${previousOTPTTL} second `);
        }
        const ReqBlocked = await this._RedisServices.ttl(this._RedisServices.getOTPKeyBlocked({
            Email,
            emailType,
        }));
        if (ReqBlocked > 0) {
            throw new BadRequestExeption(`you cant send OTP Remain Time ${ReqBlocked}M`);
        }
        const reqNum = await this._RedisServices.get(this._RedisServices.getOTPKeyAtempsNum({
            Email,
            emailType,
        }));
        if (Number(reqNum) == 5) {
            await this._RedisServices.set({
                key: this._RedisServices.getOTPKeyBlocked({
                    Email,
                    emailType,
                }),
                value: 1,
                EXvalue: 5 * 60,
            });
            throw new BadRequestExeption(`you can.t request more than 4 OTP in 20 Minutes `);
        }
        const OTP = generateOTP();
        await sendMail({
            to: Email,
            subject,
            html: `<h1>${OTP}</h1>`,
        });
        await this._RedisServices.set({
            key: this._RedisServices.getOTPKey({
                Email,
                emailType,
            }),
            value: await Hashing({ PlainText: OTP.toString() }),
            EXvalue: 120,
        });
        await this._RedisServices.incr(this._RedisServices.getOTPKeyAtempsNum({
            Email,
            emailType,
        }));
    }
}
export default new EmailService();
