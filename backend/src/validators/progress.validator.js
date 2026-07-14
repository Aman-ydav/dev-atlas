import { z } from "zod";
import { REVISION_RESULTS } from "../constants.js";

export const updateProgressSchema = z.object({
    isBookmarked: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    status: z.enum(["not_started", "in_progress", "completed"]).optional(),
    personalNotes: z.string().optional(),
    personalMistakes: z.array(z.string()).optional(),
});

export const submitRevisionSchema = z.object({
    result: z.enum(REVISION_RESULTS),
});

export const markRevisionSchema = z.object({
    marked: z.boolean(),
});
