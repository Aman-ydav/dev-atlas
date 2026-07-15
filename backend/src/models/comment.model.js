import mongoose, { Schema } from "mongoose";
import { COMMENT_MAX_DEPTH, COMMENT_DELETED_BY } from "../constants.js";

const commentSchema = new Schema(
    {
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },

        parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
        root: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
        // Cosmetic only — the comment the user actually clicked "Reply" on.
        // Usually equals `parent`; diverges only when depth-cap
        // auto-reparenting kicks in (see the controller), so the UI can
        // still show "replying to @X" after a reply chain gets flattened
        // onto its depth-cap ancestor.
        replyingTo: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
        depth: { type: Number, default: 0, min: 0, max: COMMENT_MAX_DEPTH },

        body: { type: String, default: "", trim: true },

        score: { type: Number, default: 0 },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },

        editedAt: { type: Date, default: null },

        // Soft delete blanks `body` but keeps parent/root/depth intact so
        // thread structure survives — reads deliberately include deleted
        // comments (rendered as a "[deleted]" placeholder) rather than
        // filtering them out, the way every other soft-deletable model here
        // filters isDeleted:false on read.
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: String, enum: COMMENT_DELETED_BY, default: null },

        flagged: { type: Boolean, default: false },
        flagReason: { type: String, default: "" },
    },
    { timestamps: true }
);

commentSchema.index({ knowledge: 1, createdAt: -1 }); // "Newest" sort
commentSchema.index({ knowledge: 1, score: -1, createdAt: -1 }); // "Top" sort
commentSchema.index({ parent: 1 }); // tree assembly
commentSchema.index({ flagged: 1, isDeleted: 1 }); // admin flagged-queue filter

export const Comment = mongoose.model("Comment", commentSchema);
