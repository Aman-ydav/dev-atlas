import { Router } from "express";
import passport from "../config/passport.js";
import {
    oauthCallback,
    refreshAccessToken,
    logout,
    getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import { FRONTEND_URL } from "../constants.js";

const router = Router();

// Strict limiter here only — these are the unauthenticated, abuse-prone endpoints
// (OAuth handshake + token refresh). /me and /logout require a valid JWT already
// and are called on every page load, so they use app.js's general auth-router limiter.
router.get(
    "/google",
    authLimiter,
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
    "/google/callback",
    authLimiter,
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    oauthCallback
);

router.get(
    "/github",
    authLimiter,
    passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
    "/github/callback",
    authLimiter,
    passport.authenticate("github", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    oauthCallback
);

router.post("/refresh", authLimiter, refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
