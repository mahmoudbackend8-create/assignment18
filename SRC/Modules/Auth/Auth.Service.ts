import EmailService from "../../Common/Email/Email.Service.js";
import CustomError from "../../Common/Exeptions/CustomError.js";
import {
  BadRequestExeption,
  ConflictExeption,
  NotFoundExeption,
} from "../../Common/Exeptions/DomainExeption.js";
import { bcrypting } from "../../Common/Security/Bcrypting.js";
import { Comparing, Hashing } from "../../Common/Security/Hashing.js";
import TokenService from "../../Common/Security/TokenService.js";
import UserRepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import type { IHUser } from "../../DB/Models/UserModel.js";
import type {
  ConfirmEmailDTO,
  LoginDTO,
  signUpDTO,
  UpdateForgetPassDTO,
  VarifyForgetPassOTPDTO,
} from "./Auth.DTO.ts";
import { EmailTypeEnum } from "../../Common/Enums/EmailEnums.js";
import UserModel from "../../DB/Models/UserModel.js";
import RedisServices from "../../DB/Redis/Redis.Service.js";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../../Config/Config.service.js";
import { UserProvider } from "../../Common/Enums/User.Enums.js";
class AuthService {
  private _EmailService = EmailService;
  private _UserDbRepo = UserRepo;
  private _TokenService = TokenService;
  private _RedisServices = RedisServices;
  public async SignUp(bodyData: signUpDTO): Promise<IHUser> {
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

    // throw new CustomError("invalid", 404, { cause: { ADD: "ok" } });cahnged because Custom Err we put Cause direct instead of Options
    // throw new CustomError("invalid", 404, { add: "ok" });
    // throw new BadRequestExeption("invalid", { Add: "NO GOOD" });
    return User!;
  }
  public async Login(bodyData: LoginDTO) {
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
  public async ConfirmEmail(DataBody: ConfirmEmailDTO) {
    const { OTP, Email } = DataBody;
    const user = await this._UserDbRepo.findOne({
      filter: { Email, ConfirmEmail: false },
    });

    if (!user) {
      throw new BadRequestExeption("Invalid User or Email Already Confirmed");
    }

    const OTPStored = await this._RedisServices.get(
      this._RedisServices.getOTPKey({
        Email,
        emailType: EmailTypeEnum.ConfirmEmail,
      }),
    );
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
  public async resendOTPConfirmEmail(Email: string) {
    await this._EmailService.SendEmailOTP({
      Email,
      emailType: EmailTypeEnum.ConfirmEmail,
      subject: "Another Confirm Your Email",
    });
  }
  public async sendOTPForgerpassword(Email: string) {
    const user = await this._UserDbRepo.findOne({ filter: { Email } });
    if (!user) {
      return; ////////////////////security
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
  public async verifyOTPForgetPassward(bodyData: VarifyForgetPassOTPDTO) {
    const { Email, OTP } = bodyData;
    const OTPExist = await this._RedisServices.get(
      this._RedisServices.getOTPKey({
        Email,
        emailType: EmailTypeEnum.ForgetPssword,
      }),
    );

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
  public async updateForgetPassword(bodyData: UpdateForgetPassDTO) {
    const { Email, OTP, Password } = bodyData;
    await this.verifyOTPForgetPassward({ Email, OTP });
    await this._UserDbRepo.UpdateOne({
      filter: { Email },
      update: { Password: await Hashing({ PlainText: Password }) },
    });

    return;
  }
  public async resendOTPForgetPassword(Email: string) {
    await this._EmailService.SendEmailOTP({
      Email,
      emailType: EmailTypeEnum.ForgetPssword,
      subject: "Another ForgetPassward OTP",
    });
  }

  async VarifyGoogleIdToken(idToken: string) {
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

  async logInWithGoogle(
    idToken: string,
  ): Promise<{ AccessToken: string; RefreshToken: string }> {
    const payLoad = await this.VarifyGoogleIdToken(idToken);

    if (!payLoad) {
      throw new BadRequestExeption("Invalid token");
    }
    if (!payLoad.email_verified) {
      throw new BadRequestExeption("email Must Be varified");
    }

    const user = await this._UserDbRepo.findOne({
      filter: {
        email: payLoad.email as string,
        Providor: UserProvider.Google,
      },
    });
    // if (!user) {
    //   return this.signUpWithGmail(idToken);
    // }

    return this._TokenService.GetAccesAndRefreshToken(user as IHUser);
  }

  async signUpWithGmail(idToken: string): Promise<{
    status: number;
    result: {
      AccessToken: string;
      RefreshToken: string;
    };
  }> {
    const payLoadGoogleToken = await this.VarifyGoogleIdToken(idToken);
    if (!payLoadGoogleToken) {
      throw new BadRequestExeption("invalid payLoadGoogleToken");
    }
    if (!payLoadGoogleToken.email_verified) {
      throw new BadRequestExeption("email must be varified");
    }
    const user = await this._UserDbRepo.findOne({
      filter: { email: payLoadGoogleToken.email as string },
    });

    if (user) {
      if (user.Provider == UserProvider.System) {
        throw new BadRequestExeption(
          "email already exist - Login with your email and passward",
        );
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
          Provider: UserProvider.Google, // this will let you not have to enter password - USERMODEL FUNCTION
        },
      ],
    });

    return {
      result: this._TokenService.GetAccesAndRefreshToken(AddUser!),
      status: 201,
    };
  }
}
export default new AuthService();
