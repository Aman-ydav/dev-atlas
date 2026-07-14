import mongoose, { Schema } from "mongoose";
import { HIGHLIGHT_COLORS } from "../constants.js";

const annotationSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },
        block: { type: String, enum: ["tldr", "explanation"], required: true },
        quote: { type: String, required: true },
        startOffset: { type: Number, default: null },
        endOffset: { type: Number, default: null },
        color: { type: String, enum: HIGHLIGHT_COLORS, default: "yellow" },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

annotationSchema.index({ user: 1, knowledge: 1 });

export const Annotation = mongoose.model("Annotation", annotationSchema);
