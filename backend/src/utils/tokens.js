import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) =>
    jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );

export const generateRefreshToken = (user) =>
    jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
    });

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

// Issues a fresh access+refresh pair, persists the refresh token's hash on the
// user doc (for rotation/revocation), and returns both raw tokens to set as cookies.
export const issueTokens = async (user) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};
