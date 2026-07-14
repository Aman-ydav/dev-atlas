import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Knowledge } from "../models/knowledge.model.js";
import { Activity } from "../models/activity.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";
import { parsePagination, buildPaginatedResponse } from "../utils/pagination.js";
import { importDsaCsv } from "../services/csvImport.service.js";

const SUMMARY_FIELDS =
    "title slug type category difficulty tags readTimeMinutes updatedAt viewCount pattern role tagline companies";

const buildFilter = (query, user) => {
    const filter = { isDeleted: false };

    if (user?.role === "admin" && query.status) {
        filter.status = query.status;
    } else {
        filter.status = "published";
    }

    if (query.type) {
        const types = Array.isArray(query.type) ? query.type : query.type.split(",");
        filter.type = { $in: types };
    }
    if (query.category) filter.category = query.category;
    if (query.difficulty) filter.difficulty = query.difficulty;
    if (query.tags) {
        const tags = query.tags.split(",").map((t) => t.trim().toLowerCase());
        filter.tags = { $all: tags };
    }
    if (query.company) filter.companies = query.company;
    if (query.pattern) filter.pattern = query.pattern;

    return filter;
};

const getKnowledgeList = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildFilter(req.query, req.user);
    const sort = req.query.sort || "-createdAt";

    const [items, total] = await Promise.all([
        Knowledge.find(filter)
            .select(SUMMARY_FIELDS)
            .populate("category", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Knowledge.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                buildPaginatedResponse(items, total, page, limit),
                "Knowledge cards fetched"
            )
        );
});

const getKnowledgeBySlug = asyncHandler(async (req, res) => {
    const knowledge = await Knowledge.findOne({
        slug: req.params.slug,
        isDeleted: false,
    })
        .populate("category", "name slug")
        .populate("resources")
        .populate("attachments")
        .populate("companies", "name slug logoUrl")
        .populate("author", "name avatarUrl");

    if (!knowledge) throw new ApiError(404, "Knowledge card not found");

    const isOwnerAdmin = req.user?.role === "admin";
    if (knowledge.status !== "published" && !isOwnerAdmin) {
        throw new ApiError(404, "Knowledge card not found");
    }

    Knowledge.updateOne({ _id: knowledge._id }, { $inc: { viewCount: 1 } }).catch(() => {});
    if (req.user) {
        Activity.create({
            user: req.user._id,
            action: "viewed",
            knowledge: knowledge._id,
        }).catch(() => {});
    }

    return res
        .status(200)
        .json(new ApiResponse(200, knowledge, "Knowledge card fetched"));
});

const getRelatedKnowledge = asyncHandler(async (req, res) => {
    const knowledge = await Knowledge.findOne({
        slug: req.params.slug,
        isDeleted: false,
    }).select("relations");
    if (!knowledge) throw new ApiError(404, "Knowledge card not found");

    const ids = knowledge.relations.map((r) => r.knowledge);
    const related = await Knowledge.find({
        _id: { $in: ids },
        status: "published",
        isDeleted: false,
    }).select(SUMMARY_FIELDS);

    const relatedById = new Map(related.map((r) => [String(r._id), r]));
    const grouped = {};
    for (const rel of knowledge.relations) {
        const card = relatedById.get(String(rel.knowledge));
        if (!card) continue;
        grouped[rel.relationType] = grouped[rel.relationType] || [];
        grouped[rel.relationType].push(card);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, grouped, "Related knowledge fetched"));
});

const TYPE_FIELD_WHITELIST = {
    dsa: ["pattern", "complexity", "constraints", "externalUrl", "approach", "hints"],
    interview: ["role", "realProjectExampleRef"],
    project: [
        "tagline", "techStack", "repoUrl", "demoUrl", "architectureNotes",
        "databaseNotes", "apiNotes", "deploymentNotes", "challenges", "decisions",
        "lessonsLearned", "improvements", "gallery",
    ],
    concept: [],
};

const pickTypeFields = (type, body) => {
    const picked = {};
    for (const field of TYPE_FIELD_WHITELIST[type] || []) {
        if (body[field] !== undefined) picked[field] = body[field];
    }
    return picked;
};

const BASE_FIELDS = [
    "title", "category", "tags", "difficulty", "status", "readTimeMinutes",
    "content", "resources", "attachments", "relations", "companies",
];

const pickBaseFields = (body) => {
    const picked = {};
    for (const field of BASE_FIELDS) {
        if (body[field] !== undefined) picked[field] = body[field];
    }
    return picked;
};

const createKnowledge = asyncHandler(async (req, res) => {
    const { type } = req.body;
    const slug = await generateUniqueSlug(Knowledge, req.body.title);

    const doc = await Knowledge.create({
        ...pickBaseFields(req.body),
        ...pickTypeFields(type, req.body),
        type,
        slug,
        author: req.user._id,
    });

    await Activity.create({ user: req.user._id, action: "created", knowledge: doc._id });

    return res.status(201).json(new ApiResponse(201, doc, "Knowledge card created"));
});

const updateKnowledge = asyncHandler(async (req, res) => {
    const knowledge = await Knowledge.findOne({ _id: req.params.id, isDeleted: false });
    if (!knowledge) throw new ApiError(404, "Knowledge card not found");

    if (req.body.title && req.body.title !== knowledge.title) {
        if (knowledge.status === "published") {
            throw new ApiError(409, "Cannot change the title/slug of a published card");
        }
        knowledge.slug = await generateUniqueSlug(Knowledge, req.body.title, knowledge._id);
        knowledge.title = req.body.title;
    }

    Object.assign(knowledge, pickBaseFields(req.body));
    Object.assign(knowledge, pickTypeFields(knowledge.type, req.body));
    knowledge.lastEditedBy = req.user._id;

    await knowledge.save();
    await Activity.create({ user: req.user._id, action: "updated", knowledge: knowledge._id });

    return res.status(200).json(new ApiResponse(200, knowledge, "Knowledge card updated"));
});

const publishKnowledge = asyncHandler(async (req, res) => {
    const knowledge = await Knowledge.findOne({ _id: req.params.id, isDeleted: false });
    if (!knowledge) throw new ApiError(404, "Knowledge card not found");

    knowledge.status = "published";
    await knowledge.save();
    await Activity.create({ user: req.user._id, action: "published", knowledge: knowledge._id });

    return res.status(200).json(new ApiResponse(200, knowledge, "Knowledge card published"));
});

const deleteKnowledge = asyncHandler(async (req, res) => {
    const knowledge = await Knowledge.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() }
    );
    if (!knowledge) throw new ApiError(404, "Knowledge card not found");

    return res.status(204).end();
});

const importDsaCsvHandler = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "CSV file is required");

    const report = await importDsaCsv(req.file.path, req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, report, "DSA CSV import complete"));
});

export {
    getKnowledgeList,
    getKnowledgeBySlug,
    getRelatedKnowledge,
    createKnowledge,
    updateKnowledge,
    publishKnowledge,
    deleteKnowledge,
    importDsaCsvHandler,
};
