# DevAtlas — Product Vision

## 1. Vision Statement

Every software engineer accumulates the same kind of scattered knowledge: half-finished Notion pages, a graveyard of LeetCode bookmarks, a "system design" folder no one opens again, and a personal project that lives only in a GitHub README no recruiter reads carefully. That knowledge never connects to itself. DevAtlas exists to fix that by giving an engineer **one engine** where a concept, a DSA problem, an interview question, and a shipped project are all first-class citizens of the same graph — learnable, revisable, and linkable to each other — instead of four disconnected tools wearing the same login page.

DevAtlas is the operating system for a developer's technical memory: the place where "what I know" lives, in a shape that survives job changes, stack changes, and years.

## 2. Mission Statement

To give every engineer a single, structured, permanently-growing knowledge graph of their technical understanding — connecting concepts to problems to projects to interviews — replacing the scattered mess of notes apps, flashcard decks, and bookmark folders with one coherent system that gets more valuable every time something is added to it.

## 3. Product Philosophy

DevAtlas is built on a small number of hard rules that are treated as architecture, not preference:

- **One object model, not four apps stapled together.** A concept explainer, a DSA problem, an interview question, and a project case study are all `Knowledge` documents distinguished by a `type` discriminator, not separate collections, separate UIs, or separate mental models. See `docs/06-database-design.md` for the schema.
- **Navigation reflects mental categories, not storage categories.** Folders and tags are how you organize files; they are not how an engineer thinks. DevAtlas's top-level nav — Home, Explore, Practice, Projects, Interview, Resources, Search — mirrors the *activities* an engineer actually does. "JavaScript," "SQL," "Operating Systems" are subjects you explore, not places you file things, so they live inside Explore as Categories, never as top-level destinations.
- **One canonical page shape.** Every Knowledge Card, regardless of type, renders the same skeleton: Header (Title/Tags/Difficulty/ReadTime/Updated) → TLDR → Deep Explanation → Visualization → Code Examples → Interview Questions → Mistakes → Resources → Related Topics. Consistency of layout is what lets a user's eyes learn to scan the app instead of relearning a new UI per content type.
- **Revision is a verb, not a noun.** There is no separate "flashcard" object cluttering the data model. Revision is a personal state — favorite, pin, note, mark-for-revision, confidence level — attached to whichever Knowledge Card you're already looking at. The Revision view is an aggregation query over that state, not a second copy of content.
- **Interview prep is not a quiz bank.** Interview questions live embedded inside the concept they test, because that's where they're actually useful — while you're reading about closures, not in a disconnected question-and-answer deck you have to context-switch into.
- **Projects are engineering case studies, not portfolios.** A project card explains *how* something was built (architecture, database, auth, real-time, deployment, what went wrong) and deep-links every technical decision back to the concept card that explains it. Reading about Roomezy's auth section should be one click from the JWT concept card.
- **The graph is explicit, not implied.** Relationships between cards are typed edges (`related_to`, `depends_on`, `used_in`, `implements`, `alternative`, `prerequisite`, `example_of`, `part_of`, `referenced_by`), not a "related posts" widget guessing by tag overlap. This is what makes DevAtlas a knowledge graph instead of a wiki with good SEO.
- **No manufactured engagement.** No streaks, XP, coins, badges, levels, motivational toasts, or vanity charts. An engineer's motivation to understand recursion should not be gamified into a Duolingo owl. Progress is shown as honest state (mastered / shaky / not reviewed), never as a score.
- **Curated, not crowdsourced-by-default.** Canonical content is authored and reviewed by admins so that what you're revising the night before an interview is trustworthy. Users personalize on top of that trust layer — they annotate, highlight, note, and revise — but they don't fork the canonical truth.

## 4. Problem Statement

Engineers currently manage their technical knowledge across a pile of tools that were never designed to talk to each other:

