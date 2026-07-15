import mongoose, { Schema } from "mongoose";

// Separate collection rather than an embedded array on Comment — the same
// justified exception to this codebase's usual "avoid junction collections"
// bias that UserProgress already establishes (docs/06-database-design.md
// §1), for the same two reasons: an unbounded-growth relationship, and a
// need for a DB-enforced uniqueness constraint an embedded array can't
// cheaply provide.
const voteSchema = new Schema(
    {
        comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        value: { type: Number, enum: [1, -1], required: true },
    },
    { timestamps: true }
);

// One vote per user per comment, DB-enforced — also what makes toggling
// (new / un-vote / flip) safe to implement as read-then-write.
voteSchema.index({ comment: 1, user: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);
