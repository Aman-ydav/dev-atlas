import { Router } from "express";
import {
    updateMe,
    listUsers,
    updateUserRole,
    updateUserStatus,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    updateMeSchema,
    updateRoleSchema,
    updateStatusSchema,
} from "../validators/user.validator.js";

const router = Router();
router.use(verifyJWT);

router.patch("/me", validate(updateMeSchema), updateMe);

router.get("/", verifyRole("admin"), listUsers);
router.patch("/:id/role", verifyRole("admin"), validate(updateRoleSchema), updateUserRole);
router.patch("/:id/status", verifyRole("admin"), validate(updateStatusSchema), updateUserStatus);

export default router;
