# 06 — Database Design (MongoDB / Mongoose)

> Authoritative schema contract. Backend models under `backend/src/models` implement this document exactly. If code and this doc ever disagree, this doc wins until deliberately revised (update this file in the same PR as any schema change).

## 0. Design principles

1. **One engine, one core collection.** Every learnable "thing" — a concept, a DSA question, an interview topic, a project case study — is a document in the `knowledges` collection, differentiated by a Mongoose **discriminator** on `type`. This is [[ADR-0001]] in `20-adr.md`. It's what makes cross-type Search, Relations, and the Revision queue trivial: they all query one collection.
2. **Canonical content vs. personal state are different collections, on purpose.** A `Knowledge` doc is shared, admin-authored, versioned content. What a *specific user* thinks/feels about it (bookmarked? notes? due for revision?) is per-(user, card) state and must never touch the canonical doc — otherwise every personal action becomes a write-contention hazard on shared content and canonical history gets polluted with personal edits. See `userprogress` below and [[ADR-0002]].
3. **Soft delete everywhere content is admin-curated.** `isDeleted` + `deletedAt` on `Category`, `Knowledge`, `Company`, `Resource`. Hard delete only for purely personal, low-stakes data (`Annotation`).
4. **Every collection gets `timestamps: true`.** `createdAt`/`updatedAt` are load-bearing for "Recently Updated", "Continue Learning", and audit trails — don't hand-roll them.
5. **Slugs, not just ObjectIds, for anything URL-addressable** (`Category`, `Knowledge`, `Company`). Slugs are generated server-side from `title` on create, unique, immutable after first publish (changing a slug breaks bookmarks/links).

---

## 1. Collections overview

| Collection | Purpose | Discriminated? |
|---|---|---|
| `users` | Account, OAuth identities, role | no |
| `categories` | Explore taxonomy (self-referencing) | no |
| `companies` | DSA/interview company tags (Google, Amazon, ...) | no |
| `knowledges` | THE Knowledge Card — base schema | yes → `concept`, `dsa`, `interview`, `project` |
| `userprogresses` | Per-user state on a card: bookmark/favorite/pin/note/revision | no |
| `annotations` | Per-user text highlights on a card's rendered content | no |
| `resources` | External learning resources (docs, articles, videos, books) | no |
| `attachments` | Uploaded media (Cloudinary refs) | no |
| `activities` | Lightweight audit/activity feed (admin edits, user views) | no |

Nine collections total. No junction/pivot collections — many-to-many relationships (Knowledge↔Company, Knowledge↔Resource, Knowledge↔Knowledge relations) are modeled as embedded reference arrays on the owning side (see §3.3), since DevAtlas reads relationships far more often than it needs to query them from the "other" direction at scale, and array-of-refs keeps the common read path (render one card, populate its refs) to a single query.

---

## 2. `User`

```js
{
  name: String,              // required, from OAuth profile
  email: String,             // required, unique, lowercase — from OAuth profile
  avatarUrl: String,         // from OAuth profile (Google/GitHub photo)
  role: { type: String, enum: ["user", "admin", "super_admin"], default: "user" },

  providers: [{
    _id: false,
    provider: { type: String, enum: ["google", "github"], required: true },
    providerId: { type: String, required: true },   // sub (Google) / id (GitHub)
  }],
  // compound unique index on providers.provider + providers.providerId (see §4)
  // a user can link BOTH google and github to the same account (matched by email)

  refreshTokenHash: String,  // sha256 of current refresh token; null when logged out. Rotated every refresh.

  bio: String,
  headline: String,          // e.g. "Backend Engineer · Node · Distributed Systems"
  socialLinks: {
    _id: false,
    github: String, linkedin: String, twitter: String, website: String,
  },

  isActive: { type: Boolean, default: true },  // admin can deactivate; false blocks login
  lastLoginAt: Date,
}
// timestamps: true
```

**Why no password field, ever:** auth is OAuth-only by product decision ([[ADR-0003]]); a password field would be dead weight and a future misuse temptation.

**Why `providers` is an array, not two top-level fields (`googleId`/`githubId`):** the reference UX explicitly allows "log in through Google **or** GitHub" for the *same* person — modeling providers as an array keyed by (provider, providerId) lets the login controller do `find-by-provider-match OR match-by-email-then-link` cleanly, and extending to a third provider later needs zero schema migration.

**The three roles:**

| Role | Content management (knowledge, categories, companies, DSA import) | View/activate users | Change roles |
|---|---|---|---|
| `user` | no | no | no |
| `admin` | yes | yes | **no** |
| `super_admin` | yes | yes | yes |

