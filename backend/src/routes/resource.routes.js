import { Router } from "express";
import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
} from "../controllers/resource.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createResourceSchema,
    updateResourceSchema,
} from "../validators/resource.validator.js";

const router = Router();

router.get("/", getResources);
router.post(
    "/",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(createResourceSchema),
    createResource
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(updateResourceSchema),
    updateResource
);
router.delete("/:id", verifyJWT, verifyRole(...ADMIN_ROLES), deleteResource);

export default router;
