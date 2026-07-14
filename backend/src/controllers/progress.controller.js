import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserProgress } from "../models/userProgress.model.js";
import { REVISION_INTERVAL_DAYS } from "../constants.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

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
const submitRevision = asyncHandler(async (req, res) => {
    const { result } = req.body;
    const progress = await UserProgress.findOneAndUpdate(
        { user: req.user._id, knowledge: req.params.knowledgeId },
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const now = new Date();
    let { level } = progress.revision;
    let intervalDays;

    if (result === "forgot") {
        level = 0;
        intervalDays = REVISION_INTERVAL_DAYS.forgot;
    } else if (result === "shaky") {
        level = Math.max(level - 1, 0);
        intervalDays = REVISION_INTERVAL_DAYS.shaky;
    } else {
        level = Math.min(level + 1, 4);
        intervalDays = REVISION_INTERVAL_DAYS.confident[level];
    }

    progress.revision.level = level;
    progress.revision.lastRevisedAt = now;
    progress.revision.nextRevisionAt = addDays(now, intervalDays);
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
    const filter = {
        user: req.user._id,
        "revision.isMarkedForRevision": true,
        "revision.nextRevisionAt": { $lte: new Date() },
    };

    const [items, total] = await Promise.all([
        UserProgress.find(filter)
            .populate("knowledge", "title slug type category difficulty tags")
            .sort({ "revision.nextRevisionAt": 1 })
            .skip(skip)
            .limit(limit),
        UserProgress.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, buildPaginatedResponse(items, total, page, limit), "Revision due list fetched"));
});

const makeListEndpoint = (field) =>
    asyncHandler(async (req, res) => {
        const { page, limit, skip } = parsePagination(req.query);
        const filter = { user: req.user._id, [field]: true };

        const [items, total] = await Promise.all([
            UserProgress.find(filter)
                .populate("knowledge", "title slug type category difficulty tags")
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