`admin` has every content-authoring capability but deliberately cannot promote/demote anyone — only `super_admin` can. There is no UI/API path to self-serve `super_admin`: whoever signs in (via Google or GitHub) with the email in the `SUPER_ADMIN_EMAIL` env var is auto-promoted to `super_admin` on login (`backend/src/config/passport.js`), and stays reconciled to that role on every subsequent login even if it was manually changed. This is the recovery mechanism for the "last super_admin locked themselves out" failure mode instead of a DB-level safeguard.

---

## 3. `Category`

```js
{
  name: String,            // "JavaScript"
  slug: String,            // "javascript" — unique
  parent: { type: ObjectId, ref: "Category", default: null }, // null = top-level
  icon: String,             // lucide icon name, e.g. "braces"
  description: String,
  order: { type: Number, default: 0 },   // manual sort weight within siblings
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}
// timestamps: true
```

Top-level seed set (matches IA in `04-information-architecture.md`): Frontend, Backend, DSA, Database, Operating System, Computer Networks, AI/ML, System Design, Projects, Interview, Misc. `parent: null` for these; everything else (e.g. "Closures" under "JavaScript" under "Frontend") is a descendant. Depth is not artificially capped in the schema, but the UI only actively surfaces 2 levels (Category → SubCategory) per the reference IA — deeper nesting is a schema affordance for growth, not a v1 UI requirement.

---

## 4. `Knowledge` (base schema + discriminators) — the core entity

### 4.1 Base schema (shared by all four types)

```js
{
  title: String,             // required
  slug: String,               // required, unique, generated from title, immutable post-publish
  type: {                     // DISCRIMINATOR KEY
    type: String,
    enum: ["concept", "dsa", "interview", "project"],
    required: true,
  },

  category: { type: ObjectId, ref: "Category", required: true },
  tags: [String],              // free-form, lowercased, e.g. ["async", "microtask-queue"]

  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "intermediate" },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  readTimeMinutes: { type: Number, default: 5 },   // shown in header; auto-estimated from content length, admin-overridable

  content: {
    _id: false,
    tldr: String,                          // markdown, short
    explanation: String,                    // markdown, the deep-dive body
    visualization: {
      _id: false,
      kind: { type: String, enum: ["none", "mermaid", "flow"], default: "none" },
      mermaidSource: String,                 // when kind === "mermaid"
      flow: { type: mongoose.Schema.Types.Mixed, default: null },  // React Flow { nodes:[], edges:[] } JSON, when kind === "flow"
    },
    codeExamples: [{
      _id: false,
      label: String,             // "Basic usage"
      language: String,          // "javascript"
      code: String,
    }],
    mistakes: [{
      _id: false,
      title: String,             // "Forgetting Promise.all rejects on first failure"
      explanation: String,       // markdown
    }],
    interviewQuestions: [{
      _id: false,
      question: String,
      idealAnswer: String,        // markdown
      followUps: [String],
      commonMistakes: [String],
    }],
  },

  resources: [{ type: ObjectId, ref: "Resource" }],
  attachments: [{ type: ObjectId, ref: "Attachment" }],

  relations: [{
    _id: false,
    knowledge: { type: ObjectId, ref: "Knowledge", required: true },
    relationType: {
      type: String,
      enum: ["related_to", "depends_on", "used_in", "implements", "alternative",
             "prerequisite", "example_of", "part_of", "referenced_by"],
      required: true,
    },
  }],

  companies: [{ type: ObjectId, ref: "Company" }],   // relevant mainly to dsa/interview, allowed on any type

  author: { type: ObjectId, ref: "User", required: true },   // admin who created it
  lastEditedBy: { type: ObjectId, ref: "User" },

  viewCount: { type: Number, default: 0 },

  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}
// timestamps: true
// discriminatorKey: "type"
```

### 4.2 Discriminator: `concept` (default learning topic — Promise, JWT, Normalization, ...)

No extra fields beyond base. `concept` is the "plain" Knowledge Card; everything it needs is already in the base schema. Modeled as an explicit discriminator anyway (not just "omit type-specific fields") so `Knowledge.discriminators.concept` stays queryable/typed symmetrically with the other three.

### 4.3 Discriminator: `dsa`

```js
{
  pattern: String,                 // "Two Pointers", "Sliding Window", "Morris Traversal"
  complexity: {
    _id: false,
    time: String,                  // "O(n)"
    space: String,                 // "O(1)"
  },
  constraints: String,
  externalUrl: String,             // LeetCode/GFG link, optional
  approach: String,                // markdown — admin's canonical approach (NOT a spoiler solution by default; see 4.3.1)
  hints: [String],
}
```

**4.3.1 — "No solution by default"**: the reference spec is explicit that a DSA question page should not dump code first. `approach` is written to be pattern/strategy-level prose; a full solution, if included at all, lives in `content.codeExamples` and the API/UI intentionally gate it behind a "Show Solution" interaction rather than rendering it inline — this is a UX contract documented in `13-ux-flows.md`, not a schema one, since the schema doesn't need a boolean for it (revealing is a client-side interaction, not stored state).

