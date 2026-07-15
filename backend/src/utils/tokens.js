import jwt from "jsonwebtoken";
import crypto from "crypto";

// Single source of truth for both the JWT's own expiry and the cookie
// maxAge that carries it — previously the cookie maxAge was a separate
// hardcoded 30-day literal in auth.controller.js while REFRESH_TOKEN_EXPIRY
// was "10d", so the cookie outlived the token inside it by 20 days.
const parseExpiryToMs = (expiry) => {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 15 * 60 * 1000;
    const [, amount, unit] = match;
    const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return Number(amount) * unitMs[unit];
};

export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "10d";
export const ACCESS_TOKEN_MAX_AGE_MS = parseExpiryToMs(ACCESS_TOKEN_EXPIRY);
export const REFRESH_TOKEN_MAX_AGE_MS = parseExpiryToMs(REFRESH_TOKEN_EXPIRY);

export const generateAccessToken = (user) =>
    jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

export const generateRefreshToken = (user) =>
    jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

// Issues a fresh access+refresh pair and persists the refresh token's hash on
// the user doc. Called at login (oauthCallback) — the refresh token minted
// here is the one that stays valid, unrotated, for the rest of its own
// lifetime (see reissueAccessToken below for why refreshing doesn't call this).
export const issueTokens = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// Mints a new access token for an already-verified refresh token, without
// rotating the refresh token itself — refreshTokenHash is left untouched, so
// there's no write and nothing for a second concurrent refresh call (e.g. a
// second browser tab hitting the same expiry) to race. The refresh token
// stays valid for its own fixed lifetime from login, not sliding on every use.
export const reissueAccessToken = (user) => generateAccessToken(user);
