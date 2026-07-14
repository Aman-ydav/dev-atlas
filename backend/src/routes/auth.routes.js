import { Router } from "express";
import passport from "../config/passport.js";
import {
    oauthCallback,
    refreshAccessToken,
    logout,
    getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { FRONTEND_URL } from "../constants.js";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    oauthCallback
);

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
    "/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    oauthCallback
);

router.post("/refresh", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
