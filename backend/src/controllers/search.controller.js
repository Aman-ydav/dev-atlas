import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Knowledge } from "../models/knowledge.model.js";
import { KNOWLEDGE_TYPES } from "../constants.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";

const search = asyncHandler(async (req, res) => {
    const { q, type, category, difficulty, company } = req.query;
    if (!q || !q.trim()) throw new ApiError(400, "Query param 'q' is required");

    const { page, limit, skip } = parsePagination(req.query);

    const baseFilter = { isDeleted: false, status: "published", $text: { $search: q } };
    if (category) baseFilter.category = category;
    if (difficulty) baseFilter.difficulty = difficulty;
    if (company) baseFilter.companies = company;

    const facetFilter = { ...baseFilter };
    const listFilter = { ...baseFilter };
    if (type) listFilter.type = { $in: type.split(",") };

    const [items, total, facetCounts] = await Promise.all([
        Knowledge.find(listFilter, { score: { $meta: "textScore" } })
            .select("title slug type category difficulty tags readTimeMinutes")
            .populate("category", "name slug")
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit),
        Knowledge.countDocuments(listFilter),
        Knowledge.aggregate([
            { $match: facetFilter },
            { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
    ]);

    const facets = Object.fromEntries(KNOWLEDGE_TYPES.map((t) => [t, 0]));
    facetCounts.forEach((f) => {
        facets[f._id] = f.count;
    });

    if (req.user) {
        req.user.pushRecentSearch(q.trim());
        req.user.save({ validateBeforeSave: false }).catch(() => {});
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...buildPaginatedResponse(items, total, page, limit), facets },
            "Search results fetched"
        )
    );
});

const getRecentSearches = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user.recentSearches, "Recent searches fetched"));
});

export { search, getRecentSearches };
