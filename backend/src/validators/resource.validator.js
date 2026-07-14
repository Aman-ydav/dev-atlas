import { z } from "zod";
import { RESOURCE_KINDS } from "../constants.js";

export const createResourceSchema = z.object({
    title: z.string().min(1),
    url: z.string().min(1),
    kind: z.enum(RESOURCE_KINDS),
    description: z.string().optional(),
});

export const updateResourceSchema = createResourceSchema.partial();
