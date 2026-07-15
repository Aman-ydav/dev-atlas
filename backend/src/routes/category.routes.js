import { Router } from "express";
import {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createCategorySchema,
    updateCategorySchema,
} from "../validators/category.validator.js";

const router = Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

router.post(
    "/",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(createCategorySchema),
    createCategory
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(updateCategorySchema),
    updateCategory
);
router.delete("/:id", verifyJWT, verifyRole(...ADMIN_ROLES), deleteCategory);

export default router;
