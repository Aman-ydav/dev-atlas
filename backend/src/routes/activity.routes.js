import { Router } from "express";
import { getMyActivity, getKnowledgeAuditTrail } from "../controllers/activity.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";

const router = Router();

router.get("/me", verifyJWT, getMyActivity);
router.get("/knowledge/:id", verifyJWT, verifyRole(...ADMIN_ROLES), getKnowledgeAuditTrail);

export default router;
