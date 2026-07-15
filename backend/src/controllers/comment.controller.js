import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { Activity } from "../models/activity.model.js";
import { ADMIN_ROLES, COMMENT_MAX_DEPTH } from "../constants.js";

const isAdminUser = (user) => ADMIN_ROLES.includes(user?.role);

const AUTHOR_FIELDS = "name avatarUrl";

// Public: any signed-in-or-not visitor can read a topic's thread. `flagged`
// is a separate, admin-only, sitewide view (ignores `knowledge`) backing
// the "admin filter, not a full review queue" moderation surface.
const getComments = asyncHandler(async (req, res) => {
    let filter;
    if (req.query.flagged === "true") {
        if (!isAdminUser(req.user)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }
        filter = { flagged: true, isDeleted: false };
    } else {
        if (!req.query.knowledge) throw new ApiError(400, "knowledge is required");
        filter = { knowledge: req.query.knowledge };
    }

    const sort = req.query.sort === "newest" ? { createdAt: -1 } : { score: -1, createdAt: -1 };

    const comments = await Comment.find(filter).sort(sort).populate("author", AUTHOR_FIELDS);

    let myVotes = new Map();
    if (req.user) {
        const votes = await Vote.find({
            user: req.user._id,
            comment: { $in: comments.map((c) => c._id) },
        });
        myVotes = new Map(votes.map((v) => [String(v.comment), v.value]));
    }

    const withVotes = comments.map((c) => ({
        ...c.toObject(),
        myVote: myVotes.get(String(c._id)) || 0,
    }));

    return res.status(200).json(new ApiResponse(200, withVotes, "Comments fetched"));
});

// One endpoint for both a top-level comment and a reply, distinguished by
// an optional `parent` — matches how this codebase already treats "create,
// behavior varies by an optional field" elsewhere (Knowledge's own `type`
// discriminator) rather than one route per variant.
const createComment = asyncHandler(async (req, res) => {
    const { knowledge, parent, body } = req.body;

    let parentDoc = null;
    if (parent) {
        parentDoc = await Comment.findOne({ _id: parent, knowledge, isDeleted: false });
        if (!parentDoc) throw new ApiError(404, "Comment being replied to was not found");
    }

    let effectiveParent = null;
    let root = null;
    let depth = 0;
    let replyingTo = null;

    if (parentDoc) {
        replyingTo = parentDoc._id;
        root = parentDoc.root || parentDoc._id;
        if (parentDoc.depth >= COMMENT_MAX_DEPTH) {
            // Depth-cap reached — attach as a sibling under the same
            // depth-cap ancestor instead of nesting deeper (Discourse-style
            // flattening). `replyingTo` still points at the actual parent
            // the user replied to, so the UI can show "replying to @X" even
            // though the visual nesting no longer conveys it.
            effectiveParent = parentDoc.parent || parentDoc._id;
            depth = COMMENT_MAX_DEPTH;
        } else {
            effectiveParent = parentDoc._id;
            depth = parentDoc.depth + 1;
        }
    }

    const comment = await Comment.create({
        knowledge,
        author: req.user._id,
        parent: effectiveParent,
        root,
        replyingTo,
        depth,
        body,
    });
    await comment.populate("author", AUTHOR_FIELDS);

    // Fire-and-forget, same pattern as viewCount/Activity logging elsewhere
    // — a failed activity log shouldn't fail the comment creation itself.
    // "commented_note" already exists in ACTIVITY_ACTIONS, reserved but
    // unused until now — logging it surfaces new comments in the
    // Dashboard's existing recent-activity feed for free.
    Activity.create({ user: req.user._id, action: "commented_note", knowledge }).catch(() => {});

    return res
        .status(201)
        .json(new ApiResponse(201, { ...comment.toObject(), myVote: 0 }, "Comment created"));
});

// Unlimited self-edit, no time window — cheaper than a cron-swept expiring
// window, and this app has no history of edit abuse to defend against yet.
const updateComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new ApiError(404, "Comment not found");
    if (String(comment.author) !== String(req.user._id)) {
        throw new ApiError(403, "You do not have permission to perform this action");
    }

    comment.body = req.body.body;
    comment.editedAt = new Date();
    await comment.save();
    await comment.populate("author", AUTHOR_FIELDS);

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new ApiError(404, "Comment not found");

    const isOwner = String(comment.author) === String(req.user._id);
    if (!isOwner && !isAdminUser(req.user)) {
        throw new ApiError(403, "You do not have permission to perform this action");
    }

    comment.body = "";
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = isOwner ? "author" : "admin";
    await comment.save();

    return res.status(204).end();
});

// Toggle semantics: no existing vote -> cast it; same value clicked again
// -> retract it; opposite value -> flip it. The Vote row's own read-then-
// write has a narrow theoretical double-click race on the same user+comment
// (mitigated at the UI layer by disabling the vote buttons while in
// flight, not worth a transaction for); the denormalized counters on
// Comment are updated with a single atomic $inc either way.
const voteComment = asyncHandler(async (req, res) => {
    const { value } = req.body;
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new ApiError(404, "Comment not found");

    const existing = await Vote.findOne({ comment: comment._id, user: req.user._id });

    let delta;
    let myVote;

    if (!existing) {
        await Vote.create({ comment: comment._id, user: req.user._id, value });
        delta = value === 1 ? { score: 1, upvotes: 1, downvotes: 0 } : { score: -1, upvotes: 0, downvotes: 1 };
        myVote = value;
    } else if (existing.value === value) {
        await existing.deleteOne();
        delta = value === 1 ? { score: -1, upvotes: -1, downvotes: 0 } : { score: 1, upvotes: 0, downvotes: -1 };
        myVote = 0;
    } else {
        existing.value = value;
        await existing.save();
        delta = value === 1 ? { score: 2, upvotes: 1, downvotes: -1 } : { score: -2, upvotes: -1, downvotes: 1 };
        myVote = value;
    }

    const updated = await Comment.findByIdAndUpdate(comment._id, { $inc: delta }, { new: true });

    return res.status(200).json(
        new ApiResponse(
            200,
            { score: updated.score, upvotes: updated.upvotes, downvotes: updated.downvotes, myVote },
            "Vote recorded"
        )
    );
});

// No un-flag/dismiss action in v1 — a flagged comment drops out of the
// admin queue once it's soft-deleted (see getComments' filter above). A
// real, explicitly-named limitation of "admin filter, not a full review
// queue", not an oversight.
const flagComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { flagged: true, flagReason: req.body.reason || "" },
        { new: true }
    );
    if (!comment) throw new ApiError(404, "Comment not found");

    return res.status(200).json(new ApiResponse(200, comment, "Comment flagged"));
});

export { getComments, createComment, updateComment, deleteComment, voteComment, flagComment };
