import { Router } from "express";
import {
    getKnowledgeList,
    getKnowledgeBySlug,
    getRelatedKnowledge,
    createKnowledge,
    updateKnowledge,
    publishKnowledge,
    deleteKnowledge,
    importDsaCsvHandler,
} from "../controllers/knowledge.controller.js";
import { verifyJWT, verifyRole, attachUserIfPresent } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createKnowledgeSchema,
    updateKnowledgeSchema,
} from "../validators/knowledge.validator.js";
import { uploadCsv } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", attachUserIfPresent, getKnowledgeList);
router.get("/:slug", attachUserIfPresent, getKnowledgeBySlug);
router.get("/:slug/related", getRelatedKnowledge);

router.post(
    "/",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(createKnowledgeSchema),
    createKnowledge
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(updateKnowledgeSchema),
    updateKnowledge
);
router.post("/:id/publish", verifyJWT, verifyRole(...ADMIN_ROLES), publishKnowledge);
router.delete("/:id", verifyJWT, verifyRole(...ADMIN_ROLES), deleteKnowledge);

router.post(
    "/import/dsa-csv",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    uploadCsv.single("file"),
    importDsaCsvHandler
);

export default router;
