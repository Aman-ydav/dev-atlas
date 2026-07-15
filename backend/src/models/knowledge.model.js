import mongoose, { Schema } from "mongoose";
import {
    KNOWLEDGE_TYPES,
    KNOWLEDGE_STATUS,
    DIFFICULTY_LEVELS,
    RELATION_TYPES,
    INTERVIEW_ROLES,
} from "../constants.js";

const codeExampleSchema = new Schema(
    { label: String, language: String, code: String },
    { _id: false }
);

const mistakeSchema = new Schema(
    { title: String, explanation: String },
    { _id: false }
);

const interviewQuestionSchema = new Schema(
    {
        question: String,
        idealAnswer: String,
        followUps: { type: [String], default: [] },
        commonMistakes: { type: [String], default: [] },
    },
    { _id: false }
);

const visualizationSchema = new Schema(
    {
        kind: { type: String, enum: ["none", "mermaid", "flow"], default: "none" },
        mermaidSource: { type: String, default: "" },
        flow: { type: Schema.Types.Mixed, default: null }, // React Flow { nodes, edges }
    },
    { _id: false }
);

// One ordered "chapter" of a case study — replaces the 4 fixed markdown
// slots (architectureNotes/databaseNotes/apiNotes/deploymentNotes) that
// used to live directly on ProjectKnowledge. Reuses codeExampleSchema/
// visualizationSchema as-is so VisualizationBlock/CodeExamplesList render
// a section exactly like they already render the top-level `content` field
// — no new rendering component needed. Array position is the order, same
// convention as challenges/decisions below.
const sectionSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        body: { type: String, default: "" },
        visualization: { type: visualizationSchema, default: () => ({}) },
        codeExamples: { type: [codeExampleSchema], default: [] },
    },
    { _id: false }
);

const contentSchema = new Schema(
    {
        tldr: { type: String, default: "" },
        explanation: { type: String, default: "" },
        visualization: { type: visualizationSchema, default: () => ({}) },
        codeExamples: { type: [codeExampleSchema], default: [] },
        mistakes: { type: [mistakeSchema], default: [] },
        interviewQuestions: { type: [interviewQuestionSchema], default: [] },
    },
    { _id: false }
);

const relationSchema = new Schema(
    {
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge", required: true },
        relationType: { type: String, enum: RELATION_TYPES, required: true },
    },
    { _id: false }
);

const baseOptions = {
    timestamps: true,
    discriminatorKey: "type",
};

const knowledgeSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: KNOWLEDGE_TYPES, required: true },

        category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        tags: { type: [String], default: [], index: true },

        difficulty: { type: String, enum: DIFFICULTY_LEVELS, default: "intermediate" },
        status: { type: String, enum: KNOWLEDGE_STATUS, default: "draft" },
        readTimeMinutes: { type: Number, default: 5 },

        content: { type: contentSchema, default: () => ({}) },

        resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
        attachments: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
        relations: { type: [relationSchema], default: [] },
        companies: [{ type: Schema.Types.ObjectId, ref: "Company" }],

        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },

        viewCount: { type: Number, default: 0 },

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    baseOptions
);

knowledgeSchema.index({ type: 1, status: 1, category: 1 });
knowledgeSchema.index({ companies: 1 });
knowledgeSchema.index({ "relations.knowledge": 1 });
knowledgeSchema.index(
    {
        title: "text",
        tags: "text",
        "content.tldr": "text",
        "content.explanation": "text",
    },
    {
        weights: { title: 10, tags: 5, "content.tldr": 3, "content.explanation": 1 },
        name: "knowledge_text_search",
    }
);

export const Knowledge = mongoose.model("Knowledge", knowledgeSchema);

// --- Discriminators -------------------------------------------------------

export const ConceptKnowledge = Knowledge.discriminator(
    "concept",
    new Schema({}, { _id: false })
);

export const DsaKnowledge = Knowledge.discriminator(
    "dsa",
    new Schema(
        {
            pattern: { type: String, default: "" },
            complexity: {
                time: { type: String, default: "" },
                space: { type: String, default: "" },
            },
            constraints: { type: String, default: "" },
            externalUrl: { type: String, default: "" },
            approach: { type: String, default: "" },
            hints: { type: [String], default: [] },
        },
        { _id: false }
    )
);

export const InterviewKnowledge = Knowledge.discriminator(
    "interview",
    new Schema(
        {
            role: { type: String, enum: INTERVIEW_ROLES, required: true },
            realProjectExampleRef: { type: Schema.Types.ObjectId, ref: "Knowledge" },
        },
        { _id: false }
    )
);

export const ProjectKnowledge = Knowledge.discriminator(
    "project",
    new Schema(
        {
            tagline: { type: String, default: "" },
            techStack: { type: [String], default: [] },
            repoUrl: { type: String, default: "" },
            demoUrl: { type: String, default: "" },
            sections: { type: [sectionSchema], default: [] },
            challenges: {
                type: [{ title: String, description: String, _id: false }],
                default: [],
            },
            decisions: {
                type: [
                    {
                        title: String,
                        rationale: String,
                        alternativesConsidered: String,
                        _id: false,
                    },
                ],
                default: [],
            },
            lessonsLearned: { type: [String], default: [] },
            improvements: { type: [String], default: [] },
            gallery: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
        },
        { _id: false }
    )
);
