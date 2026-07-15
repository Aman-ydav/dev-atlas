import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserProgress } from "../models/userProgress.model.js";
import { REVISION_INTERVAL_DAYS, REVISION_RELEARNING_MINUTES } from "../constants.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

// Shared by every list endpoint that renders a KnowledgeCard (due, bookmarks,
// pinned, favorites) — category was previously left as a bare ObjectId and
// readTimeMinutes/pattern/tagline weren't selected at all, so those cards
// rendered visibly sparser than the same cards everywhere else in the app.
const KNOWLEDGE_CARD_POPULATE = {
    path: "knowledge",
    select: "title slug type category difficulty tags readTimeMinutes pattern tagline",
    populate: { path: "category", select: "name" },
};

const findOrDefault = async (userId, knowledgeId) => {
    const progress = await UserProgress.findOne({ user: userId, knowledge: knowledgeId });
    if (progress) return progress;

    return new UserProgress({ user: userId, knowledge: knowledgeId });
};

const getProgress = asyncHandler(async (req, res) => {
    const progress = await findOrDefault(req.user._id, req.params.knowledgeId);

    return res.status(200).json(new ApiResponse(200, progress, "Progress fetched"));
});

const updateProgress = asyncHandler(async (req, res) => {
    const progress = await UserProgress.findOneAndUpdate(
        { user: req.user._id, knowledge: req.params.knowledgeId },
        { $set: req.body },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(new ApiResponse(200, progress, "Progress updated"));
});

// Applies the leveled re-queue algorithm from docs/06-database-design.md §5.
// "forgot" always re-queues as a short relearning step rather than a fixed
// day out, so a repeatedly-missed card can resurface again the same
// session instead of being stuck a full day out regardless of how many
// times in a row it was missed.
const submitRevision = asyncHandler(async (req, res) => {
    const { result } = req.body;
    const progress = await UserProgress.findOneAndUpdate(
        { user: req.user._id, knowledge: req.params.knowledgeId },
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const now = new Date();
    let { level } = progress.revision;
    let nextRevisionAt;

    if (result === "forgot") {
        level = 0;
        nextRevisionAt = addMinutes(now, REVISION_RELEARNING_MINUTES);
    } else if (result === "shaky") {
        level = Math.max(level - 1, 0);
        nextRevisionAt = addDays(now, REVISION_INTERVAL_DAYS.shaky[level]);
    } else {
        level = Math.min(level + 1, 4);
        nextRevisionAt = addDays(now, REVISION_INTERVAL_DAYS.confident[level]);
    }

    progress.revision.level = level;
    progress.revision.lastRevisedAt = now;
    progress.revision.nextRevisionAt = nextRevisionAt;
    progress.revision.history.push({ at: now, result });
    await progress.save();

    return res.status(200).json(new ApiResponse(200, progress, "Revision recorded"));
});

const markForRevision = asyncHandler(async (req, res) => {
    const progress = await UserProgress.findOneAndUpdate(
        { user: req.user._id, knowledge: req.params.knowledgeId },
        {
            $set: {
                "revision.isMarkedForRevision": req.body.marked,
                ...(req.body.marked ? { "revision.nextRevisionAt": new Date() } : {}),
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(new ApiResponse(200, progress, "Revision mark updated"));
});

const getDueForRevision = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const now = new Date();
    const filter = {
        user: req.user._id,
        "revision.isMarkedForRevision": true,
        "revision.nextRevisionAt": { $lte: now },
    };

    const [items, total] = await Promise.all([
        UserProgress.find(filter)
            .populate(KNOWLEDGE_CARD_POPULATE)
            .sort({ "revision.nextRevisionAt": 1 })
            .skip(skip)
            .limit(limit),
        UserProgress.countDocuments(filter),
    ]);

    // When nothing is due right now, tell the caller when the next thing
    // WILL be due instead of leaving the queue looking empty/broken — the
    // difference between "nothing marked for revision" and "caught up,
    // next one's in 6 hours" is only visible with this.
    let nextUp = null;
    if (total === 0) {
        const upcomingFilter = {
            user: req.user._id,
            "revision.isMarkedForRevision": true,
            "revision.nextRevisionAt": { $gt: now },
        };
        const [soonest, upcomingCount] = await Promise.all([
            UserProgress.findOne(upcomingFilter).sort({ "revision.nextRevisionAt": 1 }).select("revision.nextRevisionAt"),
            UserProgress.countDocuments(upcomingFilter),
        ]);
        if (soonest) {
            nextUp = { at: soonest.revision.nextRevisionAt, count: upcomingCount };
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...buildPaginatedResponse(items, total, page, limit), nextUp },
            "Revision due list fetched"
        )
    );
});

const makeListEndpoint = (field) =>
    asyncHandler(async (req, res) => {
        const { page, limit, skip } = parsePagination(req.query);
        const filter = { user: req.user._id, [field]: true };

        const [items, total] = await Promise.all([
            UserProgress.find(filter)
                .populate(KNOWLEDGE_CARD_POPULATE)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            UserProgress.countDocuments(filter),
        ]);

        return res
            .status(200)
            .json(new ApiResponse(200, buildPaginatedResponse(items, total, page, limit), "List fetched"));
    });

const getBookmarks = makeListEndpoint("isBookmarked");
const getPinned = makeListEndpoint("isPinned");
const getFavorites = makeListEndpoint("isFavorite");

export {
    getProgress,
    updateProgress,
    submitRevision,
    markForRevision,
    getDueForRevision,
    getBookmarks,
    getPinned,
    getFavorites,
};