- **Notion / Obsidian / Google Docs** for concept notes — great for writing, useless for structured revision, and blind to the fact that "JWT" the note and "JWT" the thing your project uses are the same idea.
- **LeetCode / DSA trackers** for problems — good at judging code, bad at teaching the underlying pattern in a way that persists after the problem is solved.
- **Anki / flashcard apps** for interview prep — force knowledge into isolated Q&A pairs stripped of the context that made them make sense in the first place.
- **GitHub READMEs / personal portfolio sites** for projects — describe *what* was built, rarely *why*, and never link the auth section to the auth concept the engineer actually had to learn to build it.
- **Bookmark folders and browser tabs** for "resources to revisit" — a write-only store nobody re-reads.

The result: the same engineer re-learns the same concept three times across three job cycles, can recite a DSA pattern's name but not explain it in an interview, and cannot point to their own project and explain an architectural decision six months after shipping it — because nothing in their toolchain was built to *retain and connect* understanding, only to *store* it.

## 5. Why This Product Should Exist

Learning-to-work is a graph problem, and every existing tool solves it as a list problem. A note-taking app gives you a flat list of pages. A flashcard app gives you a flat list of cards. A DSA tracker gives you a flat list of solved problems with a green checkmark. None of them answer the question an engineer actually asks under interview pressure: *"I know I've seen this — where does it connect to everything else I know?"*

DevAtlas exists because that question deserves a real answer, backed by real typed relationships, real revision science (without turning it into a game), and a page layout consistent enough that after the tenth card you stop thinking about the UI and just think about the content. It is the tool a senior engineer would build for themselves if they had the time — this project is that time being spent.

## 6. Long-Term Vision (3–5 Years)

DevAtlas is being built personal-first and community-capable by design — every architectural decision (typed graph edges, discriminator-based content model, admin/user role separation) is chosen so the product can grow outward without a rewrite.

