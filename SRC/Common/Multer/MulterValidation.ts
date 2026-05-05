import type { FileFilterCallback } from "multer";
import { BadRequestExeption } from "../Exeptions/DomainExeption.js";
import type { Request } from "express";

export const allowFileFormats = {
  img: ["image/jpeg", "image/png"],
  video: ["Video/mp4"],
};
export function fileFilter(allowFileFormats: string[]) {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowFileFormats.includes(file.mimetype)) {
      return cb(new BadRequestExeption("invalid file"));
    }
    return cb(null, true);
  };
}

