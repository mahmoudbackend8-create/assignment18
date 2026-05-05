import multer from "multer";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { StorageApproachEnum } from "../Enums/Multer.js";
import { fileFilter, allowFileFormats } from "./MulterValidation.js";
function CloudFileUpload({ StorageApproach = StorageApproachEnum.Memory, allowFileFormat = allowFileFormats.img, fileSize = 5, }) {
    const storage = StorageApproach == StorageApproachEnum.Memory
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination(req, file, callback) {
                callback(null, tmpdir());
            },
            filename(req, file, callback) {
                callback(null, `${randomUUID()}_${file.originalname}`);
            },
        });
    return multer({
        storage,
        fileFilter: fileFilter(allowFileFormat),
        limits: { fileSize: fileSize * 1024 * 1024 },
    });
}
export default CloudFileUpload;
