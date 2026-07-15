import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { issueTokens, hashToken, ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } from "../utils/tokens.js";
import { COOKIE_OPTIONS, FRONTEND_URL } from "../constants.js";

const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
};
const ACCESS_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
};

// Shared by /auth/google/callback and /auth/github/callback. Passport has
// already attached the resolved User to req.user (session:false, JWT-based).
const oauthCallback = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    user.lastLoginAt = new Date();
    const { accessToken, refreshToken } = await issueTokens(user);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.redirect(`${FRONTEND_URL}/auth/callback`);
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const user = await User.findById(decoded._id).select("+refreshTokenHash");
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshTokenHash !== hashToken(incomingRefreshToken)) {
        // Token reuse/mismatch — treat as a compromised token and revoke the session.
        user.refreshTokenHash = null;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Refresh token has been revoked, please log in again");
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Access token refreshed"));
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshTokenHash: null });

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.status(200).json(new ApiResponse(200, {}, "Logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched"));
});

export { oauthCallback, refreshAccessToken, logout, getCurrentUser };
