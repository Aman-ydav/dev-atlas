import { Router } from "express";
import { createAttachment, deleteAttachment } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", verifyJWT, upload.single("file"), createAttachment);
router.delete("/:id", verifyJWT, deleteAttachment);

export default router;
