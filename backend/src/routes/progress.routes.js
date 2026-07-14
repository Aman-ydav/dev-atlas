import { Router } from "express";
import {
    getProgress,
    updateProgress,
    submitRevision,
    markForRevision,
    getDueForRevision,
    getBookmarks,
    getPinned,
    getFavorites,
} from "../controllers/progress.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    updateProgressSchema,
    submitRevisionSchema,
    markRevisionSchema,
} from "../validators/progress.validator.js";

const router = Router();
router.use(verifyJWT);

router.get("/revision/due", getDueForRevision);
router.get("/bookmarks", getBookmarks);
router.get("/pinned", getPinned);
router.get("/favorites", getFavorites);

router.get("/:knowledgeId", getProgress);
router.patch("/:knowledgeId", validate(updateProgressSchema), updateProgress);
router.post("/:knowledgeId/revision", validate(submitRevisionSchema), submitRevision);
router.patch("/:knowledgeId/revision/mark", validate(markRevisionSchema), markForRevision);

export default router;
