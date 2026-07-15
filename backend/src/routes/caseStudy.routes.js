import { Router } from "express";
import { getCaseStudyHub } from "../controllers/caseStudy.controller.js";
import { attachUserIfPresent } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", attachUserIfPresent, getCaseStudyHub);

export default router;