**Phase 1 — Personal Knowledge OS (Year 1).** Single-user-focused, admin-curated canonical content library covering core CS fundamentals, common DSA patterns, and a handful of deeply-documented personal projects. Success is measured by whether the founding users (the team's own engineers) actually replace their Notion + Anki + LeetCode-notes workflow with DevAtlas.

**Phase 2 — Curated Multi-User Platform (Year 1–2).** Opens to a wider user base under the existing user/admin model. Admins expand canonical coverage (more categories, more companies for interview tagging, bulk-imported DSA sets). Users bring their own projects, notes, and revision state. Search and taxonomy harden under real content volume (this is where MongoDB Atlas Search or Elasticsearch replaces the v1 text-index search described in `docs/07-api-design.md`).

**Phase 3 — Community Contribution Layer (Year 2–3).** Introduces a moderated contribution path: trusted users can propose new Knowledge Cards or edits to existing ones (a "suggest an edit" flow feeding an admin review queue), without breaking the curated-canonical guarantee. Community-authored *project case studies* become a first-class discovery surface — "how did other people architect a real-time chat feature" becomes searchable and comparable, still using the exact same Knowledge Card skeleton.

**Phase 4 — Public Learning Graph (Year 3–5).** DevAtlas becomes a public, browsable knowledge graph of software engineering — the "everything is a Knowledge Card" model is the same one it launched with, just populated by an order of magnitude more contributors and cards. Team/organization workspaces become viable (a bootcamp or engineering team curating its own card set on the same engine). The typed relationship graph, having been correct from day one, is what makes graph-native features (visual graph exploration, "shortest learning path from X to Y") possible without re-architecting the data model retroactively.

The through-line across all four phases: the object model, the page skeleton, and the philosophy of "no manufactured engagement" never change. What changes is the number of people the graph is curated by and for.

## 7. Target Users

- **Primary:** Software engineers (junior to senior) actively preparing for technical interviews or consolidating fragmented self-taught/on-the-job knowledge.
- **Secondary:** CS students and bootcamp graduates building foundational knowledge who need a single structured reference instead of a hundred scattered tutorials.
- **Tertiary (Phase 2+):** Engineering teams and bootcamps who want a shared, curated internal knowledge base built on the same graph model.
- **Admin/curator persona:** A small set of trusted content authors (initially the DevAtlas team itself) responsible for canonical Knowledge Card quality, taxonomy, and DSA bulk imports.

## 8. User Personas

### Persona 1 — Krishna, the Interview-Cycle Engineer
- **Profile:** 26, backend-leaning full-stack engineer, 3 years of experience, currently in an active job search after a layoff.
- **Behavior today:** Has 40+ browser tabs of LeetCode solutions, a Notion page called "System Design Notes" last touched four months ago, and an Anki deck he stopped opening because the cards lost context outside the video he made them from.
- **Goal:** Walk into an interview able to explain *and derive* a solution, not just recall that he's "seen this problem before."
- **What DevAtlas gives him:** A DSA card that explains the pattern (not just the one problem), embedded interview questions on the exact concept a company is known to ask (via company tagging), and a Revision view that resurfaces "shaky" cards instead of ones he already knows cold — no streak counter guilting him for a missed day.

### Persona 2 — Meera, the Self-Taught Builder
- **Profile:** 23, self-taught developer, two solid side projects, preparing for her first engineering role.
- **Behavior today:** Learns a concept from a YouTube video, builds something with it, and three weeks later can't explain *why* she used a JWT instead of a session cookie when asked in a mock interview.
- **Goal:** Turn "I built it and it worked" into "I built it and can defend every decision."
- **What DevAtlas gives her:** Project case studies where every technical block deep-links to the underlying concept card, so documenting her own project (Roomezy-style) doubles as concept revision. The consistent card skeleton means she learns the *system*, not fifteen different note formats.

### Persona 3 — Arjun, the Curating Admin
- **Profile:** 31, senior engineer, volunteers time as a DevAtlas content admin/curator.
- **Behavior today:** Wants to contribute high-quality canonical explanations of concepts he's mastered (e.g., consistent hashing, OS scheduling) without building a CMS from scratch, and needs to bulk-load a 200-question DSA set from a spreadsheet without hand-entering each one.
- **Goal:** Author trustworthy, well-structured canonical content quickly, and keep taxonomy (categories, companies, tags) clean as the library grows.
- **What DevAtlas gives him:** A single content model to author against regardless of type, a CSV bulk-import path for DSA questions, and admin-only taxonomy management so Explore's category tree doesn't rot into chaos as contributors are added in later phases.

## 9. User Pain Points

1. **Context collapse.** Notes, problems, and projects are stored in different tools, so the *connections between them* — the actual value of understanding — exist only in the user's head and evaporate over time.
2. **Flashcard amnesia.** Isolated Q&A flashcards lose the surrounding explanation that made the answer make sense, so recall without comprehension creeps in.
3. **Passive bookmarking.** "Read later" resource lists are write-only; nothing resurfaces them at the right time.
4. **Portfolio shallowness.** Project write-ups describe features, not decisions, so the engineer can't defend their own choices under interview follow-up questions.
5. **Revision without triage.** Existing spaced-repetition tools treat every fact as equally forgettable, generating review load on things already mastered while under-serving genuinely shaky topics.
6. **Gamification fatigue.** Streak/XP mechanics optimize for daily app opens, not understanding, and actively punish the realistic, non-linear rhythm of real learning and job-search stress.
7. **Fragmented interview prep.** Practicing DSA, reviewing system design concepts, and rehearsing behavioral/technical interview answers happen in three unrelated tools with no shared taxonomy (e.g., "which of these has Amazon actually asked?").

## 10. Product Goals

1. Replace the note-app + flashcard-app + tracker-spreadsheet stack with one coherent knowledge engine for its target users within the first year of availability.
2. Prove the "one object model, many types" architecture holds under real content volume (hundreds of concepts, thousands of DSA questions, dozens of projects) without forking into type-specific special cases.
3. Make the typed relationship graph a genuine navigation aid — users should be able to move concept → problem → project → interview question along real edges, not keyword-guessed "related content."
4. Deliver a revision system that measurably improves interview readiness without a single point, badge, or streak in the product.
5. Establish the curated-canonical / personalized-on-top model (admin authors, user annotates) as the trust foundation the Phase 3 community contribution layer will later extend rather than replace.

## 11. Success Metrics

DevAtlas deliberately does not track vanity engagement metrics (streaks, session count for its own sake, badges earned). Success is measured by knowledge-system health and outcome signals instead:

- **Revision effectiveness:** % of cards marked "confident" that stay confident on next resurfacing (i.e., the leveled re-queue is actually predictive, not just decorative).
- **Graph density:** average number of typed relationships per Knowledge Card, tracked as a content-quality signal (an isolated card with zero edges is a curation gap, not a feature).
- **Cross-module traversal rate:** % of sessions where a user moves between at least two modules via a relationship link or a project deep-link (e.g., Project → Concept), evidence the graph is doing real navigational work, not just Explore's category tree.
- **Annotation depth:** average highlights/notes per active user per card read, as a proxy for genuine engagement with content vs. passive scrolling.
- **Curated coverage:** ratio of canonical (admin-authored) cards to total cards per category, tracked so growth in Phase 2+ doesn't silently erode content trustworthiness.
- **Time-to-recall in interview module:** self-reported confidence delta (shaky → confident) over a user's active revision period for a given topic set.
- **Project-to-concept link coverage:** % of technical blocks in project case studies that deep-link to a Knowledge Card, since an unlinked block is a documentation gap.

## 12. Out of Scope

The following are permanent, philosophy-level exclusions, not phase-1 deferrals:

- Streaks, XP, coins, levels, badges, leaderboards, or any point-scoring mechanic.
- Motivational quotes, notifications designed to induce guilt ("you haven't studied in 3 days!"), or vanity analytics/charts designed for engagement rather than insight.
- Stand-alone flashcard decks as a distinct content type — all revision is state on top of existing Knowledge Cards.
- Folder-based organization as a navigation paradigm — Categories exist inside Explore, never as top-level nav.
- Email/password authentication — OAuth-only (Google, GitHub) by deliberate design, detailed in `docs/09-auth-design.md`.
- Self-serve admin signup — admin is a curated, DB/seed-assigned role, never a plan tier or checkbox at signup.
- Real-time collaborative editing of canonical content (Google-Docs-style multi-cursor authoring) — out of scope for the foreseeable roadmap; admin authoring is single-editor.

## 13. Product Principles

1. **One engine, many types — never many engines.** If a feature can't be expressed as a `type` discriminator or a typed relationship on the existing Knowledge model, question the feature before questioning the model.
2. **Same skeleton, every card, no exceptions.** Layout consistency is a feature, not a limitation — resist any request for a "special layout" for a new content type.
3. **State is personal; content is canonical.** Never let a user's bookmark, note, or revision level mutate the shared Knowledge document. Personalization lives in `userprogress` and `annotations`, full stop.
4. **Edges are typed, not guessed.** "Related content" earns its place on a card only via an explicit, admin-authored relationship — never a similarity-score black box.
5. **No dark patterns for attention.** If a feature's primary purpose is to bring a user back out of guilt or score-chasing rather than genuine learning need, it doesn't ship.
6. **Curated trust before crowd scale.** Every feature that opens the graph to more contributors (Phase 3+) must preserve the guarantee that canonical content has been reviewed by an admin.
7. **Depth over breadth of navigation.** One long, well-structured page beats five shallow tabs — a user should be able to `Ctrl+F` an entire card's knowledge in one place.
8. **Boring, restrained visual design.** Grayscale-first, no gradients, no neon, no brand-color chasing — the product's personality comes from the quality of its content and graph, not its chrome.
