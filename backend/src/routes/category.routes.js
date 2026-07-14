import { Router } from "express";
import {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
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
    verifyRole("admin"),
    validate(createCategorySchema),
    createCategory
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    validate(updateCategorySchema),
    updateCategory
);
router.delete("/:id", verifyJWT, verifyRole("admin"), deleteCategory);

export default router;
