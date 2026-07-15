import { z } from "zod";

// `order` is deliberately not client-input — the controller assigns fresh
// fractional keys server-side from array position on every save, so the
// admin editor never has to reason about the ordering scheme at all.
const stepSchema = z.object({
    knowledge: z.string().min(1),
    optional: z.boolean().optional(),
});

const baseLearningPathFields = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    steps: z.array(stepSchema).optional(),
    published: z.boolean().optional(),
});

export const createLearningPathSchema = baseLearningPathFields;
export const updateLearningPathSchema = baseLearningPathFields.partial();
