import mongoose, { Schema } from "mongoose";
import { RESOURCE_KINDS, RESOURCE_SOURCE_TYPES } from "../constants.js";

const resourceSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        url: { type: String, required: true },
        kind: { type: String, enum: RESOURCE_KINDS, required: true },
        description: { type: String, default: "" },
        // "upload" resources still populate `url` (set client-side from the
        // Cloudinary URL right after upload) so every existing reader of
        // resource.url keeps working unchanged — `attachment` is provenance
        // metadata (format/bytes/etc via Attachment), not the source of truth
        // for the link itself.
        sourceType: { type: String, enum: RESOURCE_SOURCE_TYPES, default: "link" },
        attachment: { type: Schema.Types.ObjectId, ref: "Attachment", default: null },
        addedBy: { type: Schema.Types.ObjectId, ref: "User" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

resourceSchema.index({ addedBy: 1 });

export const Resource = mongoose.model("Resource", resourceSchema);
