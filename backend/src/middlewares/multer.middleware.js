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

const ALLOWED_MEDIA_MIME = /^(image|video)\/|^application\/pdf$/;

const mediaFileFilter = (req, file, cb) => {
    if (ALLOWED_MEDIA_MIME.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type. Only images, videos, and PDFs are allowed."));
    }
};

// For Attachment uploads (Cloudinary-bound): images, videos, PDFs.
export const upload = multer({
    storage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

const ALLOWED_CSV_MIME = /^text\/csv$|^application\/(vnd\.ms-excel|csv)$/;

const csvFileFilter = (req, file, cb) => {
    if (ALLOWED_CSV_MIME.test(file.mimetype) || file.originalname.toLowerCase().endsWith(".csv")) {
        cb(null, true);
    } else {
        cb(new Error("Only .csv files are allowed."));
    }
};

// For the admin DSA bulk-import endpoint — a plain-text CSV, never uploaded to Cloudinary.
export const uploadCsv = multer({
    storage,
    fileFilter: csvFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
