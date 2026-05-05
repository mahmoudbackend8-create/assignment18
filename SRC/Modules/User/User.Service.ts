import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisServices from "../../DB/Redis/Redis.Service.js";
import S3BucketService from "../../Common/S3Bucket/S3BucketService.js";
import type { IHUser } from "../../DB/Models/UserModel.js";
import { StorageApproachEnum } from "../../Common/Enums/Multer.js";
import { promise } from "zod";
import type { UploadProfilePicDTO } from "./User.DTO.js";

class UserService {
  private _UserService = UserDbrepo;
  private _RedisServices = RedisServices;
  private _S3BucketService = S3BucketService;
  public async logOut(
    userId: string | Types.ObjectId,
    TokenData: JwtPayload,
    LogOutOption: string,
  ) {
    if (LogOutOption == "All") {
      await this._UserService.UpdateOne({
        filter: { _id: userId },
        update: { ChangeCreditTime: new Date() },
      });
    } else {
      await this._RedisServices.set({
        key: this._RedisServices.BlackListKeys({
          userID: TokenData.sub as string,
          TokenID: TokenData.jti as string,
        }),
        value: TokenData.jti as string,
        EXvalue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - TokenData.iat!), //(exRefreshToken -ramain time from initiated)
      });
    }
  }
  public async UploadProfilePic(BodyData: UploadProfilePicDTO, User: IHUser) {
    // const key = await this._S3BucketService.UploadLargeFile({
    //   file,
    //   path: `User/${User._id}/ProfilePics`,
    //   UploadApproach:StorageApproachEnum.Disk
    // });
    const { Key, URL } = await this._S3BucketService.CreatePresignURLUploadFile(
      {
        originalname: BodyData.originalname,
        ContentType: BodyData.ContentType,
        path: `User/${User._id}/ProfilePics`,
      },
    );
    if (User.ProfilePic) {
      await this._S3BucketService.DeleteFile(User.ProfilePic);
    }
    User.ProfilePic = Key;
    await User.save();
    return { Key, URL };
  }
  public async UploadCoverPic(files: Express.Multer.File[], User: IHUser) {
    //  for (const file of files) {
    //    const key = await this._S3BucketService.UploadLargeFile({ file, path: "User" });
    //  }
    //for of will raise files one by one - instead of that we used Promise all to raise them at same time
    // const Keys = await Promise.all(
    //   files.map((file) => {
    //     return this._S3BucketService.UploadLargeFile({ file, path: "User" });
    //   }),
    // );
    /*
    we will use it in s3Buckets
    */
    const Keys = await this._S3BucketService.UploadFiles({
      files,
      path: `User/${User._id}/CoverPics`,
    });
    if (User.CoverPics.length > 0) {
      await Promise.all(
        User.CoverPics.map((CoverPics) => {
          return this._S3BucketService.DeleteFile(CoverPics);
        }),
      );
    }
    User.CoverPics = Keys;
    await User.save();
    return Keys;
  }
  public async DeleteUser(User: IHUser) {
    const files = await this._S3BucketService.ListFolderKeys(
      `User/${User._id}`,
    );

    const Keys = files.Contents?.map((file) => {
      return { Key: file.Key };
    });
    await this._S3BucketService.DeleteFiles(Keys as { Key: string }[]);
    await User.deleteOne();
    // if (User.ProfilePic) {
    //   await this._S3BucketService.DeleteFile(User.ProfilePic);
    // }
    // if (User.CoverPics.length > 0) {
    //   await Promise.all(
    //     User.CoverPics.map((CoverPics) => {
    //       return this._S3BucketService.DeleteFile(CoverPics);
    //     }),
    //   );
    // }
  }
}

export default new UserService();

/*
"Msg": "Deleted",
    "data": {
        "IsTruncated": false,
        "Contents": [
            {
                "Key": "social/User/69f8f5c4dc60adb0108aa884/CoverPics/0fbd9886-c84e-4d76-8155-0b81d5e4a172_1.png",
                "LastModified": "2026-05-04T21:15:28.000Z",
                "ETag": "\"9e6fe360b9dfd90539dbcabfe27ad121\"",
                "ChecksumAlgorithm": [
                    "CRC32"
                ],
                "ChecksumType": "FULL_OBJECT",
                "Size": 60460,
                "StorageClass": "STANDARD"
            },
            {
                "Key": "social/User/69f8f5c4dc60adb0108aa884/CoverPics/2218ec04-0714-49fb-b244-8d5741d3137d_123.png",
                "LastModified": "2026-05-04T21:15:28.000Z",
                "ETag": "\"41576ccbb029407726551498f4639580\"",
                "ChecksumAlgorithm": [
                    "CRC32"
                ],
                "ChecksumType": "FULL_OBJECT",
                "Size": 133081,
                "StorageClass": "STANDARD"
            },
            {
                "Key": "social/User/69f8f5c4dc60adb0108aa884/CoverPics/2c2e2e05-c6ee-4828-afc5-2052b476cf8a_11.png",
                "LastModified": "2026-05-04T21:15:28.000Z",
                "ETag": "\"c531a9a3d14565c2cf958a0de1993c20\"",
                "ChecksumAlgorithm": [
                    "CRC32"
                ],
                "ChecksumType": "FULL_OBJECT",
                "Size": 168428,
                "StorageClass": "STANDARD"
            },
            {
                "Key": "social/User/69f8f5c4dc60adb0108aa884/ProfilePics/ab2f1189-dd43-4665-b08b-57ef13715de1_non.png",
                "LastModified": "2026-05-04T19:44:18.000Z",
                "ETag": "\"9e6fe360b9dfd90539dbcabfe27ad121\"",
                "ChecksumAlgorithm": [
                    "CRC64NVME"
                ],
                "ChecksumType": "FULL_OBJECT",
                "Size": 60460,
                "StorageClass": "STANDARD"
            }
        ],
        "Name": "social-app12",
        "Prefix": "social/User/69f8f5c4dc60adb0108aa884/",
        "MaxKeys": 1000,
        "KeyCount": 4,
        "$metadata": {
            "httpStatusCode": 200,
            "requestId": "EGEKTP97TMSR97FJ",
            "extendedRequestId": "ro4Alhqt6b397MtOGv4y9KDjMG2el1gH1eECHOAvfHXOSdDBKNhAW6dn6LyECuCtCJhLcU1ks91di4mULvKehQ==",
            "attempts": 1,
            "totalRetryDelay": 0
        }
    }
}*/
