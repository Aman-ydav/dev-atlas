import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Attachment } from "../models/attachment.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const createAttachment = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "file is required");

    const result = await uploadOnCloudinary(req.file.path);
    if (!result) throw new ApiError(500, "File upload to Cloudinary failed");

    const attachment = await Attachment.create({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        uploadedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, attachment, "File uploaded"));
});

const deleteAttachment = asyncHandler(async (req, res) => {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) throw new ApiError(404, "Attachment not found");

    const isOwner = String(attachment.uploadedBy) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
        throw new ApiError(403, "You do not have permission to delete this attachment");
    }

    await deleteFromCloudinary(attachment.publicId, attachment.resourceType);
    await attachment.deleteOne();

    return res.status(204).end();
});

export { createAttachment, deleteAttachment };
