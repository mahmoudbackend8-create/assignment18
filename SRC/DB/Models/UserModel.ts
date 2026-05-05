import mongoose, { type HydratedDocument } from "mongoose";
import {
  UserGender,
  UserProvider,
  UserRole,
} from "../../Common/Enums/User.Enums.js";
import { Hashing } from "../../Common/Security/Hashing.js";
import { bcrypting } from "../../Common/Security/Bcrypting.js";
import _EmailService from "../../Common/Email/Email.Service.js";
import { EmailTypeEnum } from "../../Common/Enums/EmailEnums.js";
export interface IUser {
  UserName: string;
  Password: string;
  Email: string;
  Gender: UserGender;
  Phone: string;
  Age: number;
  Provider: UserProvider;
  Role: UserRole;
  ProfilePic: string;
  CoverPics: string[];
  ChangeCreditTime: Date;
  ConfirmEmail: boolean;
  DeletedAt: Date;
}

export type IHUser = HydratedDocument<IUser>;

const UserSchema = new mongoose.Schema<IUser>(
  {
    UserName: { type: String, required: true },
    Password: {
      type: String,
      required: function (): boolean {
        return this.Provider == UserProvider.System;
      },
    },
    Email: { type: String, required: true },
    Gender: { type: Number, enum: UserGender, default: UserGender.Male },
    Phone: String,
    Age: Number,
    Provider: {
      type: Number,
      enum: UserProvider,
      default: UserProvider.System,
    },
    Role: {
      type: Number,
      required: true,
      enum: UserRole,
      default: UserRole.User,
    },
    ProfilePic: String,
    CoverPics: [String],
    ChangeCreditTime: Date,
    ConfirmEmail: {
      type: Boolean,
      default: false,
    },
    DeletedAt: Date,
  },
  {
    timestamps: true,
    strictQuery: true, //doens.t allow filter strang key like paranoid
  },
);
UserSchema.pre("save", async function (this: IHUser & { wasNew: boolean }) {
  if (this.isModified("Password")) {
    this.Password = await Hashing({ PlainText: this.Password });
  }
  if (this.Phone && this.isModified("Phone")) {
    this.Phone = bcrypting({ Value: this.Phone });
  }
  console.log("pre");
  this.wasNew = this.isNew;
});

// UserSchema.post("save", async function (this: IHUser & { wasNew: boolean }) {
//   console.log("post");
//   try {
//     if (this.wasNew) {
//       await _EmailService.SendEmailOTP({
//         Email: this.Email,
//         emailType: EmailTypeEnum.ConfirmEmail,
//         subject: "LogIn OTP",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });
// UserSchema.pre("validate", function () {
//   console.log("pre validate");
//   console.log(this);
// });
// UserSchema.post("validate", function () {
//   console.log("post validate");
// });
// UserSchema.pre("updateOne", { document: true, query: false }, function (doc) {
//   //{ document: true, query: false }, to see codument user not query
//   console.log("pre updateOne");
//   console.log(this);
// });
// UserSchema.post("deleteOne", function () {
//   console.log("post deleteOne");
// });
// UserSchema.pre("deleteOne", function () {
//   console.log("post deleteOne");
// });
// UserSchema.post("insertMany", function (docs) {
//   console.log("post insertMany");
//   console.log(this); // refere model
//   console.log(docs); // refere document
// });
// UserSchema.pre("insertMany", function (docs) {
//   console.log("post insertMany");
// });
// UserSchema.post("findOne", function () {
//   console.log("post findOne");
// });
// UserSchema.pre(["findOne","find"], function () {
//   console.log("pre findOne");
//   console.log(this.getFilter);
//   console.log(this.getQuery);
//   //same
//   //bring filter like email

//   const query = this.getQuery();
//   if(!query.GetSoftDelete){//undefined if we didn.t send it
//   this.setQuery({ ...query, DeletedAt: { $exists: false } }); // adding in query Soft DElete - don.t restore deletedData

//   }
// UserSchema.pre("updateOne", { document: true, query: false }, function () {
//   console.log("pre updateOne");
//   console.log(this);
// });

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
