import { z } from "zod";
import { HIGHLIGHT_COLORS } from "../constants.js";

export const createAnnotationSchema = z.object({
    knowledge: z.string().min(1),
    block: z.enum(["tldr", "explanation"]),
    quote: z.string().min(1),
    startOffset: z.number().nullable().optional(),
    endOffset: z.number().nullable().optional(),
    color: z.enum(HIGHLIGHT_COLORS).optional(),
    note: z.string().optional(),
});

export const updateAnnotationSchema = z.object({
    color: z.enum(HIGHLIGHT_COLORS).optional(),
    note: z.string().optional(),
});
