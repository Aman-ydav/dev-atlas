import { z } from "zod";
import { RESOURCE_KINDS, RESOURCE_SOURCE_TYPES } from "../constants.js";

// Base fields as a plain object (not the refined schema below) so
// updateResourceSchema can still call .partial() on it — ZodEffects
// (what .superRefine() returns) has no .partial() method.
const baseResourceFields = z.object({
    title: z.string().min(1),
    url: z.string().min(1).optional(),
    kind: z.enum(RESOURCE_KINDS),
    description: z.string().optional(),
    sourceType: z.enum(RESOURCE_SOURCE_TYPES).default("link"),
    attachment: z.string().optional(),
});

export const createResourceSchema = baseResourceFields.superRefine((data, ctx) => {
    if (data.sourceType === "link" && !data.url?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "url is required for link resources" });
    }
    if (data.sourceType === "upload" && !data.attachment) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["attachment"], message: "attachment is required for upload resources" });
    }
});

export const updateResourceSchema = baseResourceFields.partial();
