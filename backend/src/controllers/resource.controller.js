import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Resource } from "../models/resource.model.js";
import { Knowledge } from "../models/knowledge.model.js";

const getResources = asyncHandler(async (req, res) => {
    const filter = { isDeleted: false };

    if (req.query.knowledge) {
        const knowledge = await Knowledge.findById(req.query.knowledge).select("resources");
        if (!knowledge) throw new ApiError(404, "Knowledge card not found");
        filter._id = { $in: knowledge.resources };
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, resources, "Resources fetched"));
});

const createResource = asyncHandler(async (req, res) => {
    const resource = await Resource.create({ ...req.body, addedBy: req.user._id });

    return res.status(201).json(new ApiResponse(201, resource, "Resource created"));
});

const updateResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findOne({ _id: req.params.id, isDeleted: false });
    if (!resource) throw new ApiError(404, "Resource not found");

    Object.assign(resource, req.body);
    await resource.save();

    return res.status(200).json(new ApiResponse(200, resource, "Resource updated"));
});

const deleteResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() }
    );
    if (!resource) throw new ApiError(404, "Resource not found");

    await Knowledge.updateMany(
        { resources: resource._id },
        { $pull: { resources: resource._id } }
    );

    return res.status(204).end();
});

export { getResources, createResource, updateResource, deleteResource };
