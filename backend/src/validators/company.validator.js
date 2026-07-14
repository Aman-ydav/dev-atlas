import { z } from "zod";

export const createCompanySchema = z.object({
    name: z.string().min(1),
    logoUrl: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
