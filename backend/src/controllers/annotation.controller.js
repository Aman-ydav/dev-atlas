import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Annotation } from "../models/annotation.model.js";

const getAnnotations = asyncHandler(async (req, res) => {
    const filter = { user: req.user._id };
    if (req.query.knowledge) filter.knowledge = req.query.knowledge;

    const annotations = await Annotation.find(filter).sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, annotations, "Annotations fetched"));
});

const createAnnotation = asyncHandler(async (req, res) => {
    const annotation = await Annotation.create({ ...req.body, user: req.user._id });

    return res.status(201).json(new ApiResponse(201, annotation, "Annotation created"));
});

const updateAnnotation = asyncHandler(async (req, res) => {
    const annotation = await Annotation.findOne({ _id: req.params.id, user: req.user._id });
    if (!annotation) throw new ApiError(404, "Annotation not found");

    Object.assign(annotation, req.body);
    await annotation.save();

    return res.status(200).json(new ApiResponse(200, annotation, "Annotation updated"));
});

const deleteAnnotation = asyncHandler(async (req, res) => {
    const annotation = await Annotation.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!annotation) throw new ApiError(404, "Annotation not found");

    return res.status(204).end();
});

export { getAnnotations, createAnnotation, updateAnnotation, deleteAnnotation };
