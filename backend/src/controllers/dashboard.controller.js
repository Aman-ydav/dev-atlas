import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserProgress } from "../models/userProgress.model.js";
import { Knowledge } from "../models/knowledge.model.js";
import { Activity } from "../models/activity.model.js";

const SUMMARY_FIELDS = "title slug type category difficulty tags readTimeMinutes updatedAt";

// One aggregated round-trip by design — the Dashboard is intentionally minimal
// (no charts/streaks/XP), see docs/01-product-vision.md "Product Principles".
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [
        continueLearning,
        recentlyViewedActivity,
        recentlyUpdated,
        revisionDueCount,
        pinned,
        recentActivity,
        totalBookmarks,
        totalRevisionsAgg,
        distinctViewedKnowledge,
    ] = await Promise.all([
        UserProgress.find({ user: userId, status: "in_progress" })
            .populate("knowledge", SUMMARY_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(5),
        Activity.find({ user: userId, action: "viewed" })
            .populate("knowledge", SUMMARY_FIELDS)
            .sort({ createdAt: -1 })
            .limit(10),
        Knowledge.find({ status: "published", isDeleted: false })
            .select(SUMMARY_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(5),
        UserProgress.countDocuments({
            user: userId,
            "revision.isMarkedForRevision": true,
            "revision.nextRevisionAt": { $lte: new Date() },
        }),
        UserProgress.find({ user: userId, isPinned: true })
            .populate("knowledge", SUMMARY_FIELDS)
            .sort({ updatedAt: -1 })
            .limit(10),
        Activity.find({ user: userId })
            .populate("knowledge", "title slug type")
            .sort({ createdAt: -1 })
            .limit(10),
        UserProgress.countDocuments({ user: userId, isBookmarked: true }),
        UserProgress.aggregate([
            { $match: { user: userId } },
            { $project: { revisionCount: { $size: "$revision.history" } } },
            { $group: { _id: null, total: { $sum: "$revisionCount" } } },
        ]),
        Activity.distinct("knowledge", { user: userId, action: "viewed" }),
    ]);

    const recentlyViewed = [];
    const seen = new Set();
    for (const activity of recentlyViewedActivity) {
        const id = String(activity.knowledge?._id);
        if (!activity.knowledge || seen.has(id)) continue;
        seen.add(id);
        recentlyViewed.push(activity.knowledge);
        if (recentlyViewed.length >= 5) break;
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                continueLearning: continueLearning.map((p) => p.knowledge).filter(Boolean),
                recentlyViewed,
                recentlyUpdated,
                revisionDueCount,
                pinned: pinned.map((p) => p.knowledge).filter(Boolean),
                recentActivity,
                stats: {
                    totalCardsViewed: distinctViewedKnowledge.length,
                    totalBookmarks,
                    totalRevisionsDone: totalRevisionsAgg[0]?.total || 0,
                },
            },
            "Dashboard fetched"
        )
    );
});

export { getDashboard };
