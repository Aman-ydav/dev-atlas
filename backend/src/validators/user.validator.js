import { z } from "zod";
import { USER_ROLES } from "../constants.js";

export const updateMeSchema = z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional(),
    headline: z.string().optional(),
    avatarUrl: z.string().optional(),
    socialLinks: z
        .object({
            github: z.string().optional(),
            linkedin: z.string().optional(),
            twitter: z.string().optional(),
            website: z.string().optional(),
        })
        .optional(),
});

export const updateRoleSchema = z.object({ role: z.enum(USER_ROLES) });
export const updateStatusSchema = z.object({ isActive: z.boolean() });
