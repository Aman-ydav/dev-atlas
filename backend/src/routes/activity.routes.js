import { Router } from "express";
import { getMyActivity, getKnowledgeAuditTrail } from "../controllers/activity.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", verifyJWT, getMyActivity);
router.get("/knowledge/:id", verifyJWT, verifyRole("admin"), getKnowledgeAuditTrail);

export default router;
