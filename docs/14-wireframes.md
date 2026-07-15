# 14 — Wireframes

> Low-fidelity ASCII/box-drawing layouts: structure and content placement only — no color, spacing, typography, or component styling (that's implementation, guided by the existing neutral oklch theme in `frontend/src/index.css`, not this document). Pairs with `12-user-flows.md` (what triggers a transition between screens) and `13-ux-flows.md` (what state a given region is in and why) — this document is "where does it sit on the screen" for the states those two documents already define. Character alignment below is illustrative, not pixel-exact; the section order, nesting, and labels are what's authoritative.

Every wireframe after §1 shows **content-area only** — it is understood to render inside the App Shell defined once in §1, so the Sidebar/top-bar chrome isn't redrawn 17 times.

---

## 0. Legend

```
┌─┬─┐  │  └─┴─┘   box-drawing = container / region boundary or divider
[ Button ]                     actionable control
{ chip }        {●chip}        filter / tag pill · active filter pill
<placeholder>                  text input or textarea
●   ○                          active/selected  ·  inactive (tabs, radio choices)
▸   ▾                          collapsed  ·  expanded disclosure
[b][f][p][r]   [B][F][P][R]    Bookmark/Favorite/Pin/marked-for-Revision — off · on
CPT  DSA  INT  PRJ              Knowledge Card type badge (concept/dsa/interview/project)
※                               admin-only element
...                             truncated — additional rows repeat the same shape
»                               deep-link — navigates to another card or screen
✓   ✕                           solved/complete marker  ·  mistake/error marker
```

---

## 1. App Shell — Reference Frame (desktop, ≥768px)

State machine for this chrome (Expanded / CollapsedIcon / Sheet) is `13-ux-flows.md` §9.

```
┌─Sidebar (16rem)───────┐┌─Top Bar────────────────────────────────────────────────┐
│ ■ DevAtlas         [<]││ Explore › Frontend › JavaScript  [Search... Ctrl K][Rev 3][◐]│
├────────────────────────┤├──────────────────────────────────────────────────────────┤
│ ▪ Home                 ││                                                            │
│ ▪ Explore          ●   ││                                                            │
│ ▪ Practice             ││                                                            │
│ ▪ Projects             ││              < module content area — §2 onward >          │
│ ▪ Interview            ││                                                            │
│ ▪ Resources            ││                                                            │
│ ▪ Search               ││                                                            │
│                         ││                                                            │
├────────────────────────┤│                                                            │
│ [@] Krishna         ▾  ││                                                            │
└────────────────────────┘└──────────────────────────────────────────────────────────┘
```

`[<]` collapses the rail to a 3.5rem icon-only strip; the same control becomes the hamburger `[≡]` on mobile. The mobile-collapsed shape of this exact shell is shown in §18.

---

## 2. Dashboard

States: `13-ux-flows.md` §1.

```
 Welcome back, Krishna                                              15 Jul 2026

 CONTINUE LEARNING ────────────────────────────────────────────────────────────
 [ Event Loop  CPT ]   [ Consistent Hashing  CPT ]   [ Two Pointers Pattern DSA]

 REVISION DUE (7) ──────────────────────────────────────── [ Go to Revision » ]
  Morris Traversal        overdue 3d        last: forgot
  JWT                     due today          last: shaky
  ...

 PINNED ────────────────────────────────────────────────────────────────────
 [P]Promise   [P]Roomezy   [P]Two Sum   [P]Deadlock   ...

 RECENTLY VIEWED ──────────────────────────────────────────────────────────
  async / await             CPT   viewed 2h ago
  Container With Most Water DSA   viewed yesterday

 RECENTLY UPDATED ─────────────────────────────────────────────────────────
  Rate Limiter Design       CPT · System Design    updated 1d ago
  Roomezy                   PRJ                     updated 3d ago

 RECENT ACTIVITY ──────────────────────────────────────────────────────────
  you revised "Two Sum" — confident              2h ago
  you bookmarked "Redis TTL Patterns"              1d ago
```

Note what's absent by design: no streak counter, no XP/points, no chart — only factual rails and plain counts, per the product's no-gamification constraint. A new account with every personal rail empty renders only Recently Updated plus a one-line nudge into Explore (`13-ux-flows.md` §1) rather than a sparse page.

---

## 3. Explore — Category Grid

Route `/explore`. States: `13-ux-flows.md` §2.

```
 Explore

 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Frontend    │ │ Backend     │ │ DSA         │ │ Database    │
 │ 42 topics   │ │ 38 topics   │ │ 210 quest.  │ │ 24 topics   │
 └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Operating   │ │ Computer    │ │ AI / ML     │ │ System      │
 │ System      │ │ Networks    │ │             │ │ Design      │
 │ 18 topics   │ │ 15 topics   │ │ 12 topics   │ │ 22 topics   │
 └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Projects    │ │ Interview   │ │ Misc        │
 │ 6 studies   │ │ 30 topics   │ │ 14 topics   │
 └─────────────┘ └─────────────┘ └─────────────┘
```

## 4. Explore — Topic List

Route `/explore/:categorySlug/:subCategorySlug`. States: `13-ux-flows.md` §2 (TopicList).

```
 Explore › Frontend › JavaScript                                    22 topics

 {●difficulty: beginner} {●type: concept}   [Clear filters]      Sort: Title ▾
 ───────────────────────────────────────────────────────────────────────────
  CPT  Closures            {async}{scope}          Beginner  4 min  [b][f][p]
  CPT  Event Loop          {async}{runtime}         Beginner  6 min  [B][f][p]
  CPT  Promise             {async}{microtask}        Interm.  7 min  [B][F][p]
  CPT  async / await       {async}{syntax}            Interm.  5 min  [b][f][p]
  ...
 ───────────────────────────────────────────────────────────────────────────
                                 ‹ 1  2  3 ›
```

---

## 5. Knowledge Card Page — Fixed Skeleton

Route `/card/:slug`. The one page shape every type in `06-database-design.md` §4 renders through — Header → TLDR → Deep Explanation → Visualization → Code Examples → Interview Questions → Mistakes → Resources → Related Topics, always in this order. A section a given card doesn't populate is omitted, never shown empty. The Personal Rail alongside it is per-user state, not part of the canonical skeleton (`12-user-flows.md` Flow 4 step 1).

```
┌─Content (canonical skeleton)──────────────────────────┐┌─Personal Rail─────┐
│ HEADER                                                 ││ [b] Bookmark       │
│  Promise                                               ││ [f] Favorite       │
│  {async} {microtask-queue}        Difficulty: Interm.  ││ [p] Pin            │
│  Read time: 7 min      Updated: 2 Jul 2026              ││                    │
│─────────────────────────────────────────────────────────│ Status: ● In prog. │
│ TLDR                                                     ││                    │
│  A Promise represents the eventual result of an async    ││ Notes              │
│  operation — pending, fulfilled, or rejected.              ││ <your notes...>   │
│─────────────────────────────────────────────────────────│  Saved · 2m ago    │
│ DEEP EXPLANATION                                           ││                    │
│  <markdown body — headings, lists, inline code> ...          ││ [r] Mark for       │
│─────────────────────────────────────────────────────────│      Revision       │
│ VISUALIZATION                                                 │└─────────────────────┘
│  ┌───────────────────────────────────────────────────┐      (rail is shorter than
│  │   mermaid diagram   —or—   draggable React Flow    │       the content column and
│  └───────────────────────────────────────────────────┘      sticky-positioned in
│─────────────────────────────────────────────────────────│    the real page)
│ CODE EXAMPLES                                                │
│  ┌─ Basic usage ─────────────────────────────[Copy]──┐      │
│  │ const p = new Promise((resolve, reject) => {...}) │      │
│  └─────────────────────────────────────────────────┘      │
│─────────────────────────────────────────────────────────│
│ INTERVIEW QUESTIONS                                          │
│  ▸ How does Promise.all differ from Promise.allSettled?       │
│  ▸ What happens if you throw inside a .then()?                 │
│─────────────────────────────────────────────────────────│
│ MISTAKES                                                        │
│  ✕ Forgetting Promise.all rejects on first failure                │
│─────────────────────────────────────────────────────────│
│ RESOURCES                                                          │
│  » MDN — Promise         » web.dev — JavaScript Promises              │
│─────────────────────────────────────────────────────────│
│ RELATED TOPICS                                                       │
│  {prerequisite: Event Loop}   {related_to: async/await}                │
│  {used_in: Roomezy}                                                      │
└─────────────────────────────────────────────────────────┘
```

Every other card type (§7, §8, and the `interview` type not separately drawn) reuses this exact shell — only the content fed into each section, plus a small type-specific meta row in Header/Deep Explanation, changes.

---

## 6. DSA Dashboard (Practice landing)

Route `/practice`. States: `13-ux-flows.md` §3.

```
 Practice — DSA Questions                                        342 questions

 210 Easy · 98 Medium · 34 Hard

 {●pattern: Two Pointers} {difficulty: any} {company: any} {status: any}
 ───────────────────────────────────────────────────────────────────────────
  Title                          Pattern        Diff.   Companies    [b] [✓]
 ───────────────────────────────────────────────────────────────────────────
  Container With Most Water      Two Pointers   Medium  Amazon,Google [b][ ]
  Two Sum                        Hashing        Easy    Amazon,Adobe  [B][✓]
  3Sum                           Two Pointers   Medium  Facebook      [b][ ]
  ...
 ───────────────────────────────────────────────────────────────────────────
                              ‹ 1  2 ... 11 ›
```

## 7. DSA Question Page

Route `/card/:slug` (`type: dsa`). Same skeleton as §5 — only the differing regions are drawn.

```
┌─Content──────────────────────────────────────────────────┐┌─Rail──────────┐
│ HEADER                                                     ││ [b][f][p]      │
│  Container With Most Water          Pattern: Two Pointers  ││ Status: ○ Not  │
│  Easy · 8 min · Updated 10 Jun 2026    » LeetCode #11        ││   started      │
│  Time: O(n)   Space: O(1)                                     ││ Notes <...>    │
│─────────────────────────────────────────────────────────│  [r] Mark for  │
│ TLDR — restates the problem in 2-3 lines                        │      Revision  │
│─────────────────────────────────────────────────────────│└────────────────┘
│ DEEP EXPLANATION — teaches the Two Pointers PATTERN, not         │
│  just this one problem                                             │
│  Constraints: 2 <= n <= 10^5                                         │
│  Hints:  ▸ Show hint 1   ▸ Show hint 2   ▸ Show hint 3                 │
│  Approach: shrink the window from whichever side is shorter…            │
│─────────────────────────────────────────────────────────│
│ VISUALIZATION — animated / interactive two-pointer sweep                 │
│─────────────────────────────────────────────────────────│
│ CODE EXAMPLES                                                              │
│  ┌────────────────────────────────────────────────────┐                 │
│  │          [ ▸ Show Solution ]  — collapsed by default │                 │
│  └────────────────────────────────────────────────────┘                 │
│─────────────────────────────────────────────────────────│
│ INTERVIEW QUESTIONS · MISTAKES · RESOURCES · RELATED TOPICS                 │
│  — unchanged shape from §5, DSA-flavored content                              │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Project Case Study Page

Route `/card/:slug` (`type: project`). Same skeleton as §5; Deep Explanation composes the case-study sub-blocks in fixed order (`06-database-design.md` §4.5).

```
┌─Content───────────────────────────────────────────────────────────────┐
│ HEADER                                                                   │
│  Roomezy                        Real-time roommate matching platform     │
│  React · Node · MongoDB · Socket.io          » Repo    » Live Demo         │
│──────────────────────────────────────────────────────────────────────│
│ TLDR                                                                        │
│──────────────────────────────────────────────────────────────────────│
│ DEEP EXPLANATION                                                             │
│  ▸ Overview                                                                   │
│  ▸ Architecture      [ React Flow diagram — services / DB / client boxes ]      │
│  ▸ Database                                                                       │
│  ▸ Authentication — "Uses JWT for stateless session auth  » JWT card"               │
│  ▸ Real-time      — Socket.io rooms  » Pub/Sub concept card                           │
│  ▸ Cloud Media    — Cloudinary pipeline  » Cloudinary Upload Pattern card                │
│  ▸ Notifications                                                                            │
│  ▸ Deployment     — Render + Vercel, CI/CD notes                                              │
│  ▸ Problems Faced                                                                                │
│  ▸ Lessons Learned                                                                                 │
│──────────────────────────────────────────────────────────────────────│
│ VISUALIZATION — architecture diagram (React Flow: client/server/DB boxes)                            │
│──────────────────────────────────────────────────────────────────────│
│ CODE EXAMPLES · INTERVIEW QUESTIONS · MISTAKES                                                          │
│──────────────────────────────────────────────────────────────────────│
│ RESOURCES — external learning links only (repo/demo live in the header bar above)                         │
│──────────────────────────────────────────────────────────────────────│
│ RELATED TOPICS    {used_in: JWT}   {used_in: Socket.io}   {part_of: this case study}                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 9. Interview Module

Route `/interview`. States: `13-ux-flows.md` §5.

```
 Interview Prep

 {role: system-design ×} {company: any}
 ───────────────────────────────────────────────────────────────────────
  System Design Interview
  INT  Design a URL Shortener              system-design      » open
  INT  Design a Rate Limiter               system-design      » open
 ───────────────────────────────────────────────────────────────────────
  Behavioral / HR
  INT  Tell Me About Yourself              hr                  » open
 ───────────────────────────────────────────────────────────────────────
  Concepts flagged interview-relevant
  CPT  Consistent Hashing    (embedded interview questions)     » open
  DSA  Two Sum               (embedded interview questions)     » open
 ───────────────────────────────────────────────────────────────────────
```

---

## 10. Search (with facet filters)

Route `/search`. States: `13-ux-flows.md` §4.

```
┌─Facets─────────────┐┌─Results for "jwt"──────────────────────────────────┐
│ Type                ││  JWT                                CPT  Interm. » │
│ [✓] concept   (1)   ││  JWT-based Session Auth (interview)  INT          » │
│ [ ] interview (2)   ││  OAuth vs JWT — alternative approach CPT           » │
│ [ ] dsa       (0)   ││                                                     │
│ [ ] project   (0)   ││                                                     │
│                      ││                                                     │
│ Category             ││                                                     │
│ [ ] Backend          ││                                                     │
│ [ ] Authentication   ││                                                     │
│                      ││                                                     │
│ Difficulty            ││                                                     │
│ [ ] Beginner           ││                                                     │
│ [ ] Intermediate         ││                                                     │
│ [ ] Advanced               ││                                                     │
│                              ││                                                     │
│ Company                       ││                                                     │
│ [ ] Amazon                      ││                                                     │
└──────────────────────────────────┘└─────────────────────────────────────────────────┘

 Idle state (before typing) shows recent-search chips instead of the layout above:
 {jwt}  {morris traversal}  {cap theorem}  {two pointers}  ...
```

---

## 11. Revision

Route `/revision`. One view, no tabs — states: `13-ux-flows.md` §7. Each due card renders inline with its own rating controls, rather than handing off to a separate full-screen "session" — a due card and its `RevisionControls` are the same component pairing used everywhere else a card + controls appear together.

```
 Revision                                                          [1 due →sidebar badge]

 ───────────────────────────────────────────────────────────────────────
  The `this` Keyword & Context Binding      Concept · Intermediate
  #this-keyword  #binding  #arrow-functions
 ───────────────────────────────────────────────────────────────────────
  [not_started ▾]   [🔖][♡][📌][↺ marked]   How well did you recall this? (i)
                     [ Forgot · 10m ]  [ Shaky · 1d ]  [ Confident · 14d ]
 ───────────────────────────────────────────────────────────────────────

 ...next due card, same shape...
```

Submitting a rating shows a toast ("Scheduled for review in 10 minutes") and the card drops out of the list on refetch. When the list is empty:

```
 Revision

                              ↺
                     You're caught up
              Next review in 9 minutes.
```

(or, if nothing has ever been marked for revision at all: "Mark a card 'for revision' while reading it, and it'll queue up here when it's due.")

---

## 11b. Saved (Bookmarks / Favorites / Pinned)

Route `/bookmarks` (sidebar label "Saved"). Tab states + the Bookmark/Favorite/Pin distinction: `13-ux-flows.md` §7b.

```
 Saved
 Everything you've bookmarked, favorited, or pinned, grouped by type. (i)

 ● Bookmarked      ○ Favorites (2)      ○ Pinned (1)
 ───────────────────────────────────────────────────────────────────────
 CONCEPTS (1)
  ┌──────────────────────────────────────────────────────────────┐  [×]
  │ Concept · Beginner                                            │
  │ How the Internet Works                                        │
  │ Computer Networks           11 min   #networking #dns #tcp    │
  └──────────────────────────────────────────────────────────────┘
```

Sections only render for types that have at least one item (a user with only Concept cards saved never sees empty DSA/Interview/Project headers). Each card's `[×]` un-toggles it for the active tab without navigating to the card.

---

## 12. Resources

Route `/resources`. Curated, admin-maintained, grouped by `kind` (`06-database-design.md` §7) — distinct from a card's own per-card Resources section (§5).

```
 Resources

 OFFICIAL DOCS ───────────────────────────────────────────────────────────
  » MDN Web Docs
  » MongoDB Manual

 ARTICLES ────────────────────────────────────────────────────────────────
  » "You Don't Know JS" — Kyle Simpson

 VIDEOS ──────────────────────────────────────────────────────────────────
  » Fireship — The Event Loop in 100 Seconds

 BOOKS ───────────────────────────────────────────────────────────────────
  » Designing Data-Intensive Applications
  ...
```

---

## 13. Profile

Route `/profile`. Tab states: `13-ux-flows.md` §8.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [@Avatar]  Krishna                                                      │
│            Backend Engineer · Node · Distributed Systems                 │
│            » github   » linkedin           Joined Mar 2026                 │
└──────────────────────────────────────────────────────────────────────┘

 ● Overview     ○ Bookmarks     ○ Activity

 ── Overview ──────────────────────────────────────────────────────────
  Bio: <short bio text>
  12 bookmarked · 34 revised · 96 viewed        (plain counts — no chart)
```

## 14. Settings

Route `/settings`. States: `13-ux-flows.md` §8.

```
 Settings

 APPEARANCE ────────────────────────────────────────────────────────────
  Theme      ○ Light     ○ Dark     ● System

 ACCOUNT ───────────────────────────────────────────────────────────────
  Name       <Krishna>                                Saved · just now
  Headline   <Backend Engineer · Node · ...>
  Bio        <textarea>
  GitHub <url>     LinkedIn <url>     Website <url>

 LINKED ACCOUNTS  (read-only — no "link another provider" control) ────────
  ● Google   — connected
  ○ GitHub   — not linked

 SESSIONS ───────────────────────────────────────────────────────────────
  [ Sign out of all devices ]        — destructive, confirmation required
```

---

## 15. Admin Editor — Card Authoring Form

Route `/admin/knowledge/new` (or `:id/edit`). Flow: `12-user-flows.md` §13.

```
※ Admin — New Knowledge Card

 Type:   ● concept   ○ dsa   ○ interview   ○ project      (locked after create)

 ▾ BASICS
   Title      <Consistent Hashing>            Slug <consistent-hashing> ✓ unique
   Category   <System Design ▾>                Tags {hashing}{scalability} [+]
   Difficulty  ○ Beginner  ● Intermediate  ○ Advanced        Status: Draft

 ▾ CONTENT
   TLDR         <textarea>                    │ Live Preview
   Explanation  <markdown editor>               │ (real KnowledgeCardLayout —
                                                  │  same component as production)

 ▾ VISUALIZATION       kind: ○ none  ● mermaid  ○ flow
   <mermaid source textarea>                     │ live-rendered mermaid preview

 ▾ CODE EXAMPLES              [+ Add example]
   label <...>   language <...>   code <...>                              [✕]

 ▾ INTERVIEW QUESTIONS        [+ Add question]
 ▾ MISTAKES                   [+ Add mistake]
 ▾ RESOURCES                  [ Attach existing ]   [ + Create new ]

 ▾ RELATIONS                  [+ Add relation]
   <search a card...>    relationType <used_in ▾>       e.g. Roomezy → used_in

 ▾ COMPANIES          {Amazon} {Google} [+]

 ▾ TYPE-SPECIFIC  (dsa shown as example — swaps per Type above)
   pattern <...>    time <O(n)>   space <O(1)>    constraints <...>
   externalUrl <...>     approach <textarea>      hints [+ Add hint]

 ─────────────────────────────────────────────────────────────────────
                  [ Save Draft ]     [ Preview ]     [ Publish ]
```

## 16. Admin Editor — CSV Import

Route `/admin/import/dsa-csv`. Flow: `12-user-flows.md` §14.

```
※ Admin — Bulk Import DSA Questions

 [ Download CSV Template ]

 ┌────────────────────────────────────────────────────────┐
 │                                                            │
 │          Drag & drop a .csv file here, or [ Browse ]        │
 │                                                            │
 └────────────────────────────────────────────────────────┘

 ── after upload — import report ─────────────────────────────────────
  Created: 187          Skipped: 13

  Row    Reason
  ───────────────────────────────────────────────────────────────────
  14     difficulty must be one of easy|medium|hard
  27     category slug "grpahs" does not resolve
  ...
 ───────────────────────────────────────────────────────────────────
  Imported rows land as Drafts — review before publishing.
  » Go to Knowledge list (status: draft, type: dsa)
```

## 17. Admin Editor — Diagram Builder

Part of the Visualization step in §15. Flow context: `12-user-flows.md` §13 step 3.

```
※ Admin — Visualization Builder

 kind:   ○ none     ○ mermaid     ● flow

 ┌─Node Palette──┐┌─Canvas (React Flow, draggable)─────────┐┌─Properties────┐
 │ [Box node]      ││   ┌────────┐         ┌────────┐          ││ Selected: Edge  │
 │ [DB node]       ││   │ Client │──uses──▶│ Server │          ││ label <uses>    │
 │ [External svc]  ││   └────────┘         └───┬────┘          ││ style ● solid   │
 │ [+ Add edge]     ││                          │ writes         ││       ○ dashed  │
 │                   ││                    ┌─────▼───┐          │└─────────────────┘
 │                    ││                    │ MongoDB │
 │                     ││                    └─────────┘
 └─────────────────────┘└─────────────────────────────────────┘

                    [ Save Layout ]   — persists JSON to content.visualization.flow

 ── mermaid mode (kind = mermaid) ───────────────────────────────────────
  <raw mermaid source textarea>              │  live-rendered preview pane
```

---

## 18. Mobile Reference

Illustrates the collapse behavior specified in `13-ux-flows.md` §9 (App Shell → Sheet) and §10 (Personal Rail → bottom sheet). Not a full re-drawing of every screen at mobile width — see `13-ux-flows.md` for the behavioral rules that generalize to the rest of this document's screens.

```
 SIDEBAR AS SHEET (open, over scrim)         KNOWLEDGE CARD — collapsed bar

 ┌───────────────────┐                       ┌─────────────────────────┐
 │ ▪ Home              │                       │   ... card content ...   │
 │ ▪ Explore       ●   │                       │                           │
 │ ▪ Practice           │                       │                           │
 │ ▪ Projects            │  ← scrim, tap to →   └───────────────────────────┘
 │ ▪ Interview             │     close           │ [b][f][p]   Rev 3  [Notes]│  ← tap to expand
 │ ▪ Resources               │                     └───────────────────────────┘
 │ ▪ Search                    │
 │ [@] Krishna              ▾  │
 └───────────────────────────┘
  mobile top bar (always visible): [≡] DevAtlas          [Search icon] [Rev icon]

 KNOWLEDGE CARD — expanded bottom sheet (after tapping the collapsed bar)
 ┌─────────────────────────────────────────────────────────────────────┐
 │ Status   ○ Not started   ● In progress   ○ Completed                    │
 │ Notes    <textarea>                                       Saved · now   │
 │ [r] Mark for Revision           [ Forgot ] [ Shaky ] [ Confident ]        │
 └─────────────────────────────────────────────────────────────────────┘
```
