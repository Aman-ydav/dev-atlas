import mongoose, { Schema } from "mongoose";
import { ACTIVITY_ACTIONS } from "../constants.js";

const activitySchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, enum: ACTIVITY_ACTIONS, required: true },
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", default: null },
        meta: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });
// TTL: only "viewed" activity expires (180 days) — created/updated/published stay for audit purposes.
activitySchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 60 * 60 * 24 * 180,
        partialFilterExpression: { action: "viewed" },
    }
);

export const Activity = mongoose.model("Activity", activitySchema);
