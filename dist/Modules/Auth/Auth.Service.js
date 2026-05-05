import EmailService from "../../Common/Email/Email.Service.js";
import CustomError from "../../Common/Exeptions/CustomError.js";
import { BadRequestExeption, ConflictExeption, NotFoundExeption, } from "../../Common/Exeptions/DomainExeption.js";
import { bcrypting } from "../../Common/Security/Bcrypting.js";
import { Comparing, Hashing } from "../../Common/Security/Hashing.js";
import TokenService from "../../Common/Security/TokenService.js";
import UserRepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import { EmailTypeEnum } from "../../Common/Enums/EmailEnums.js";
import UserModel from "../../DB/Models/UserModel.js";
import RedisServices from "../../DB/Redis/Redis.Service.js";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../Config/Config.service.js";
import { UserProvider } from "../../Common/Enums/User.Enums.js";
class AuthService {
    _EmailService = EmailService;
    _UserDbRepo = UserRepo;
    _TokenService = TokenService;
    _RedisServices = RedisServices;
    async SignUp(bodyData) {
        const { Email } = bodyData;
        const EmailExist = await this._UserDbRepo.findOne({
            filter: { Email },
        });
        if (EmailExist) {
            throw new ConflictExeption("Email Already Exist");
        }
        const [User] = await this._UserDbRepo.Create({ data: [bodyData] });
        await this._EmailService.SendEmailOTP({
            Email,
            emailType: EmailTypeEnum.ConfirmEmail,
            subject: "LogIn OTP",
        });
        return User;
    }
    async Login(bodyData) {
        const { Email, Password } = bodyData;
        const user = await this._UserDbRepo.findOne({ filter: { Email } });
        if (!user) {
            throw new NotFoundExeption("Invalid User");
        }
        if (!user.ConfirmEmail) {
            throw new BadRequestExeption("Confirm Your Email First");
        }
        const PassComparing = await Comparing({
            PlainText: Password,
            HashValue: user.Password,
        });
        if (!PassComparing) {
            throw new BadRequestExeption("Invalid Password");
        }
        return this._TokenService.GetAccesAndRefreshToken(user);
    }
    async ConfirmEmail(DataBody) {
        const { OTP, Email } = DataBody;
        const user = await this._UserDbRepo.findOne({
            filter: { Email, ConfirmEmail: false },
        });
        if (!user) {
            throw new BadRequestExeption("Invalid User or Email Already Confirmed");
        }
        const OTPStored = await this._RedisServices.get(this._RedisServices.getOTPKey({
            Email,
            emailType: EmailTypeEnum.ConfirmEmail,
        }));
        if (!OTPStored) {
            throw new BadRequestExeption("OTP EXPIRED");
        }
        const ComparedOTP = await Comparing({
            PlainText: OTP.toString(),
            HashValue: OTPStored,
        });
        console.log({ ComparedOTP });
        if (!ComparedOTP) {
            throw new BadRequestExeption("INVALID OTP");
        }
        user.ConfirmEmail = true;
        user.save();
    }
    async resendOTPConfirmEmail(Email) {
        await this._EmailService.SendEmailOTP({
            Email,
            emailType: EmailTypeEnum.ConfirmEmail,
            subject: "Another Confirm Your Email",
        });
    }
    async sendOTPForgerpassword(Email) {
        const user = await this._UserDbRepo.findOne({ filter: { Email } });
        if (!user) {
            return;
        }
        if (!user.ConfirmEmail) {
            throw new BadRequestExeption("you need to confirm your email first");
        }
        await this._EmailService.SendEmailOTP({
            Email,
            emailType: EmailTypeEnum.ForgetPssword,
            subject: "Reset your password",
        });
    }
    async verifyOTPForgetPassward(bodyData) {
        const { Email, OTP } = bodyData;
        const OTPExist = await this._RedisServices.get(this._RedisServices.getOTPKey({
            Email,
            emailType: EmailTypeEnum.ForgetPssword,
        }));
        if (!OTPExist) {
            throw new BadRequestExeption("OTP EXPIRED");
        }
        const CompareOTP = await Comparing({
            PlainText: OTP,
            HashValue: OTPExist,
        });
        if (!CompareOTP) {
            throw new BadRequestExeption("OTP INVALID");
        }
    }
    async updateForgetPassword(bodyData) {
        const { Email, OTP, Password } = bodyData;
        await this.verifyOTPForgetPassward({ Email, OTP });
        await this._UserDbRepo.UpdateOne({
            filter: { Email },
            update: { Password: await Hashing({ PlainText: Password }) },
        });
        return;
    }
    async resendOTPForgetPassword(Email) {
        await this._EmailService.SendEmailOTP({
            Email,
            emailType: EmailTypeEnum.ForgetPssword,
            subject: "Another ForgetPassward OTP",
        });
    }
    async VarifyGoogleIdToken(idToken) {
        const client = new OAuth2Client();
        if (!GOOGLE_CLIENT_ID) {
            throw new Error("GOOGLE_CLIENT_ID is missing");
        }
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    }
    async logInWithGoogle(idToken) {
        const payLoad = await this.VarifyGoogleIdToken(idToken);
        if (!payLoad) {
            throw new BadRequestExeption("Invalid token");
        }
        if (!payLoad.email_verified) {
            throw new BadRequestExeption("email Must Be varified");
        }
        const user = await this._UserDbRepo.findOne({
            filter: {
                email: payLoad.email,
                Providor: UserProvider.Google,
            },
        });
        return this._TokenService.GetAccesAndRefreshToken(user);
    }
    async signUpWithGmail(idToken) {
        const payLoadGoogleToken = await this.VarifyGoogleIdToken(idToken);
        if (!payLoadGoogleToken) {
            throw new BadRequestExeption("invalid payLoadGoogleToken");
        }
        if (!payLoadGoogleToken.email_verified) {
            throw new BadRequestExeption("email must be varified");
        }
        const user = await this._UserDbRepo.findOne({
            filter: { email: payLoadGoogleToken.email },
        });
        if (user) {
            if (user.Provider == UserProvider.System) {
                throw new BadRequestExeption("email already exist - Login with your email and passward");
            }
            return { status: 200, result: await this.logInWithGoogle(idToken) };
        }
        const [AddUser] = await this._UserDbRepo.Create({
            data: [
                {
                    Email: payLoadGoogleToken.email,
                    UserName: payLoadGoogleToken.name,
                    ProfilePic: payLoadGoogleToken.picture,
                    ConfirmEmail: true,
                    Provider: UserProvider.Google,
                },
            ],
        });
        return {
            result: this._TokenService.GetAccesAndRefreshToken(AddUser),
            status: 201,
        };
    }
}
export default new AuthService();
