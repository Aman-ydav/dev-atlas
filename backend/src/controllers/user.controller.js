import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";

const updateMe = asyncHandler(async (req, res) => {
    Object.assign(req.user, req.body);
    await req.user.save();

    return res.status(200).json(new ApiResponse(200, req.user, "Profile updated"));
});

const listUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { q, role, isActive } = req.query;

    const filter = {};
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
        ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const [items, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, buildPaginatedResponse(items, total, page, limit), "Users fetched"));
});

const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.role = req.body.role;
    await user.save();

    return res.status(200).json(new ApiResponse(200, user, "User role updated"));
});

const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    user.isActive = req.body.isActive;
    await user.save();

    return res.status(200).json(new ApiResponse(200, user, "User status updated"));
});

export { updateMe, listUsers, updateUserRole, updateUserStatus };
