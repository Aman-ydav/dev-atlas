import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a file already written to local disk (by multer) into Cloudinary,
// then always removes the local temp copy — success or failure.
const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "devatlas",
        });
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return null;
    } finally {
        fs.unlink(localFilePath, () => {});
    }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) return null;

    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
