import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Access token is invalid or expired");
    }

    const user = await User.findById(decoded._id);
    if (!user) {
        throw new ApiError(401, "Invalid access token — user not found");
    }
    if (!user.isActive) {
        throw new ApiError(403, "This account has been deactivated");
    }

    req.user = user;
    next();
});

// Attaches req.user if a valid token is present, but never throws — for
// public routes whose response shape changes slightly when authenticated
// (e.g. admins seeing draft Knowledge cards in list results).
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (user?.isActive) req.user = user;
    } catch (error) {
        // silently ignore — this route doesn't require auth
    }

    next();
});

export const verifyRole =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }
        next();
    };
