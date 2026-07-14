import rateLimit from "express-rate-limit";

const FIFTEEN_MIN = 15 * 60 * 1000;

const makeLimiter = (max, message) =>
    rateLimit({
        windowMs: FIFTEEN_MIN,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { statusCode: 429, success: false, message, errors: [], data: null },
    });

export const authLimiter = makeLimiter(20, "Too many auth attempts, please try again later");
export const uploadLimiter = makeLimiter(30, "Too many uploads, please try again later");
export const readLimiter = makeLimiter(300, "Too many requests, please slow down");
export const writeLimiter = makeLimiter(600, "Too many requests, please slow down");
