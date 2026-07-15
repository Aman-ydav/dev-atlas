# 10 — Component Library

> Inventory of reusable components: what each one is for, its key props, and which existing `frontend/components/ui/*.jsx` (shadcn/base-ui) primitives it composes. This is a component *contract* document, not a visual spec — token values live in `11-design-system.md`, page-level layout lives in `14-wireframes.md`, and the folder/ownership rules governing where each of these files lives are in `09-frontend-architecture.md` §1.3. Every component below is imported via the `@/*` alias (e.g. `@/components/knowledge/KnowledgeCard`).

## 0. Conventions

- **Status** on every entry is one of: **existing** (cites the real file path), **to build** (spec'd here, not yet in the repo), or **to extend** (exists, this section also specifies a concrete addition).
- **Composes** lists exact filenames under `components/ui/` (never edit those files directly — see `09-frontend-architecture.md` §1.3) plus any other `components/*` this component depends on.
- Every component that reads or writes personal state (bookmark/favorite/pin/note/revision/highlight) takes a `knowledgeId` (the `Knowledge._id`), not a `slug` — slugs address canonical content (`06-database-design.md` §4), ObjectIds address `UserProgress`/`Annotation` rows (§5–6). Components that only ever need canonical content take `slug`.
- No component in this inventory hardcodes a color outside the two named exceptions in `09-frontend-architecture.md` §4.4 (highlight swatches, Mermaid theme vars).

---

## 1. App Shell & Navigation

### `AppLayout`
**Status:** existing — `components/layout/AppLayout.jsx`
**Purpose:** The one persistent shell every authenticated route renders inside — sidebar + top bar + a max-width content column. Mounted once, by `ProtectedRoute`'s subtree in `App.jsx`; every page is its `<Outlet/>`.
**Key props:** none — it's a layout route, all state comes from context (`SidebarProvider`) and `<Outlet/>`.
**Composes:** `ui/sidebar.jsx` (`SidebarProvider`, `SidebarInset`), `layout/AppSidebar`, `layout/Navbar`.
**Notes:** Content column is capped at `max-w-5xl` and centered — this is *the* place a global content-width change would happen; don't cap width again inside individual pages. This is also where the error boundary from `09-frontend-architecture.md` §7 belongs, wrapping `<Outlet/>`.

### `AppSidebar`
**Status:** existing — `components/layout/AppSidebar.jsx`
**Purpose:** Primary navigation, mapped directly to the IA's module list, plus a personal-state group.
**Key props:** none — reads `useLocation()` for active-state and `selectCurrentUser`/`selectIsAdmin` from the store.
**Composes:** `ui/sidebar.jsx` (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup*`, `SidebarMenu*`).
**Notes — nav content, verbatim from the code:**

```js
PRIMARY_NAV = [Home "/", Explore "/explore", Practice "/practice", Projects "/projects", Interview "/interview", Resources "/resources"]
PERSONAL_NAV = [Revision "/revision", Bookmarks "/bookmarks", (+ Admin, if selectIsAdmin)]
```

`PRIMARY_NAV` has **six** entries, not the IA's seven — `Search` is deliberately absent from the sidebar. Search's primary affordance is the always-visible Navbar search button + `⌘K`/`Ctrl K` command palette (`SearchPalette`, below), which arguably serves the "Search" destination more prominently than a seventh sidebar row would; the full-results `/search` page is still reachable via the palette's "View all results" row or a direct URL, just not from a persistent sidebar link. This reads as a deliberate product choice rather than an oversight, but it's worth confirming against `04-information-architecture.md` §2 rather than silently adding a `Search` row — a one-line addition to `PRIMARY_NAV` if the omission wasn't intentional.

### `Navbar`
**Status:** existing — `components/layout/Navbar.jsx`
**Purpose:** Top bar: sidebar trigger, search entry point, theme toggle, avatar menu (Profile / Admin / Log out).
**Key props:** none.
**Composes:** `ui/sidebar.jsx` (`SidebarTrigger`), `ui/separator.jsx`, `ui/button.jsx`, `ui/avatar.jsx`, `ui/dropdown-menu.jsx`, `layout/ThemeToggle`, `layout/SearchPalette`.
**Notes:** Owns the global `⌘K`/`Ctrl+K` keydown listener that opens `SearchPalette` — this is the only place that shortcut is registered. Does not currently render a breadcrumb (see `PageBreadcrumb`, below, for where the wireframed "Explore › Frontend › JavaScript" trail should actually live instead).

### `SearchPalette` (Global Search Bar / command palette)
**Status:** existing — `components/layout/SearchPalette.jsx`
**Purpose:** The `⌘K` quick-search overlay — debounced cross-type search with inline results, without leaving the current page.
**Key props:** `open: boolean`, `onOpenChange: (open) => void`.
**Composes:** `ui/command.jsx` (`CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`), `knowledge/TypeBadge`.
**Notes:** 250ms debounce via `useLazySearchQuery`; each result row is a hand-rolled `TypeBadge` + title + category, not a reused `KnowledgeCard` — see the "dense-row convention" note under §2. **Gap:** `searchApi.getRecentSearches` is defined and exported (`useGetRecentSearchesQuery`) but not consumed anywhere — the natural placement is a "Recent searches" `CommandGroup` shown when the palette opens with an empty query, a standard `cmdk` pattern the primitive already supports without new dependencies.

### `PageHeader`
**Status:** existing — `components/shared/PageHeader.jsx`
**Purpose:** Standard title-block for any page: `<h1>`, optional description, optional right-aligned action slot.
**Key props:** `title: string`, `description?: string`, `actions?: ReactNode`.
**Composes:** nothing — plain Tailwind, no `ui/*` dependency.
**Notes:** Used at the top of nearly every page (`DashboardPage`, `ExplorePage`, `AdminEditorPage`, ...). This is the natural place to add an optional `breadcrumb?: ReactNode` slot once `PageBreadcrumb` exists, rather than growing `Navbar` to know about per-page trails.

### `PageBreadcrumb`
**Status:** to build — `components/shared/PageBreadcrumb.jsx`
**Purpose:** The "Explore › Frontend › JavaScript" trail shown in `14-wireframes.md` §1/§4. Currently not rendered anywhere — neither `Navbar` nor `PageHeader` produces it today.
**Key props:** `items: { label: string, to?: string }[]` — last item has no `to` (renders as the current page, non-linked).
**Composes:** `ui/breadcrumb.jsx` (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`).
**Notes:** Placed as `PageHeader`'s new `breadcrumb` slot (above), consumed first by `ExploreCategoryPage` (`Explore › {category.name}`) and `KnowledgeDetailPage` (`Explore › {category.name} › {title}`, or `Practice › {title}` when arrived at from `/practice` — the referring module, not always Explore, so this needs the calling page to pass the right trail rather than `PageBreadcrumb` inferring it from the URL alone).

---

## 2. Knowledge Card System

### `KnowledgeCard`
**Status:** existing — `components/knowledge/KnowledgeCard.jsx`
**Purpose:** The one grid/list card for a canonical Knowledge summary — used identically across Dashboard rails, Explore, Practice/Interview/Projects (via `TypeListPage`), and Search results.
**Key props:** `knowledge: KnowledgeSummary` (the `07-api-design.md` §5 summary projection — `title, slug, type, category, difficulty, tags, readTimeMinutes` + the relevant discriminator headline field).
**Composes:** `ui/card.jsx` (`Card`, `CardHeader`, `CardTitle`, `CardContent`), `ui/badge.jsx`, `knowledge/TypeBadge`, `knowledge/DifficultyBadge`.
**Notes — "variants" without a `variant` prop:** `KnowledgeCard` is intentionally type-adaptive by *data shape*, not a prop switch — it renders `pattern` for `dsa` cards and `tagline` for `project` cards off the same conditional (`{pattern && ...}`, `{tagline && ...}`), because the summary projection already includes whichever field applies. It takes **canonical fields only** — no personal state (bookmark/pin/revision) — by design; see `RevisionCard` below for why that's a separate component instead of a prop on this one.

### `RevisionCard`
**Status:** to build — `components/knowledge/RevisionCard.jsx`
**Purpose:** A grid card for the Revision queue (`/revision`) and Dashboard's "Revision Due" rail — everything `KnowledgeCard` shows, plus the personal revision summary (last result, level, due date).
**Key props:** `knowledge: KnowledgeSummary`, `revision: { level: number, lastResult?: "forgot"|"shaky"|"confident", nextRevisionAt: Date }`.
**Composes:** `KnowledgeCard`'s constituent primitives (`ui/card.jsx`, `ui/badge.jsx`) plus `knowledge/TypeBadge`, `knowledge/DifficultyBadge` directly (not a wrapper around `KnowledgeCard` itself, to avoid threading an unused personal-state prop through a canonical-only component).
**Notes:** This is a **separate component, not a `KnowledgeCard` variant**, on purpose — `KnowledgeCard` reads only `Knowledge` fields; `RevisionCard` additionally needs a joined `UserProgress.revision` shape. Keeping that join at the call site (wherever `getDueForRevision` is consumed) rather than baking optional personal-state props into `KnowledgeCard` preserves the same canonical/personal separation `04-information-architecture.md` §4 (Layer 2 vs. Layer 4) draws at the schema level, at the component level too — a `dsa` card's grid tile shouldn't need to know revision state exists just because a sibling component does. Last-result renders as a small `Badge` (`destructive` for `forgot`, `outline` for `shaky`, `secondary` for `confident`) — reusing the same badge vocabulary as everything else, not a new color-coded status dot.

### `KnowledgeGrid`
**Status:** existing — `components/knowledge/KnowledgeGrid.jsx`
**Purpose:** The list-fetching + pagination wrapper around a grid of `KnowledgeCard`s — owns the `getKnowledgeList` query, loading skeletons, empty state, and page controls.
**Key props:** `params: object` (query params forwarded to `GET /knowledge`), `onPageChange: (page: number) => void`.
**Composes:** `knowledge/KnowledgeCard`, `ui/skeleton.jsx`, `ui/empty.jsx` (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`), `ui/button.jsx`.
**Notes:** This is the component `TypeListPage` (Practice/Interview/Projects), `ExploreCategoryPage`, and `SearchPage`'s result list all point at — a new list surface should reuse this rather than re-implementing pagination.

### `KnowledgeFilterBar` (Filters panel)
**Status:** existing — `components/knowledge/KnowledgeFilterBar.jsx`
**Purpose:** The horizontal filter row above a `KnowledgeGrid` — tag text filter, category/difficulty/company selects, sort order.
**Key props:** `filters: object`, `onChange: (next) => void`, `showCategory?: boolean` (default `true`), `showCompany?: boolean` (default `false`).
**Composes:** `ui/select.jsx`, `ui/input.jsx`; fetches its own dropdown data via `categoryApi.useGetCategoryTreeQuery` / `companyApi.useGetCompaniesQuery`.
**Notes:** Deliberately an inline row of `Select`s, not a sidebar drawer — matches `14-wireframes.md` §4's inline layout. Two concrete gaps worth flagging:
1. `14-wireframes.md` §4 shows active filters as removable chips (`{●difficulty: beginner} {●type: concept} [Clear filters]`); the current implementation is bare dropdowns with no "what's currently active" summary or one-click clear. A reasonable extension: render a small chip row (reusing `ui/badge.jsx`, `variant="secondary"`, with a trailing `X`) below the selects whenever any filter is non-default.
2. There's no `pattern` filter (the DSA-specific facet from `04-information-architecture.md` §3.2), even though `/practice` needs it. `pattern` is a freeform string on the `dsa` discriminator, not a managed taxonomy, so a `Select` needs a distinct-values source that doesn't exist in `07-api-design.md` today — flagging the gap here rather than inventing a backend endpoint out of scope for this document; the simplest unblocking step is a freeform `Input` alongside the existing `tags` filter, same pattern, no new endpoint required.

### `RelatedTopics`
**Status:** existing — `components/knowledge/RelatedTopics.jsx`
**Purpose:** Renders the last block of every Knowledge Card skeleton — resolved `relations[]`, grouped by relation type, both outbound and inbound (per `04-information-architecture.md` §7).
**Key props:** `slug: string`.
**Composes:** `knowledge/TypeBadge`; plain `<Link>` pills, no `ui/*` card primitive.
**Notes:** The `RELATION_LABEL` map covers all nine typed relations from `06-database-design.md` §4.1 — if a tenth relation type is ever added there, it must be added here too or it silently falls back to the raw enum string.

---

## 3. Badges & Facets

### `TypeBadge`
**Status:** existing — `components/knowledge/TypeBadge.jsx`
**Purpose:** The `concept`/`dsa`/`interview`/`project` indicator shown on every card and header.
**Key props:** `type: "concept"|"dsa"|"interview"|"project"`, `className?`.
**Composes:** `ui/badge.jsx` (`variant="outline"`).
**Notes:** Icon + label pairing (`BookOpenIcon`/`BinaryIcon`/`MessageSquareTextIcon`/`FolderKanbanIcon`), not color-coded — this is the reference example for "meaning via icon, not color" from `11-design-system.md`.

### `DifficultyBadge`
**Status:** existing — `components/knowledge/DifficultyBadge.jsx`
**Purpose:** `beginner`/`intermediate`/`advanced` indicator.
**Key props:** `difficulty: string`, `className?`.
**Composes:** `ui/badge.jsx` (`variant="secondary"`).
**Notes:** Plain text label, no traffic-light coloring — same restraint rule as `TypeBadge`.

### `CompanyBadge`
**Status:** to build — `components/knowledge/CompanyBadge.jsx`
**Purpose:** A company tag (Google, Amazon, ...) on DSA/Interview cards and the company facet filter — `Company` has `name`, `slug`, `logoUrl` (`06-database-design.md` §9).
**Key props:** `company: { name: string, logoUrl?: string }`, `size?: "sm"|"md"` (default `"sm"`).
**Composes:** `ui/avatar.jsx` (`Avatar`, `AvatarImage`, `AvatarFallback` — tiny logo, falls back to a generic `BuildingIcon` from lucide when `logoUrl` is absent) inside `ui/badge.jsx` (`variant="outline"`), matching `TypeBadge`'s icon-in-badge pattern rather than inventing a new pill shape.
**Notes:** Used wherever `knowledge.companies[]` is populated (DSA/Interview card headers) and in `KnowledgeFilterBar`'s company `Select` items once that dropdown needs richer rows than plain text.

---

## 4. Content Rendering

### `MarkdownRenderer`
**Status:** existing — `components/knowledge/MarkdownRenderer.jsx`
**Purpose:** The single markdown-to-DOM renderer used for every long-form field in the app (see `09-frontend-architecture.md` §6).
**Key props:** `content: string` (markdown), `className?`.
**Composes:** no `ui/*` primitives directly — `react-markdown` + `remark-gfm` + `rehype-highlight`, styled via Tailwind arbitrary descendant selectors keyed to design tokens (`bg-[var(--code-bg)]`, `border-border`).
**Notes:** Never instantiate `ReactMarkdown` directly anywhere else in the app — every markdown field, including inside admin previews, routes through this component so prose styling and highlighting stay in exactly one place.

### `CodeBlock`
**Status:** existing — `components/knowledge/CodeBlock.jsx`
**Purpose:** A single syntax-highlighted code snippet with a copy-to-clipboard button, plus one special case: a ` ```mermaid ` fenced block renders as a live `MermaidDiagram` instead of code text — this is what makes a mermaid diagram embeddable inline, anywhere inside a markdown field, not just via the one dedicated `content.visualization` field.
**Key props:** receives `children` from `ReactMarkdown`'s `pre` override (not called with `{language, code}` props directly — see Notes).
**Composes:** `ui/button.jsx`-style icon button (`CopyIcon`/`CheckIcon` from lucide swapped on a 1.5s timeout after a successful `navigator.clipboard.writeText`), `knowledge/MermaidDiagram` (mermaid-language branch only), reuses the `.hljs`/`--code-editor-*` theme from `index.css` (`11-design-system.md` §2.8) — no new highlighting dependency.
**Notes:** Wired in exactly one place — `MarkdownRenderer`'s `components={{ pre: CodeBlock }}` — so every fenced block inside any markdown field gets it, including one an admin drops in mid-paragraph via `MarkdownField`'s toolbar. `CodeExamplesList` does not call it directly; see below for why that's fine.

### `CodeExamplesList`
**Status:** existing — `components/knowledge/CodeExamplesList.jsx`
**Purpose:** Renders the "Code Examples" block of the skeleton — a list of `{label, language, code}` entries.
**Key props:** `examples: { label?: string, language?: string, code: string }[]`.
**Composes:** `MarkdownRenderer` — re-serializes each `{language, code}` into a fenced markdown string and renders it through the normal pipeline, which (now that `CodeBlock` exists and is wired into that pipeline) gets the identical copy-button-plus-real-colors treatment for free. This round-trip is a stylistic characteristic, not a gap to close — there's no known reason to refactor it into a direct `CodeBlock` call with structured props.

### `HighlightableContent`
**Status:** existing — `components/knowledge/HighlightableContent.jsx`
**Purpose:** Wraps `MarkdownRenderer` for the two highlightable blocks (`tldr`, `explanation`) — text-selection → color-swatch popover → persisted `Annotation`, plus DOM re-anchoring of existing highlights on every render. Full mechanics in `09-frontend-architecture.md` §6.2.
**Key props:** `knowledgeId: string`, `block: "tldr"|"explanation"`, `content: string`.
**Composes:** `knowledge/MarkdownRenderer`; the floating color-swatch toolbar is currently inline JSX inside this file (see `HighlightToolbar` below for the extraction recommendation).
**Notes:** Skips all annotation fetching/rendering entirely when there's no authenticated user (`skip: !user`) — anonymous/guest reading (if ever supported) degrades to plain `MarkdownRenderer` behavior with no highlight affordance, not a broken selection handler.

### `HighlightToolbar`
**Status:** to build (extraction) — `components/knowledge/HighlightToolbar.jsx`
**Purpose:** The floating color-swatch popover that appears on text selection — currently inlined inside `HighlightableContent`'s return JSX.
**Key props:** `position: { top: number, left: number }`, `colors: Record<string,string>` (defaults to the existing `{yellow, green, blue, pink}` map), `onPick: (colorName: string) => void`, `onCancel: () => void`.
**Composes:** nothing from `ui/*` — plain positioned `<div>` + `<button>`s, `XIcon` from lucide for cancel.
**Notes:** Pure presentational component with no data dependency of its own — extracting it out of `HighlightableContent` is a straightforward single-responsibility split (selection-handling logic stays in the parent; "what the floating picker looks like" moves here), and creates a reusable unit if a future mobile long-press selection flow needs the identical picker.

### `VisualizationBlock`
**Status:** existing — `components/knowledge/VisualizationBlock.jsx`
**Purpose:** Dispatches the "Visualization" skeleton block to the right renderer based on `content.visualization.kind`.
**Key props:** `visualization: { kind: "none"|"mermaid"|"flow", mermaidSource?: string, flow?: object }`.
**Composes:** `knowledge/MermaidDiagram`, `knowledge/FlowDiagram`.
**Notes:** Returns `null` for `kind === "none"` — the skeleton omits the section entirely rather than rendering an empty box, consistent with `14-wireframes.md` §5's "a section a card doesn't populate is omitted, never shown empty" rule.

### `MermaidDiagram`
**Status:** existing — `components/knowledge/MermaidDiagram.jsx`
**Purpose:** Renders a `mermaid` source string to SVG for a static diagram.
**Key props:** `source: string` (raw Mermaid syntax).
**Composes:** no `ui/*` primitives — `mermaid` directly, initialized once module-wide with a neutral `theme: "base"` + hardcoded `themeVariables`.
**Notes:** **Known gap** (detailed in `11-design-system.md`): `themeVariables` is hardcoded to the light-mode hex values and initialized exactly once (`let initialized` module guard), so a Mermaid diagram never re-themes for dark mode regardless of the app's active theme. Fixing this means either re-initializing on theme change (reading the resolved theme from `next-themes`' `useTheme()`) or switching the hardcoded hex values to read the live CSS custom properties at render time.

### `FlowDiagram` (read-only Diagram Canvas viewer)
**Status:** existing — `components/knowledge/FlowDiagram.jsx`
**Purpose:** Renders an admin-authored `{ nodes, edges }` React Flow payload as a **non-interactive** diagram inside a Knowledge Card.
**Key props:** `flow: { nodes: Node[], edges: Edge[] }`.
**Composes:** `@xyflow/react` (`ReactFlow`, `ReactFlowProvider`, `Background`, `Controls`) — no `ui/*` primitives. `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}` — this is deliberately a *viewer*, distinct from the editable authoring surface below.
**Notes:** The product philosophy calls the visualization "user-draggable" (`01-product-vision.md`) — that draggability is real but scoped to letting a *reader* rearrange the view for their own comprehension via React Flow's own pan/zoom/node-drag, which stays enabled; `nodesDraggable={false}` only disables *persisting* a moved node's position back to the canonical diagram (which would mutate shared admin-authored content from a read view — not allowed, per the canonical/personal separation).

### `DiagramCanvas` (editable Diagram Canvas — admin authoring)
**Status:** to build — `components/admin/DiagramCanvas.jsx`
**Purpose:** The drag-and-drop authoring surface for a `flow`-kind visualization, replacing `AdminEditorPage`'s current raw-JSON `Textarea` for `content.visualization.flowJson` (see the explicit "on the roadmap" comment already in that file).
**Key props:** `value: { nodes: Node[], edges: Edge[] }`, `onChange: (next) => void`.
**Composes:** `@xyflow/react` (`ReactFlow`, `ReactFlowProvider`, `Background`, `Controls`, `MiniMap`, `Panel`, plus `useNodesState`/`useEdgesState`/`addEdge` for local editing state), `ui/button.jsx` (an "Add node" control inside a `Panel`), `ui/sheet.jsx` (a selected-node inspector — label/description fields), `ui/input.jsx`/`ui/textarea.jsx` (inside that inspector).
**Notes:** This is squarely the `18-future-roadmap.md` item `AdminEditorPage.jsx` already points at — spec'd here so it has a concrete target. Until built, admins author flow diagrams by hand-pasting a React Flow JSON payload, which is workable but not the "draggable diagram builder" the product vision describes for the *authoring* side (the *reading* side, `FlowDiagram`, already delivers on the reader-facing half of that promise).

---

## 5. Personal Layer

### `RevisionControls`
**Status:** existing — `components/knowledge/RevisionControls.jsx`
**Purpose:** The bookmark/favorite/pin/mark-for-revision toggle row plus the forgot/shaky/confident recall buttons, rendered directly under the Knowledge Card header (and reused per-row on the Revision due-list page).
**Key props:** `knowledgeId: string`.
**Composes:** `ui/toggle.jsx`, `ui/button.jsx`, `ui/tooltip.jsx`, `ui/select.jsx` (status: not started/in progress/completed), `sonner`'s `toast`.
**Notes:** Renders nothing for an unauthenticated user (`if (!user) return null`) — the personal-state rail simply doesn't exist for a logged-out view, rather than rendering disabled controls. Each forgot/shaky/confident button shows its actual next interval before being clicked (e.g. "Forgot · 10m"), computed client-side from a small mirror of the backend's interval table, and submitting shows a toast with when the card will resurface. Deliberately does **not** display `revision.level` as a number, progress bar, or "Level X" label anywhere — `03-srs.md` FR-PROG-09 permanently bans displaying levels/streaks/scores; an earlier draft added exactly such a label and it was removed for that reason.

### `PersonalNotes`
**Status:** existing — `components/knowledge/PersonalNotes.jsx`
**Purpose:** The free-text "My Notes" block at the bottom of every Knowledge Card — private per-user, autosaved.
**Key props:** `knowledgeId: string`.
**Composes:** `ui/textarea.jsx`.
**Notes:** Debounced autosave (800ms after the last keystroke) directly against `updateProgress`, no explicit save button — "Saved" text appears after the mutation resolves.

### `Timeline`
**Status:** to build — `components/knowledge/Timeline.jsx`
**Purpose:** A vertical chronological list, for two concrete uses: (1) a project case-study's Challenges/Decisions sequence, (2) the Dashboard/Profile "Recent Activity" feed.
**Key props:** `entries: { icon?: LucideIcon, title: string, description?: string, timestamp: string|Date, meta?: string }[]`.
**Composes:** `ui/item.jsx` (`ItemGroup`, `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemSeparator`) — `item.jsx`'s existing shape (media slot + content + separator) maps directly onto a timeline row without inventing new DOM structure.
**Notes:** **Concrete, immediately-usable gap:** `dashboardApi.getDashboard`'s response already includes `recentActivity[]` (`07-api-design.md` §11) and `14-wireframes.md` §2 shows a "RECENT ACTIVITY" section ("you revised 'Two Sum' — confident · 2h ago"), but `DashboardPage.jsx` does not render it today — the data is already fetched by the existing `useGetDashboardQuery()` call, there's simply no render branch for it. Building `Timeline` and adding one `<Timeline entries={data.recentActivity}/>` section to `DashboardPage` closes this gap with no new query.

---

## 6. Resources & Media

### `ResourceCard`
**Status:** to build — `components/shared/ResourceCard.jsx`
**Purpose:** One external learning resource (`Resource` — `title, url, kind, description`, `06-database-design.md` §7) as a consistent row/tile, replacing two independent hand-rolled implementations.
**Key props:** `resource: { title: string, url: string, kind: string, description?: string }`.
**Composes:** `ui/item.jsx` (`Item`, `ItemMedia` — an icon keyed off `kind`: docs/article/blog/github/book/video/pdf/research_paper/cheatsheet each get a distinct lucide icon, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions` — an `ExternalLinkIcon`).
**Notes:** `KnowledgeDetailPage.jsx`'s "Resources" block and (presumably) `ResourcesPage.jsx` currently hand-roll their own `<a>` grid markup independently rather than sharing a component — extracting both onto `ResourceCard` removes that duplication and is the natural place to add `kind`-based grouping/iconography that neither does today.

### `AttachmentViewer`
**Status:** to build — `components/shared/AttachmentViewer.jsx`
**Purpose:** Renders a project's `gallery[]` (Cloudinary `Attachment` refs) as a thumbnail grid with a full-size lightbox.
**Key props:** `attachments: { _id: string, url: string, resourceType: "image"|"video"|"raw" }[]`, `onRemove?: (id: string) => void` (admin edit-mode only).
**Composes:** `ui/attachment.jsx` (`Attachment`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction`, `AttachmentTrigger`) for the grid, `ui/dialog.jsx` for the lightbox triggered by `AttachmentTrigger`.
**Notes:** `AdminEditorPage.jsx`'s project gallery field currently renders raw `<img>` tags with a hand-built remove button rather than `ui/attachment.jsx` at all — swapping it onto `AttachmentViewer` (with `onRemove` wired) unifies the admin edit-mode gallery and the public-read gallery onto one component instead of two divergent implementations.

---

## 7. Admin Authoring Primitives

### `RepeatableRows`
**Status:** existing — `components/admin/RepeatableRows.jsx`
**Purpose:** Generic "list of small objects" editor — shared by every array-of-objects admin field: `codeExamples`, `mistakes`, `interviewQuestions`, `challenges`, `decisions`.
**Key props:** `label: string`, `items: object[]`, `onChange: (next) => void`, `fields: { key: string, label: string, type?: "text"|"textarea"|"markdown" }[]`, `addButtonLabel?: string`.
**Composes:** `ui/button.jsx`, `ui/input.jsx`, `ui/textarea.jsx`, `ui/label.jsx`, `admin/MarkdownField` (for `type: "markdown"` fields).
**Notes:** This single component is why `AdminEditorPage.jsx` doesn't have five bespoke row editors — any future array-of-objects field (on any discriminator) should reach for this before writing a new one. `type: "markdown"` is used for the sub-fields that `MarkdownRenderer` actually renders on the public side (`mistakes[].explanation`, `interviewQuestions[].idealAnswer`, `challenges[].description`) — plain `"textarea"` is used for fields that render as plain text (`decisions[].rationale`/`alternativesConsidered`, `interviewQuestions[].followUps`/`commonMistakes`), since giving those the markdown toolbar would let an admin embed an image/diagram that then renders as literal broken markdown text on the public page.

### `LineListEditor`
**Status:** existing — `components/admin/LineListEditor.jsx`
**Purpose:** "One item per line" editor for plain string-array fields (`hints`, `techStack`, `lessonsLearned`, `improvements`).
**Key props:** `label?: string`, `value: string[]`, `onChange: (next: string[]) => void`, `placeholder?: string`.
**Composes:** `ui/label.jsx`, `ui/textarea.jsx`.
**Notes:** Splits on newline and trims/drops blanks on every change — no "add" button, no per-row delete UI, intentionally the lightest possible editor for a plain string array.

### `MarkdownField`
**Status:** existing — `components/admin/MarkdownField.jsx`
**Purpose:** The markdown authoring field used on every long-form Knowledge Card field — a `Textarea` plus a small toolbar (Image, Diagram) and a Write/Preview toggle, so an admin can embed a Cloudinary image or a mermaid diagram inline, at the cursor, anywhere in the text, instead of only via the one dedicated `content.visualization` field.
**Key props:** `label?: string`, `value: string`, `onChange: (next: string) => void`, `placeholder?: string`, `className?: string` (sets the min-height shared between Write and Preview).
**Composes:** `ui/textarea.jsx`, `ui/button.jsx`, `ui/tabs.jsx` (Write/Preview), `knowledge/MarkdownRenderer` (Preview mode — the exact same renderer the public page uses, so what an admin sees in Preview is what a reader will see), `store/api/uploadApi`'s `useUploadFileMutation`.
**Notes:** The `Textarea` stays mounted (visually hidden via a `hidden` class, not conditionally unmounted) while in Preview mode specifically so its ref and cursor position survive the tab switch — a toolbar click right after switching back to Write needs a live ref, and conditional unmounting would drop it at exactly that moment. Image insertion uses the native `HTMLTextAreaElement.setRangeText` API to splice at the cursor synchronously, rather than manual `selectionStart`/`selectionEnd` math plus a `requestAnimationFrame` cursor-restoration race.

### `KnowledgeCombobox`
**Status:** existing — `components/admin/KnowledgeCombobox.jsx`
**Purpose:** Title-search picker for referencing another Knowledge card (relation targets, a project's "real example" reference) — replaces a plain text input where an admin previously had to type a target card's machine slug from memory.
**Key props:** `value?: string` (display title), `onSelect: (item: { slug, title, ... }) => void`, `excludeSlug?: string` (omit the card currently being edited from its own results), `placeholder?: string`.
**Composes:** `ui/combobox.jsx` (Base UI `Combobox` — search-as-you-type input with a results list rendered below it), `store/api/knowledgeApi`'s search query.
**Notes:** Returns the full matched item (`{slug, title, ...}`) via `onSelect`, so the caller can persist both the machine `slug` and a human `title` for display — this is what closed two complaints at once: dropdowns/inputs surfacing raw IDs/slugs instead of names, and a "one select, results appear below it" search pattern where a plain `Select` full of hundreds of cards would be unusable.

---

## 8. Feedback & Utility Conventions

Not bespoke components so much as fixed usage patterns — listed here because "which primitive renders a loading/empty/toast state" should be a single answer, not a per-page choice.

| Concern | Component | Composes | Convention |
|---|---|---|---|
| Full-page/section loading | `shared/PageLoader.jsx` (existing) | `ui/spinner.jsx` | Centered spinner, `min-h-[50vh]` — used for `isLoading` (first fetch), never `isFetching` |
| List/grid loading | inline in each list component | `ui/skeleton.jsx` | Skeletons sized to the *final* grid dimensions, not a generic block — see `09-frontend-architecture.md` §8 |
| Zero results | inline in each list/page | `ui/empty.jsx` | `Empty > EmptyHeader > EmptyMedia + EmptyTitle + EmptyDescription`, optional `EmptyContent` for a recovery action (`NotFoundPage`'s "Back to Dashboard" button) |
| Transient success/error (mutations) | global `<Toaster/>` in `App.jsx` | `ui/sonner.jsx` | `toast.success(...)` / `toast.error(error.message)` — already the pattern in `AdminEditorPage.jsx`; never a custom inline banner for a mutation result |
| Catastrophic render failure | `shared/ErrorBoundary.jsx` (to build) | — | See `09-frontend-architecture.md` §7 — last-resort net, not the primary error path |

---

## 9. Full Inventory (quick reference)

| Component | Status | Path |
|---|---|---|
| AppLayout | existing | `components/layout/AppLayout.jsx` |
| AppSidebar | existing | `components/layout/AppSidebar.jsx` |
| Navbar | existing | `components/layout/Navbar.jsx` |
| SearchPalette | existing | `components/layout/SearchPalette.jsx` |
| ThemeProvider / ThemeToggle | existing | `components/layout/ThemeProvider.jsx`, `ThemeToggle.jsx` |
| PageHeader | existing | `components/shared/PageHeader.jsx` |
| PageLoader | existing | `components/shared/PageLoader.jsx` |
| GoogleIcon | existing | `components/shared/GoogleIcon.jsx` |
| GithubIcon | **to build** (referenced by `LoginPage.jsx`, file missing) | `components/shared/GithubIcon.jsx` |
| PageBreadcrumb | to build | `components/shared/PageBreadcrumb.jsx` |
| ResourceCard | to build | `components/shared/ResourceCard.jsx` |
| AttachmentViewer | to build | `components/shared/AttachmentViewer.jsx` |
| ErrorBoundary / ErrorFallback | to build | `components/shared/ErrorBoundary.jsx`, `ErrorFallback.jsx` |
| KnowledgeCard | existing | `components/knowledge/KnowledgeCard.jsx` |
| RevisionCard | to build | `components/knowledge/RevisionCard.jsx` |
| KnowledgeGrid | existing | `components/knowledge/KnowledgeGrid.jsx` |
| KnowledgeFilterBar | existing (extend — chips, pattern filter) | `components/knowledge/KnowledgeFilterBar.jsx` |
| TypeBadge | existing | `components/knowledge/TypeBadge.jsx` |
| DifficultyBadge | existing | `components/knowledge/DifficultyBadge.jsx` |
| CompanyBadge | to build | `components/knowledge/CompanyBadge.jsx` |
| RelatedTopics | existing | `components/knowledge/RelatedTopics.jsx` |
| MarkdownRenderer | existing | `components/knowledge/MarkdownRenderer.jsx` |
| CodeBlock | existing (mermaid-fence special case) | `components/knowledge/CodeBlock.jsx` |
| CodeExamplesList | existing | `components/knowledge/CodeExamplesList.jsx` |
| HighlightableContent | existing | `components/knowledge/HighlightableContent.jsx` |
| HighlightToolbar | to build (extraction) | `components/knowledge/HighlightToolbar.jsx` |
| VisualizationBlock | existing | `components/knowledge/VisualizationBlock.jsx` |
| MermaidDiagram | existing (fix — dark mode) | `components/knowledge/MermaidDiagram.jsx` |
| FlowDiagram (viewer) | existing | `components/knowledge/FlowDiagram.jsx` |
| DiagramCanvas (editor) | to build | `components/admin/DiagramCanvas.jsx` |
| InterviewQuestionsList | existing | `components/knowledge/InterviewQuestionsList.jsx` |
| RevisionControls | existing | `components/knowledge/RevisionControls.jsx` |
| PersonalNotes | existing | `components/knowledge/PersonalNotes.jsx` |
| Timeline | to build | `components/knowledge/Timeline.jsx` |
| RepeatableRows | existing | `components/admin/RepeatableRows.jsx` |
| LineListEditor | existing | `components/admin/LineListEditor.jsx` |
| MarkdownField | existing | `components/admin/MarkdownField.jsx` |
| KnowledgeCombobox | existing | `components/admin/KnowledgeCombobox.jsx` |
