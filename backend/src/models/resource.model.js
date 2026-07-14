import mongoose, { Schema } from "mongoose";
import { RESOURCE_KINDS } from "../constants.js";

const resourceSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        url: { type: String, required: true },
        kind: { type: String, enum: RESOURCE_KINDS, required: true },
        description: { type: String, default: "" },
        addedBy: { type: Schema.Types.ObjectId, ref: "User" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

resourceSchema.index({ addedBy: 1 });

export const Resource = mongoose.model("Resource", resourceSchema);
