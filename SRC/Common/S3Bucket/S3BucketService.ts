import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import {
  ACCESS_KEY_ID,
  APPLICATION_NAME,
  BUCKET_NAME,
  REGION,
  SECRET_ACCESS_KEY,
} from "../../Config/Config.service.js";
import { Upload } from "@aws-sdk/lib-storage";
import { StorageApproachEnum } from "../Enums/Multer.js";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3BucketService {
  private _Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });

  //linked with s3Bucket
  //raise file
  async CreatePresignURLUploadFile({
    originalname,
    ContentType,
    path,
  }: {
    originalname: string;
    ContentType: string;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${originalname}`,
      //key - its path url aws
      // Body: file.buffer,
      ContentType: ContentType,
      ACL: ObjectCannedACL.private, //who access file
    });

    const url = await getSignedUrl(this._Client, command, { expiresIn: 3600 });
    //url send to frontEnd to upload files direct within AWS
    return { Key: command.input.Key!, URL: url };
  }
  /* 
  async CreatePresignURLUploadFile({
    file,
    path,
  }: {
    file: Express.Multer.File;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
      //key - its path url aws
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.private, //who access file
    });

    const url = await getSignedUrl(this._Client, command, { expiresIn: 3600 });
    //url send to frontEnd to upload files direct within AWS
    return { Key: command.input.Key!, URL: url };
  }
    */
  async UploadFile({
    file,
    path,
  }: {
    file: Express.Multer.File;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
      //key - its path url aws
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.private, //who access file
    });

    await this._Client.send(command);
    return command.input.Key!;
  }

  async UploadLargeFile({
    file,
    path,
    UploadApproach = StorageApproachEnum.Disk,
  }: {
    file: Express.Multer.File;
    path: string;
    UploadApproach?: StorageApproachEnum;
  }) {
    const Command = new Upload({
      client: this._Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
        //key - its path url aws
        Body:
          UploadApproach == StorageApproachEnum.Memory
            ? file.buffer
            : createReadStream(file.path),
        //disk dealing with path and memory dealing with buffers so we need to create buffers if its disk
        ContentType: file.mimetype,
      },

      partSize: 1024 * 1024 * 5,
    });

    Command.on("httpUploadProgress", (progress) => {
      console.log(progress);
      console.log(
        `File Uploading ${((progress.loaded as number) / (progress.total as number)) * 100}%`,
      );
    });
    const result = await Command.done();
    return result.Key as string;
  }

  async UploadFiles({
    files,
    path,
    UploadApproach = StorageApproachEnum.Memory,
  }: {
    files: Express.Multer.File[];
    path: string;
    UploadApproach?: StorageApproachEnum;
  }) {
    const Keys = await Promise.all(
      files.map((file) => {
        return UploadApproach == StorageApproachEnum.Memory
          ? this.UploadFile({ file, path })
          : this.UploadLargeFile({
              file,
              path,
              UploadApproach: StorageApproachEnum.Disk,
            });
      }),
    );
    return Keys;
  }
  async GetFile(Key: string) {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key });
    return await this._Client.send(command);
  }
  async CreatePreSignedGetFile({
    Key,
    fileName,
    downLoad,
  }: {
    Key: string;
    fileName?: string;
    downLoad?: string;
  }) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key,
      ResponseContentDisposition:
        downLoad == "true" ? `attachment; fileName=${fileName}` : undefined,
    });
    return await getSignedUrl(this._Client, command, { expiresIn: 3600 });
  }
  async DeleteFile(Key: string) {
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key });
    return await this._Client.send(command);
  }
  async DeleteFiles(Keys: { Key: string }[]) {
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: { Objects: Keys },
    });
    return await this._Client.send(command);
  }

  async ListFolderKeys(Prefix: string) {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${APPLICATION_NAME}/${Prefix}/`,
    });
    return await this._Client.send(command);
  }
}

export default new S3BucketService();

/*

    if (UploadApproach == StorageApproachEnum.Memory) {
      Keys = await Promise.all(
        files.map((file) => {
          return  this.UploadFile({ file, path });
        }),
      );
      return Keys;
    } else {
      Keys = await Promise.all(
        files.map((file) => {
          return this.UploadLargeFile({
            file,
            path,
            UploadApproach: StorageApproachEnum.Disk,
          });
        }),
      );
      return Keys;
    }

*/
