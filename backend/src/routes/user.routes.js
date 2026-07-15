import { Router } from "express";
import {
    updateMe,
    listUsers,
    updateUserRole,
    updateUserStatus,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
import {
    updateMeSchema,
    updateRoleSchema,
    updateStatusSchema,
} from "../validators/user.validator.js";

const router = Router();
router.use(verifyJWT);

router.patch("/me", validate(updateMeSchema), updateMe);

// Both admin and super_admin can view/activate users, but ONLY super_admin
// can change roles — that's the one thing admin is deliberately not trusted with.
router.get("/", verifyRole(...ADMIN_ROLES), listUsers);
router.patch("/:id/role", verifyRole("super_admin"), validate(updateRoleSchema), updateUserRole);
router.patch("/:id/status", verifyRole(...ADMIN_ROLES), validate(updateStatusSchema), updateUserStatus);

export default router;
