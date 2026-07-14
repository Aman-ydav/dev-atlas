import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(1),
    parent: z.string().nullable().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
    order: z.number().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