### 4.4 Discriminator: `interview`

```js
{
  role: {
    type: String,
    enum: ["hr", "frontend", "backend", "javascript", "react", "database",
           "dbms", "sql", "os", "cn", "system-design", "project-discussion"],
    required: true,
  },
  realProjectExampleRef: { type: ObjectId, ref: "Knowledge" },  // link to a project card, e.g. JWT → Roomezy
}
```

Note the base schema's `content.interviewQuestions[]` already carries question/idealAnswer/followUps/mistakes — the `interview` type doesn't duplicate that structure, it exists so pure interview-prep topics (e.g. "Tell me about yourself", "System Design: rate limiter") that aren't tied to a `concept` card still have a home with the same one-page layout.

### 4.5 Discriminator: `project` (engineering case study)

```js
{
  tagline: String,                    // "Real-time roommate matching platform"
  techStack: [String],
  repoUrl: String,
  demoUrl: String,
  architectureNotes: String,           // markdown
  databaseNotes: String,               // markdown
  apiNotes: String,                    // markdown
  deploymentNotes: String,             // markdown
  challenges: [{
    _id: false, title: String, description: String,   // markdown
  }],
  decisions: [{
    _id: false, title: String, rationale: String, alternativesConsidered: String,
  }],
  lessonsLearned: [String],
  improvements: [String],              // "what I'd do differently"
  gallery: [{ type: ObjectId, ref: "Attachment" }],
}
```

