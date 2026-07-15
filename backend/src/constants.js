export const DB_NAME = "devatlas";

// super_admin: can promote/demote users to/from admin, plus everything admin can do.
// admin: full content-management access (knowledge, categories, companies, DSA import,
//   user list/activation) but CANNOT change anyone's role.
export const USER_ROLES = ["user", "admin", "super_admin"];
export const ADMIN_ROLES = ["admin", "super_admin"];

export const OAUTH_PROVIDERS = ["google", "github"];

export const KNOWLEDGE_TYPES = ["concept", "dsa", "interview", "project"];

export const KNOWLEDGE_STATUS = ["draft", "published", "archived"];

export const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

export const RELATION_TYPES = [
    "related_to",
    "depends_on",
    "used_in",
    "implements",
    "alternative",
    "prerequisite",
    "example_of",
    "part_of",
    "referenced_by",
];

export const REVISION_RESULTS = ["forgot", "shaky", "confident"];

// "forgot" is a short relearning step (minutes, not days) so a card that
// keeps getting missed can resurface again the same session instead of
// being stuck a fixed day out no matter how many times in a row it was
// missed. "shaky" and "confident" use day-based ladders indexed by the
// level after that review, since those reflect real retention rather than
// a fresh miss.
export const REVISION_RELEARNING_MINUTES = 10;
export const REVISION_INTERVAL_DAYS = {
    shaky: [1, 2, 4, 7, 14],
    confident: [7, 14, 30, 60, 90],
};

export const INTERVIEW_ROLES = [
    "hr",
    "frontend",
    "backend",
    "javascript",
    "react",
    "database",
    "dbms",
    "sql",
    "os",
    "cn",
    "system-design",
    "project-discussion",
];

export const RESOURCE_KINDS = [
    "official_docs",
    "article",
    "blog",
    "github",
    "book",
    "video",
    "pdf",
    "research_paper",
    "cheatsheet",
];

export const RESOURCE_SOURCE_TYPES = ["link", "upload"];

export const ACTIVITY_ACTIONS = [
    "viewed",
    "created",
    "updated",
    "published",
    "bookmarked",
    "revised",
    "commented_note",
];

export const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "pink", "purple", "orange"];

export const COMMENT_MAX_DEPTH = 4; // 5 visual nesting levels: 0..4
export const COMMENT_SORTS = ["top", "newest"];
export const COMMENT_DELETED_BY = ["author", "admin"];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// backend/.env defines FRONTEND_URL (dev) and FRONTEND_URL_PROD separately.
export const FRONTEND_URL =
    process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};
