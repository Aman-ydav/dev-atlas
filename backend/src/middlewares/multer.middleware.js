import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp");
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const ALLOWED_MIME = /^(image|video)\/|^application\/pdf$/;

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type. Only images, videos, and PDFs are allowed."));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
