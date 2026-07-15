import { z } from "zod";

export const createCommentSchema = z.object({
    knowledge: z.string().min(1),
    parent: z.string().optional(),
    body: z.string().min(1).max(10000),
});

export const updateCommentSchema = z.object({
    body: z.string().min(1).max(10000),
});

export const voteCommentSchema = z.object({
    value: z.union([z.literal(1), z.literal(-1)]),
});

export const flagCommentSchema = z.object({
    reason: z.string().max(500).optional(),
});
