import { Router } from "express";
import { verifyJWT, attachUserIfPresent } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createCommentSchema,
    updateCommentSchema,
    voteCommentSchema,
    flagCommentSchema,
} from "../validators/comment.validator.js";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    flagComment,
} from "../controllers/comment.controller.js";

const router = Router();

// Public GET, per-route auth on writes (not a blanket router.use(verifyJWT))
// — unlike annotations/progress (100% private), comments must stay
// publicly readable by logged-out visitors.
router.get("/", attachUserIfPresent, getComments);
router.post("/", verifyJWT, validate(createCommentSchema), createComment);
router.patch("/:id", verifyJWT, validate(updateCommentSchema), updateComment);
router.delete("/:id", verifyJWT, deleteComment);
router.post("/:id/vote", verifyJWT, validate(voteCommentSchema), voteComment);
router.post("/:id/flag", verifyJWT, validate(flagCommentSchema), flagComment);

export default router;
