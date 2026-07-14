import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
        format: { type: String, default: "" },
        bytes: { type: Number, default: 0 },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

attachmentSchema.index({ uploadedBy: 1 });

export const Attachment = mongoose.model("Attachment", attachmentSchema);
