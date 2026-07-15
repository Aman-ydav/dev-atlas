import mongoose, { Schema } from "mongoose";

const stepSchema = new Schema(
    {
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },
        // Fractional/base62 key (see utils/fractionalIndex.js) — a string, not
        // an index, so a future single-step reorder can compute one new key
        // between two neighbors instead of rewriting the whole array.
        order: { type: String, required: true },
        optional: { type: Boolean, default: false },
    },
    // Deliberate deviation from this codebase's usual { _id: false } on
    // embedded arrays (relationSchema, codeExampleSchema, etc, which are
    // always replaced wholesale on save) — steps is the one array meant to
    // support a future targeted per-row update, which needs a stable handle
    // independent of `knowledge` (a card could be removed and re-added).
    { _id: true }
);

const learningPathSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        description: { type: String, default: "" },
        // Optional, not required — a path is an editorial "recommended
        // sequence" that can legitimately cross categories (e.g. a
        // "backend interview readiness" path spanning DSA + system design +
        // interview cards), unlike a Knowledge card's single required category.
        category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
        steps: { type: [stepSchema], default: [] },
        published: { type: Boolean, default: false },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Reverse lookup for the path-strip: "which paths contain this card".
learningPathSchema.index({ "steps.knowledge": 1 });
learningPathSchema.index({ published: 1, category: 1 });

export const LearningPath = mongoose.model("LearningPath", learningPathSchema);
