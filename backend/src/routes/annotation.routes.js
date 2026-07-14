import { Router } from "express";
import {
    getAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
} from "../controllers/annotation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createAnnotationSchema,
    updateAnnotationSchema,
} from "../validators/annotation.validator.js";

const router = Router();
router.use(verifyJWT);

router.get("/", getAnnotations);
router.post("/", validate(createAnnotationSchema), createAnnotation);
router.patch("/:id", validate(updateAnnotationSchema), updateAnnotation);
router.delete("/:id", deleteAnnotation);

export default router;