Each case-study block (Architecture, Database, Auth, ...) is prose that cross-links into `relations[]` pointing at the matching `concept` cards (Roomezy's "Authentication" section → `relations: [{ knowledge: <JWT card>, relationType: "used_in" }]`) — that's the mechanism that makes "click Authentication → JWT page opens" work without a bespoke link system.

---

## 5. `UserProgress` — personal state per (user, card)

```js
{
  user: { type: ObjectId, ref: "User", required: true },
  knowledge: { type: ObjectId, ref: "Knowledge", required: true },

  isBookmarked: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },

  status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
  personalNotes: String,          // markdown, private to this user
  personalMistakes: [String],     // "things I got wrong", private

  revision: {
    _id: false,
    isMarkedForRevision: { type: Boolean, default: false },
    level: { type: Number, default: 0 },        // 0..4, drives re-queue interval — see below
    lastRevisedAt: Date,
    nextRevisionAt: Date,
    history: [{
      _id: false,
      at: { type: Date, required: true },
      result: { type: String, enum: ["forgot", "shaky", "confident"], required: true },
    }],
  },
}
// timestamps: true
// UNIQUE COMPOUND INDEX: { user: 1, knowledge: 1 }
```

**Revision level → interval mapping** (simple leveled re-queue, deliberately not full SM-2 — see `18-future-roadmap.md` §9):

| Result | Level change | Next revision interval |
|---|---|---|
| `forgot` | reset to `level = 0` | +10 minutes (short relearning step) |
| `shaky` | `level = max(level-1, 0)` | +1, 2, 4, 7, 14 days by (post-decrement) level |
| `confident` | `level = min(level+1, 4)` | +7, 14, 30, 60, 90 days by (post-increment) level |

The first shipped version scheduled every `forgot` a flat 1 day out regardless of how many times in a row a card was missed, so a repeatedly-failed card could never resurface again the same day — pressing "forgot" 10 times in a row produced the same result as pressing it once. `forgot` now uses a short, level-independent relearning step (minutes, not days) instead, so a card you just failed can come back for another attempt in the same session. `shaky` picked up the same level-indexed ladder `confident` already had, for the same reason — it was previously a flat 3 days regardless of level.

This directly implements the reference behavior: "80 of 100 done, 20 remaining stuck → second revision pass targets only the 20 still due", because `nextRevisionAt <= now` is the sole query predicate for "what's due" — items marked `confident` simply fall out of the due set until their (growing) interval elapses. When the due set is empty, `GET /progress/revision/due` also returns a `nextUp: { at, count }` field (soonest upcoming `nextRevisionAt` across marked cards, and how many are queued) so the UI can say "you're caught up — next review in X" instead of showing a bare empty state.

A `UserProgress` row is created lazily on first interaction (first bookmark/note/revision-mark), not pre-created for every (user, card) pair — avoids an O(users × cards) row explosion.

---

## 6. `Annotation` — text highlights

```js
{
  user: { type: ObjectId, ref: "User", required: true },
  knowledge: { type: ObjectId, ref: "Knowledge", required: true },
  block: { type: String, enum: ["tldr", "explanation"], required: true },  // which content field was highlighted
  quote: { type: String, required: true },     // the exact highlighted text, used as a re-anchoring fallback
  startOffset: Number,                          // char offset within the block's rendered plain text, best-effort
  endOffset: Number,
  color: { type: String, enum: ["yellow", "green", "blue", "pink"], default: "yellow" },
  note: String,                                  // optional inline note attached to the highlight
}
// timestamps: true
```

Re-anchoring strategy documented in `09-frontend-architecture.md` §Markdown rendering: offsets are a best-effort primary key, `quote` text-match is the fallback when content has been lightly edited since the highlight was made (avoids highlights silently vanishing after an admin typo fix).

---

## 7. `Resource`

```js
{
  title: String,
  url: String,
  kind: { type: String, enum: ["official_docs", "article", "blog", "github", "book",
                                 "video", "pdf", "research_paper", "cheatsheet"], required: true },
  description: String,
  addedBy: { type: ObjectId, ref: "User" },
  isDeleted: Boolean, deletedAt: Date,
}
// timestamps: true
```

Referenced from `Knowledge.resources[]`. Kept as its own collection (not embedded) because the same resource URL is frequently linked from many cards (e.g. the MDN Promise page from both "Promise" and "async/await") — embedding would duplicate title/kind/description N times.

## 8. `Attachment`

```js
{
  url: String,               // Cloudinary secure_url
  publicId: String,          // Cloudinary public_id, needed for deletion
  resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
  format: String,
  bytes: Number,
  uploadedBy: { type: ObjectId, ref: "User", required: true },
}
// timestamps: true
```

## 9. `Company`

```js
{
  name: String, slug: String, logoUrl: String,
  isDeleted: Boolean, deletedAt: Date,
}
```

## 10. `Activity` (lightweight audit + "recent activity" feed)

```js
{
  user: { type: ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["viewed", "created", "updated", "published",
                                    "bookmarked", "revised", "commented_note"], required: true },
  knowledge: { type: ObjectId, ref: "Knowledge" },
  meta: mongoose.Schema.Types.Mixed,
}
// timestamps: true, expires: 180d via TTL index on createdAt for "viewed" actions only (see indexes)
```

Powers Dashboard's "Recently Viewed" / "Recently Updated" and Admin's audit trail. `viewed` events get a TTL so this collection doesn't grow unbounded from passive reads; `created`/`updated`/`published` (the audit-meaningful ones) do not expire.

---

## 11. Indexes

```js
// users
{ email: 1 }                                        // unique
{ "providers.provider": 1, "providers.providerId": 1 } // unique compound

// categories
{ slug: 1 }                                          // unique
{ parent: 1, order: 1 }

// companies
{ slug: 1 }                                          // unique

// knowledges — the workhorse collection
{ slug: 1 }                                           // unique
{ type: 1, status: 1, category: 1 }                    // Explore/Practice list filtering
{ tags: 1 }
{ companies: 1 }
{ "relations.knowledge": 1 }
{ title: "text", tags: "text", "content.tldr": "text", "content.explanation": "text" }
  // weights: title:10, tags:5, tldr:3, explanation:1 — see 16-performance-design.md

// userprogresses
{ user: 1, knowledge: 1 }                              // unique compound — the core lookup
{ user: 1, "revision.isMarkedForRevision": 1, "revision.nextRevisionAt": 1 }  // revision-due queries
{ user: 1, isBookmarked: 1 }
{ user: 1, isPinned: 1 }

// annotations
{ user: 1, knowledge: 1 }

// resources / attachments
{ addedBy: 1 } / { uploadedBy: 1 }

// activities
{ user: 1, createdAt: -1 }
{ createdAt: 1 }  // TTL, partialFilterExpression: { action: "viewed" }, expireAfterSeconds: 15552000
```

## 12. Aggregation-backed views (no dedicated collections)

- **Dashboard "Revision Due"**: `UserProgress.aggregate` filtering `revision.isMarkedForRevision: true, revision.nextRevisionAt: { $lte: now }`, `$lookup` into `knowledges`.
- **Dashboard "Continue Learning"**: `UserProgress` where `status: "in_progress"`, sorted by `updatedAt desc`, `$lookup` knowledge.
- **DSA "Company Wise Questions"**: `Knowledge.aggregate` matching `type: "dsa", companies: <id>`, `$group` by `difficulty` for the stat header.
- **Admin content-gap view** (future scope, `18-future-roadmap.md`): categories with below-threshold card counts.

## 13. Versioning

MVP does **not** version `Knowledge` documents (no `KnowledgeRevisionHistory` collection) — `lastEditedBy`/`updatedAt` plus the `activities` audit log are sufficient for a single-admin-curator MVP. Full content versioning/diffing is flagged in `18-future-roadmap.md` as a prerequisite for opening authoring to community contributors.
