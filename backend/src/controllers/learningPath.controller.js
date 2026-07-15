import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { LearningPath } from "../models/learningPath.model.js";
import { UserProgress } from "../models/userProgress.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { evenlySpacedKeys } from "../utils/fractionalIndex.js";
import { ADMIN_ROLES } from "../constants.js";

const isAdminUser = (user) => ADMIN_ROLES.includes(user?.role);

const STEP_KNOWLEDGE_FIELDS = "title slug type difficulty readTimeMinutes";

const sortedSteps = (path) =>
    [...path.steps].sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));

const getLearningPaths = asyncHandler(async (req, res) => {
    const filter = { isDeleted: false };
    if (!isAdminUser(req.user)) filter.published = true;
    if (req.query.category) filter.category = req.query.category;

    const paths = await LearningPath.find(filter)
        .select("title slug description category published steps")
        .populate("category", "name slug")
        .sort({ createdAt: -1 });

    const list = paths.map((p) => ({
        _id: p._id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        published: p.published,
        stepCount: p.steps.length,
    }));

    return res.status(200).json(new ApiResponse(200, list, "Learning paths fetched"));
});

// Path overview page: every step, ordered, with this user's progress status
// merged in (never used to lock anything — see PathStrip/LearningPathDetailPage,
// completion is a checkmark, not a gate). One populate + one progress query,
// not N+1 — same "aggregate in one round-trip" pattern as dashboard.controller.js.
const getLearningPathBySlug = asyncHandler(async (req, res) => {
    const path = await LearningPath.findOne({ slug: req.params.slug, isDeleted: false })
        .populate("category", "name slug")
        .populate({ path: "steps.knowledge", select: STEP_KNOWLEDGE_FIELDS });

    if (!path) throw new ApiError(404, "Learning path not found");
    if (!path.published && !isAdminUser(req.user)) throw new ApiError(404, "Learning path not found");

    const steps = sortedSteps(path);

    let progressByKnowledge = new Map();
    if (req.user) {
        const knowledgeIds = steps.map((s) => s.knowledge?._id).filter(Boolean);
        const progress = await UserProgress.find({
            user: req.user._id,
            knowledge: { $in: knowledgeIds },
        }).select("knowledge status");
        progressByKnowledge = new Map(progress.map((p) => [String(p.knowledge), p.status]));
    }

    const stepsWithStatus = steps.map((s) => ({
        _id: s._id,
        knowledge: s.knowledge,
        optional: s.optional,
        status: s.knowledge ? progressByKnowledge.get(String(s.knowledge._id)) || "not_started" : "not_started",
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                _id: path._id,
                title: path.title,
                slug: path.slug,
                description: path.description,
                category: path.category,
                published: path.published,
                steps: stepsWithStatus,
            },
            "Learning path fetched"
        )
    );
});

// Backs the KnowledgeDetailPage path-strip: "which path(s) is this card
// part of, and what's prev/next" — computed here so the frontend never has
// to search a steps array itself.
const getPathsForKnowledge = asyncHandler(async (req, res) => {
    const { knowledgeId } = req.params;
    const paths = await LearningPath.find({
        "steps.knowledge": knowledgeId,
        published: true,
        isDeleted: false,
    })
        .select("title slug steps")
        .populate({ path: "steps.knowledge", select: "title slug" });

    const result = paths.map((path) => {
        const steps = sortedSteps(path);
        const index = steps.findIndex((s) => String(s.knowledge?._id) === String(knowledgeId));
        return {
            path: { title: path.title, slug: path.slug },
            position: index + 1,
            total: steps.length,
            prev: index > 0 ? steps[index - 1].knowledge : null,
            next: index < steps.length - 1 ? steps[index + 1].knowledge : null,
        };
    });

    return res.status(200).json(new ApiResponse(200, result, "Paths for knowledge fetched"));
});

// A duplicate card in one path corrupts the rendered "Step N of M" / prev-next
// UI, unlike a duplicate relation elsewhere in this app which is just data
// hygiene — so this is the one place worth an explicit reject beyond the
// existing precedent. `order` is never client-input (see the validator) —
// always recomputed here from final array position.
const assignStepOrder = (steps = []) => {
    const seen = new Set();
    for (const step of steps) {
        if (seen.has(step.knowledge)) {
            throw new ApiError(400, "A learning path cannot include the same card twice");
        }
        seen.add(step.knowledge);
    }
    const orders = evenlySpacedKeys(steps.length);
    return steps.map((step, i) => ({ ...step, order: orders[i] }));
};

const createLearningPath = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(LearningPath, req.body.title);

    const path = await LearningPath.create({
        ...req.body,
        steps: assignStepOrder(req.body.steps),
        slug,
        author: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, path, "Learning path created"));
});

const updateLearningPath = asyncHandler(async (req, res) => {
    const path = await LearningPath.findOne({ _id: req.params.id, isDeleted: false });
    if (!path) throw new ApiError(404, "Learning path not found");

    if (req.body.title && req.body.title !== path.title) {
        path.slug = await generateUniqueSlug(LearningPath, req.body.title, path._id);
        path.title = req.body.title;
    }

    const { title, steps, ...rest } = req.body;
    Object.assign(path, rest);
    if (steps !== undefined) path.steps = assignStepOrder(steps);
    path.lastEditedBy = req.user._id;

    await path.save();

    return res.status(200).json(new ApiResponse(200, path, "Learning path updated"));
});

const deleteLearningPath = asyncHandler(async (req, res) => {
    const path = await LearningPath.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() }
    );
    if (!path) throw new ApiError(404, "Learning path not found");

    return res.status(204).end();
});

export {
    getLearningPaths,
    getLearningPathBySlug,
    getPathsForKnowledge,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath,
};
