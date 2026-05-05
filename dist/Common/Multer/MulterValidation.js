import { BadRequestExeption } from "../Exeptions/DomainExeption.js";
export const allowFileFormats = {
    img: ["image/jpeg", "image/png"],
    video: ["Video/mp4"],
};
export function fileFilter(allowFileFormats) {
    return (req, file, cb) => {
        if (!allowFileFormats.includes(file.mimetype)) {
            return cb(new BadRequestExeption("invalid file"));
        }
        return cb(null, true);
    };
}
