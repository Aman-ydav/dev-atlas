import { z } from "zod";
import {
    KNOWLEDGE_TYPES,
    KNOWLEDGE_STATUS,
    DIFFICULTY_LEVELS,
    RELATION_TYPES,
    INTERVIEW_ROLES,
} from "../constants.js";

const codeExampleSchema = z.object({
    label: z.string().optional(),
    language: z.string().optional(),
    code: z.string().optional(),
});

const mistakeSchema = z.object({
    title: z.string().optional(),
    explanation: z.string().optional(),
});

const interviewQuestionSchema = z.object({
    question: z.string().optional(),
    idealAnswer: z.string().optional(),
    followUps: z.array(z.string()).optional(),
    commonMistakes: z.array(z.string()).optional(),
});

const visualizationSchema = z.object({
    kind: z.enum(["none", "mermaid", "flow"]).optional(),
    mermaidSource: z.string().optional(),
    flow: z.any().optional(),
});

const contentSchema = z.object({
    tldr: z.string().optional(),
    explanation: z.string().optional(),
    visualization: visualizationSchema.optional(),
    codeExamples: z.array(codeExampleSchema).optional(),
    mistakes: z.array(mistakeSchema).optional(),
    interviewQuestions: z.array(interviewQuestionSchema).optional(),
});

const relationSchema = z.object({
    knowledge: z.string(),
    relationType: z.enum(RELATION_TYPES),
});

// Base fields shared by every type, plus every discriminator's fields as
// optional — the controller only persists the ones relevant to `type`.
export const createKnowledgeSchema = z.object({
    title: z.string().min(1),
    type: z.enum(KNOWLEDGE_TYPES),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
    status: z.enum(KNOWLEDGE_STATUS).optional(),
    readTimeMinutes: z.number().optional(),
    content: contentSchema.optional(),
    resources: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
    relations: z.array(relationSchema).optional(),
    companies: z.array(z.string()).optional(),

    // dsa
    pattern: z.string().optional(),
    complexity: z.object({ time: z.string().optional(), space: z.string().optional() }).optional(),
    constraints: z.string().optional(),
    externalUrl: z.string().optional(),
    approach: z.string().optional(),
    hints: z.array(z.string()).optional(),

    // interview
    role: z.enum(INTERVIEW_ROLES).optional(),
    realProjectExampleRef: z.string().optional(),

    // project
    tagline: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    repoUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    architectureNotes: z.string().optional(),
    databaseNotes: z.string().optional(),
    apiNotes: z.string().optional(),
    deploymentNotes: z.string().optional(),
    challenges: z.array(z.object({ title: z.string().optional(), description: z.string().optional() })).optional(),
    decisions: z
        .array(
            z.object({
                title: z.string().optional(),
                rationale: z.string().optional(),
                alternativesConsidered: z.string().optional(),
            })
        )
        .optional(),
    lessonsLearned: z.array(z.string()).optional(),
    improvements: z.array(z.string()).optional(),
    gallery: z.array(z.string()).optional(),
});

// `type` is immutable after create — omit it from updates.
export const updateKnowledgeSchema = createKnowledgeSchema
    .omit({ type: true })
    .partial();
