import { Router } from "express";
import { search, getRecentSearches } from "../controllers/search.controller.js";
import { verifyJWT, attachUserIfPresent } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", attachUserIfPresent, search);
router.get("/recent", verifyJWT, getRecentSearches);

export default router;
