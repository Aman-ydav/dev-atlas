import { Router } from "express";
import {
    getLearningPaths,
    getLearningPathBySlug,
    getPathsForKnowledge,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
} from "../controllers/learningPath.controller.js";
import { verifyJWT, verifyRole, attachUserIfPresent } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createLearningPathSchema,
    updateLearningPathSchema,
} from "../validators/learningPath.validator.js";

const router = Router();

router.get("/", attachUserIfPresent, getLearningPaths);
router.get("/for-knowledge/:knowledgeId", getPathsForKnowledge);
router.get("/:slug", attachUserIfPresent, getLearningPathBySlug);

router.post(
    "/",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(createLearningPathSchema),
    createLearningPath
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(updateLearningPathSchema),
    updateLearningPath
);
router.delete("/:id", verifyJWT, verifyRole(...ADMIN_ROLES), deleteLearningPath);

export default router;
