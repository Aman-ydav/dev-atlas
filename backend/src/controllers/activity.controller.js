import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Activity } from "../models/activity.model.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";

const getMyActivity = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { user: req.user._id };

    const [items, total] = await Promise.all([
        Activity.find(filter)
            .populate("knowledge", "title slug type")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Activity.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, buildPaginatedResponse(items, total, page, limit), "Activity fetched"));
});

const getKnowledgeAuditTrail = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {
        knowledge: req.params.id,
        action: { $in: ["created", "updated", "published"] },
    };

    const [items, total] = await Promise.all([
        Activity.find(filter)
            .populate("user", "name avatarUrl")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Activity.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, buildPaginatedResponse(items, total, page, limit), "Audit trail fetched"));
});

export { getMyActivity, getKnowledgeAuditTrail };
