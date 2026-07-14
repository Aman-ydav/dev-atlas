import mongoose, { Schema } from "mongoose";
import { REVISION_RESULTS } from "../constants.js";

const revisionHistorySchema = new Schema(
    {
        at: { type: Date, required: true },
        result: { type: String, enum: REVISION_RESULTS, required: true },
    },
    { _id: false }
);

const revisionSchema = new Schema(
    {
        isMarkedForRevision: { type: Boolean, default: false },
        level: { type: Number, default: 0, min: 0, max: 4 },
        lastRevisedAt: { type: Date, default: null },
        nextRevisionAt: { type: Date, default: null },
        history: { type: [revisionHistorySchema], default: [] },
    },
    { _id: false }
);

const userProgressSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },

        isBookmarked: { type: Boolean, default: false },
        isFavorite: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },

        status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
        },
        personalNotes: { type: String, default: "" },
        personalMistakes: { type: [String], default: [] },

        revision: { type: revisionSchema, default: () => ({}) },
    },
    { timestamps: true }
);

userProgressSchema.index({ user: 1, knowledge: 1 }, { unique: true });
userProgressSchema.index({
    user: 1,
    "revision.isMarkedForRevision": 1,
    "revision.nextRevisionAt": 1,
});
userProgressSchema.index({ user: 1, isBookmarked: 1 });
userProgressSchema.index({ user: 1, isPinned: 1 });

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
