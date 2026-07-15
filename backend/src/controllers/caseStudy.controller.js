import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Knowledge } from "../models/knowledge.model.js";
import { ADMIN_ROLES } from "../constants.js";

const isAdminUser = (user) => ADMIN_ROLES.includes(user?.role);

// getRelatedKnowledge (knowledge.controller.js) only resolves *outbound*
// relation edges off a single card — it can't answer "which case studies
// point part_of at this umbrella", since that's the inbound direction. This
// is a separate, dedicated query for exactly that: group project-type cards
// by their outbound part_of target in one round-trip, in-memory grouping.
// Deliberately unpaginated — fine at "a handful of deeply-documented case
// studies" scale; revisit if that stops being true.
const getCaseStudyHub = asyncHandler(async (req, res) => {
    const filter = { type: "project", isDeleted: false };
    if (!isAdminUser(req.user)) filter.status = "published";
    if (req.query.tags) {
        filter.tags = { $all: req.query.tags.split(",").map((t) => t.trim().toLowerCase()) };
    }

    const projects = await Knowledge.find(filter)
        .select("title slug type category difficulty tags tagline readTimeMinutes updatedAt relations")
        .populate("category", "name slug");

    const byId = new Map(projects.map((p) => [String(p._id), p]));
    const umbrellaOf = new Map();
    for (const p of projects) {
        const partOf = p.relations.find((r) => r.relationType === "part_of" && byId.has(String(r.knowledge)));
        if (partOf) umbrellaOf.set(String(p._id), String(partOf.knowledge));
    }

    const umbrellaIds = new Set(umbrellaOf.values());
    const groups = [...umbrellaIds].map((uid) => ({
        umbrella: byId.get(uid),
        members: projects.filter((p) => umbrellaOf.get(String(p._id)) === uid),
    }));

    const grouped = new Set([...umbrellaIds, ...umbrellaOf.keys()]);
    const standalone = projects.filter((p) => !grouped.has(String(p._id)));

    return res.status(200).json(new ApiResponse(200, { groups, standalone }, "Case study hub fetched"));
});

export { getCaseStudyHub };
