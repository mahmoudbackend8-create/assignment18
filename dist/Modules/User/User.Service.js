import UserDbrepo from "../../DB/DB.Reposatory.js/User.Dbrepo.js";
import RedisServices from "../../DB/Redis/Redis.Service.js";
import S3BucketService from "../../Common/S3Bucket/S3BucketService.js";
import { StorageApproachEnum } from "../../Common/Enums/Multer.js";
import { promise } from "zod";
class UserService {
    _UserService = UserDbrepo;
    _RedisServices = RedisServices;
    _S3BucketService = S3BucketService;
    async logOut(userId, TokenData, LogOutOption) {
        if (LogOutOption == "All") {
            await this._UserService.UpdateOne({
                filter: { _id: userId },
                update: { ChangeCreditTime: new Date() },
            });
        }
        else {
            await this._RedisServices.set({
                key: this._RedisServices.BlackListKeys({
                    userID: TokenData.sub,
                    TokenID: TokenData.jti,
                }),
                value: TokenData.jti,
                EXvalue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - TokenData.iat),
            });
        }
    }
    async UploadProfilePic(BodyData, User) {
        const { Key, URL } = await this._S3BucketService.CreatePresignURLUploadFile({
            originalname: BodyData.originalname,
            ContentType: BodyData.ContentType,
            path: `User/${User._id}/ProfilePics`,
        });
        if (User.ProfilePic) {
            await this._S3BucketService.DeleteFile(User.ProfilePic);
        }
        User.ProfilePic = Key;
        await User.save();
        return { Key, URL };
    }
    async UploadCoverPic(files, User) {
        const Keys = await this._S3BucketService.UploadFiles({
            files,
            path: `User/${User._id}/CoverPics`,
        });
        if (User.CoverPics.length > 0) {
            await Promise.all(User.CoverPics.map((CoverPics) => {
                return this._S3BucketService.DeleteFile(CoverPics);
            }));
        }
        User.CoverPics = Keys;
        await User.save();
        return Keys;
    }
    async DeleteUser(User) {
        const files = await this._S3BucketService.ListFolderKeys(`User/${User._id}`);
        const Keys = files.Contents?.map((file) => {
            return { Key: file.Key };
        });
        await this._S3BucketService.DeleteFiles(Keys);
        await User.deleteOne();
    }
}
export default new UserService();
