import { Router } from "express";
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
} from "../controllers/company.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createCompanySchema,
    updateCompanySchema,
} from "../validators/company.validator.js";

const router = Router();

router.get("/", getCompanies);
router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    validate(createCompanySchema),
    createCompany
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    validate(updateCompanySchema),
    updateCompany
);
router.delete("/:id", verifyJWT, verifyRole("admin"), deleteCompany);

export default router;
