import { Router } from "express";
import {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
} from "../controllers/company.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLES } from "../constants.js";
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
    verifyRole(...ADMIN_ROLES),
    validate(createCompanySchema),
    createCompany
);
router.patch(
    "/:id",
    verifyJWT,
    verifyRole(...ADMIN_ROLES),
    validate(updateCompanySchema),
    updateCompany
);
router.delete("/:id", verifyJWT, verifyRole(...ADMIN_ROLES), deleteCompany);

export default router;
