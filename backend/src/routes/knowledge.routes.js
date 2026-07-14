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
import { validate } from "../middlewares/validate.middleware.js";
import {
    createKnowledgeSchema,
    updateKnowledgeSchema,
} from "../validators/knowledge.validator.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", attachUserIfPresent, getKnowledgeList);
router.get("/:slug", attachUserIfPresent, getKnowledgeBySlug);
router.get("/:slug/related", getRelatedKnowledge);

router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    validate(createKnowledgeSchema),
    createKnowledge
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    validate(updateKnowledgeSchema),
    updateKnowledge
);
router.post("/:id/publish", verifyJWT, verifyRole("admin"), publishKnowledge);
router.delete("/:id", verifyJWT, verifyRole("admin"), deleteKnowledge);

router.post(
    "/import/dsa-csv",
    verifyJWT,
    verifyRole("admin"),
    upload.single("file"),
    importDsaCsvHandler
);

export default router;
