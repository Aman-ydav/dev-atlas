# 11 — Design System

> Documents the actual design tokens as they exist today in `frontend/src/index.css`, verbatim — not an aspirational palette. Where the implementation deviates from its own stated rules (and it does, in a few specific, verifiable places), this document names the deviation and the fix rather than silently "documenting the intent." Component-level composition lives in `10-component-library.md`; architectural wiring (how theming is plumbed through React) lives in `09-frontend-architecture.md` §4.

## 1. Philosophy

DevAtlas is a knowledge tool, not a marketing site, and the visual language is built to say so on every screen. There is exactly one accent-shaped decision available to any component: **type weight, spacing, and a lucide icon carry meaning — color does not.** No gradients. No glow or neon effects. No drop shadows used as decoration. No second brand color introduced anywhere in the product surface. The palette is grayscale (oklch, chroma 0) with a single, narrow, semantic exception for destructive/error states. This isn't a placeholder aesthetic waiting for a "real" brand pass — it's the deliberate answer to what this product is: a place to read, learn, and think, where a saturated color competing for attention against 2,000 words of technical explanation is a bug, not a feature. Every rule below exists in service of that one sentence.

---

## 2. Color System

### 2.1 Two token layers — and why both exist

`index.css` actually defines **two parallel color-token systems**, layered on top of each other in the same `:root` block:

1. **Content tokens** (`--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`) — a small, hand-authored set styling raw HTML selectors directly (`body`, `h1`, `h2`, `code`). The `#root` styling comment in the same file (*"Was a centered/max-width landing-page shell from the Vite starter template..."*) confirms these predate the shadcn integration — they're what's left of the original Vite-starter/blog-style theme.
2. **Component tokens** (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent-foreground`, `--destructive`, `--input`, `--ring`, `--chart-1..5`, `--sidebar*`) — the standard shadcn semantic palette, re-exposed to Tailwind v4 via `@theme inline` (`--color-background: var(--background)`, etc.), which is what every `ui/*.jsx` primitive and every `bg-*`/`text-*`/`border-*` utility class in product code actually consumes.

Both sets are real, both are in active use, and — this is the important part — **they respond to dark mode through two different mechanisms** (§2.4).

### 2.2 Content tokens (light / dark)

| Token | Light | Dark | Used by |
|---|---|---|---|
| `--text` | `#6b6375` | `#9ca3af` | `:root` inherited text color (superseded in practice by `body{@apply text-foreground}` for body copy) |
| `--text-h` | `#08060d` | `#f3f4f6` | `h1, h2 { color: var(--text-h) }` — see §2.4 for why this one is worth double-checking in-browser |
| `--bg` | `#fff` | `#16171d` | `:root` inherited background (superseded by `body{@apply bg-background}` in practice) |
| `--border` | `oklch(0.922 0 0)` | `#2e303a` | Shared with the component layer — see §2.4 |
| `--code-bg` | `#f4f3ec` | `#1f2028` | Inline `code` background; `MarkdownRenderer`'s `bg-[var(--code-bg)]` arbitrary classes; hardcoded (not variable-driven) into `MermaidDiagram`'s theme — see §2.6 |
| `--accent` | `oklch(0.97 0 0)` | `#c084fc` | Mapped to Tailwind's `bg-accent`/`text-accent` via `@theme inline` — see §2.4, this is the one with real visible impact |
| `--accent-bg` | `rgba(170,59,255,0.1)` | `rgba(192,132,252,0.15)` | Not observed in use by any component read for this doc — likely more starter-template residue |
| `--accent-border` | `rgba(170,59,255,0.5)` | `rgba(192,132,252,0.5)` | Same as above |
| `--social-bg` | `rgba(244,243,236,0.5)` | `rgba(47,48,58,0.5)` | Paired with a `#social .button-icon` rule that has no matching element anywhere in the app — dead CSS from the same starter template |
| `--shadow` | `rgba(0,0,0,.1) 0 10px 15px -3px, rgba(0,0,0,.05) 0 4px 6px -2px` | `rgba(0,0,0,.4) 0 10px 15px -3px, rgba(0,0,0,.25) 0 4px 6px -2px` | Consumed directly (`shadow-(--shadow)`) by the highlight color-swatch popover in `HighlightableContent.jsx` |

Note the light values for `--accent-bg`/`--accent-border` are `rgba(170, 59, 255, ...)` and dark's are `rgba(192, 132, 252, ...)` — both are **purple** (violet ~`#aa3bff` / ~`#c084fc`), not neutral, in *both* themes. These three accent tokens (`--accent`, `--accent-bg`, `--accent-border`) are the one place a real brand-style color survives anywhere in the token set, and per §1 they shouldn't — see §2.4 for exactly where this leaks into visible UI and the recommended fix.

### 2.3 Component (shadcn) tokens (light / dark)

All grayscale (oklch chroma `0`) except the two flagged rows.

| Token | Light | Dark |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.145 0 0)` / `oklch(0.985 0 0)` |
| `--card` / `--card-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--popover` / `--popover-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--primary` / `--primary-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | `oklch(0.922 0 0)` / `oklch(0.205 0 0)` |
| `--secondary` / `--secondary-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` |
| `--muted` / `--muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | `oklch(0.269 0 0)` / `oklch(0.708 0 0)` |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` *(red)* | `oklch(0.704 0.191 22.216)` *(red)* — **intentional exception, see §2.5** |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |
| `--chart-1` … `--chart-5` | `0.87 → 0.269` lightness ramp, chroma `0` | identical to light | **Unused — see §2.7** |
| `--radius` | `0.625rem` | — (not theme-dependent) |
| `--sidebar` / `--sidebar-foreground` | `oklch(0.985 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` |
| `--sidebar-primary` / `-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | **`oklch(0.488 0.243 264.376)`** *(blue)* / `oklch(0.985 0 0)` — **unintentional exception, see §2.6** |
| `--sidebar-accent` / `-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

### 2.4 Known inconsistency — the content-token set doesn't fully follow the in-app theme toggle

`ThemeProvider` toggles dark mode by adding/removing a `.dark` class on `<html>` (`09-frontend-architecture.md` §4.1). The **component tokens** in §2.3 are entirely defined by that mechanism (`:root` = light, `.dark` = dark) and behave correctly under every combination of OS preference and in-app choice. The **content tokens** in §2.2 do not — they're overridden exclusively inside `@media (prefers-color-scheme: dark) { :root { ... } }`, a block that reacts to **OS preference**, not the `.dark` class, and most of them are never redeclared inside `.dark { }` at all. Concretely, splitting §2.2's ten tokens by how much `.dark`-class coverage they actually have:

- **`--border` and `--accent`** *are* redeclared inside `.dark { }` (`oklch(1 0 0 / 10%)` and `oklch(0.269 0 0)` respectively) — so they resolve correctly in three of four OS/app-theme combinations. The one combination that still breaks: **OS set to dark, DevAtlas explicitly set to Light** (a fully realistic case — someone runs a dark OS globally but prefers a light reading surface here). In that combination `.dark` is absent, so only the media query applies, handing both tokens their *dark* values on what's supposed to be a light-themed page: `--accent` becomes `#c084fc` (purple) and `--border` becomes `#2e303a` (opaque dark slate) instead of the intended light values. Since `--border` is what `@layer base { * { @apply border-border ...} }` applies to literally every element by default, and `--accent`/`--color-accent` is what `bg-accent` resolves to — the standard shadcn "hovered/highlighted row" utility used by `select.jsx`, `dropdown-menu.jsx`, `combobox.jsx`, `menubar.jsx`, and `context-menu.jsx` — the visible symptom is dark, muddy borders on an otherwise-light page, and a **purple** hover highlight on select options / dropdown menu items / the admin editor's many `Select` fields, in that one specific combination.
- **`--text`, `--text-h`, `--bg`, `--code-bg`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`** are *never* redeclared inside `.dark { }` at all — their value is 100% a function of OS preference and completely deaf to whichever theme the user actually picked in DevAtlas. The sharpest consequence is `--text-h`: `h1, h2 { color: var(--text-h) }` is a plain, unlayered CSS rule (it sits outside the `@layer base {}` block at the bottom of the file), while Tailwind utility classes like a component's own `text-foreground` are generated inside Tailwind's utilities layer — and per the CSS Cascade Layers specification, an unlayered rule always wins over a layered one regardless of specificity. That means the raw `h1, h2` selector's color wins even on headings that explicitly carry a `text-foreground` class (e.g. `KnowledgeDetailPage.jsx`'s `<h1 className="... text-foreground">`). Combine that with `--text-h` being OS-preference-only: a user whose OS is light but who explicitly picks Dark inside DevAtlas would get every shadcn token correctly flipped to dark (`--background` → near-black) while `--text-h` stays pinned to its light value (`#08060d`, near-black) — rendering every `<h1>`/`<h2>` in near-black text on a near-black background. **This is worth confirming visually** (a five-second check: force the OS to light, toggle DevAtlas to Dark, look at any page title), but the mechanism producing it is unambiguous from the CSS as written.

**Recommended fix**, in order of thoroughness: the minimal patch is duplicating all eight orphaned content-token dark values into `.dark { }` so both mechanisms fully agree (keeping the `@media` block purely as the pre-hydration/no-JS fallback `ThemeToggle.jsx`'s own code comment already documents that role for). The more durable fix is retiring the content-token set entirely — migrate the raw `body`/`h1`/`h2`/`code` selectors onto the component tokens directly (`color: var(--foreground)` instead of `var(--text)`, etc.) so there is exactly one palette and one theming mechanism in the file, not two that happen to agree most of the time.

### 2.5 Semantic exception: `--destructive`

The one color the palette is *supposed* to carry, in both themes: destructive/error/mistake affordances (`Badge variant="destructive"`, form validation, the delete button on an admin row). This is the industry-standard, product-accepted exception to a neutral palette — a red is a function, not a brand accent, and every restrained design system still keeps one. Nothing here needs fixing.

### 2.6 Unintentional exceptions — flagged for cleanup

Two color values in the token set are **not** semantic and **not** covered by §2.5's exception — both look like leftover shadcn-generator defaults that were never neutralized when the rest of the palette was:

- **`--sidebar-primary` in dark mode** (`oklch(0.488 0.243 264.376)` — a saturated blue, chroma `0.243`, hue ~264°) is the only chart/UI token anywhere in the entire palette that isn't chroma-`0`, and it has no functional justification the way `--destructive` does. It isn't observed being consumed by any component read for this document (`AppSidebar.jsx` doesn't appear to trigger the `SidebarMenuButton` "primary" variant that would surface it), so it may be dormant today — but it's a live grenade for the next person who reaches for a sidebar "active/primary" treatment and gets an unexpected blue instead of the neutral the rest of the system promises. **Fix:** strip the chroma/hue, keep the lightness — `oklch(0.488 0 0)` — a pure desaturation that doesn't otherwise change contrast against `--sidebar-primary-foreground`.
- **`--accent` / `--accent-bg` / `--accent-border` in the content-token set** (§2.2) are purple in both themes, not just dark — this is the same starter-template residue noted in §2.1, and per §2.4, `--accent` specifically has a real, live consumer (`bg-accent` on select/dropdown/menu hover states) via the `@theme inline` mapping. **Fix:** set light `--accent` to a neutral consistent with `--secondary`/`--muted` (`oklch(0.97 0 0)` — coincidentally already correct in light mode today) and dark `--accent` to the shadcn dark set's own neutral `--secondary`/`--muted` value (`oklch(0.269 0 0)`, which not coincidentally is exactly what `.dark`'s own `--accent` declaration already uses — the fix here is really just deleting the conflicting media-query override so `.dark`'s already-correct value stops getting fought, per §2.4).

### 2.7 Unused scaffolding: `--chart-1` … `--chart-5`

These exist because `ui/chart.jsx` (a real file in `components/ui/`) generates them by default, and `recharts` sits in `package.json` as that primitive's dependency — but per the product's explicit "no vanity analytics/charts" rule (`01-product-vision.md`), nothing in DevAtlas has a reason to mount a chart. Dashboard's numbers (`totalCardsViewed`, `totalBookmarks`, `totalRevisionsDone`) render as plain `Badge`s in `DashboardPage.jsx`, not a `recharts` visualization. Treat `chart.jsx`/`--chart-*` as present-but-intentionally-unused scaffolding from the shadcn generator, not a component to reach for — if a future screen seems to want a chart, that's a product-philosophy conversation first, not a "the token already exists" green light.

### 2.8 Semantic exception: code block syntax highlighting

A second deliberate, permanent exception alongside §2.5's `--destructive` — real syntax color inside fenced code blocks (`--code-editor-bg`, `--code-editor-keyword`, `--code-editor-string`, etc., a VS Code Dark+ palette defined once in `index.css`'s `:root` and consumed by `.hljs-*` rules). Three things make this different from an "unintentional exception" like §2.6:

- **Fixed dark, not theme-responsive.** Unlike every other token in this document, `--code-editor-*` is declared only under `:root`, never redeclared under `.dark` — a code block looks identical regardless of whether the page is in light or dark mode, the same convention GitHub/VS Code docs/most technical sites use. This is intentional, not a missed dark-mode pass.
- **Scoped narrowly.** Only `CodeBlock.jsx` (the `pre` override `MarkdownRenderer` wires in) and the `.hljs-*` rules consume these variables. Inline `` `code` `` spans (not inside a fenced block) still use the ordinary theme-responsive `--code-bg` token from §2.2 — the exception is specifically for multi-line fenced blocks, not all code-shaped text.
- **The reasoning:** a code block is content, not UI chrome. The no-gradient/no-glow/grayscale rule (§9) exists to keep *interface* elements from competing for attention — it was never meant to make a JS snippet as hard to scan as it would be in a plain-text editor. Real syntax color is what "reads like a code editor" means; a monochrome code block reads as broken, not restrained.

Don't treat this as license to add color elsewhere "because code blocks have it" — it's exactly as narrow as §2.5's red, just for a different content type.

### 2.9 Semantic exception: highlighter marks

A third deliberate exception, same shape as §2.5 and §2.8: the text-highlighter feature (`HighlightableContent.jsx`) lets a signed-in reader select a phrase in a `tldr`/`explanation` block and mark it in one of six colors, the same way a physical highlighter pen works on paper. This has been real, shipped product behavior since before this document existed (`Annotation.color`, `HIGHLIGHT_COLORS` in `backend/src/constants.js`) — it just wasn't tokenized or documented yet, and its dark-mode behavior was broken (see below).

| Token pair | Light | Dark |
|---|---|---|
| `--highlight-yellow-bg` / `-fg` | `oklch(0.93 0.14 95)` / `oklch(0.32 0.09 95)` | `oklch(0.4 0.1 95)` / `oklch(0.94 0.09 95)` |
| `--highlight-green-bg` / `-fg` | `oklch(0.92 0.11 155)` / `oklch(0.3 0.09 155)` | `oklch(0.38 0.09 155)` / `oklch(0.92 0.09 155)` |
| `--highlight-blue-bg` / `-fg` | `oklch(0.91 0.06 250)` / `oklch(0.32 0.1 250)` | `oklch(0.38 0.08 250)` / `oklch(0.92 0.06 250)` |
| `--highlight-pink-bg` / `-fg` | `oklch(0.91 0.07 350)` / `oklch(0.35 0.13 350)` | `oklch(0.38 0.1 350)` / `oklch(0.92 0.07 350)` |
| `--highlight-purple-bg` / `-fg` | `oklch(0.91 0.07 300)` / `oklch(0.34 0.12 300)` | `oklch(0.38 0.1 300)` / `oklch(0.92 0.07 300)` |
| `--highlight-orange-bg` / `-fg` | `oklch(0.9 0.13 55)` / `oklch(0.33 0.11 55)` | `oklch(0.38 0.11 55)` / `oklch(0.93 0.1 55)` |

Purple and orange are new (the original set was yellow/green/blue/pink); both were added in the same pass that tokenized the rest, on the reasoning that a highlighter with more color choices is more useful, not less restrained — these mark *content the reader chose to emphasize*, not UI chrome, so they don't compete with §1's "color does not carry meaning in the interface" rule any more than §2.8's code syntax colors do.

**What was actually broken before tokenization:** `HighlightableContent.jsx` built each `<mark>` with an inline `style.backgroundColor` set to a hardcoded hex and `style.color: inherit`. `inherit` resolved to `--foreground` — near-black in light mode, near-white in dark — completely decoupled from the fixed light-pastel background, so dark mode rendered near-white text on a near-white-ish pastel highlight (the reported bug: highlighted text unreadable in dark mode). Each color is now a single `.highlight-{color}` class carrying both a `bg` and a matching `fg` from the table above, so the pair always swaps together with `.dark` instead of `fg` drifting off on its own. All twelve pairs (six colors × two modes) were checked against real WCAG contrast math (OKLCH → linear sRGB → relative luminance), same bar `--muted-foreground`'s code comment already holds itself to — every pair lands between 7.6:1 and 10.6:1 text-on-highlight contrast, comfortably past the 4.5:1 AA floor for normal text in both themes.

---

## 3. Radius Scale

One base token, everything else derived by `calc()` in `@theme inline` — there is no independently-authored radius per size:

| Token | Formula | Value |
|---|---|---|
| `--radius` (base) | — | `0.625rem` (10px) |
| `--radius-sm` | `var(--radius) * 0.6` | `0.375rem` (6px) |
| `--radius-md` | `var(--radius) * 0.8` | `0.5rem` (8px) |
| `--radius-lg` | `var(--radius) * 1` | `0.625rem` (10px) |
| `--radius-xl` | `var(--radius) * 1.4` | `0.875rem` (14px) |
| `--radius-2xl` | `var(--radius) * 1.8` | `1.125rem` (18px) |
| `--radius-3xl` | `var(--radius) * 2.2` | `1.375rem` (22px) |
| `--radius-4xl` | `var(--radius) * 2.6` | `1.625rem` (26px) |

Changing the visual "roundedness" of the entire product is a one-line edit (`--radius`) — no component should ever hardcode a `rounded-[Npx]` arbitrary value instead of one of the `rounded-{sm,md,lg,xl,2xl,3xl,4xl}` utilities this scale backs.

---

## 4. Typography

**Font stack:** `'Geist Variable', sans-serif` is the intended product font (`@theme inline`'s `--font-sans`, loaded via `@import "@fontsource-variable/geist"`), applied at the `html` level via `@layer base { html { @apply font-sans } }`. A separate raw variable, `--sans: system-ui, 'Segoe UI', Roboto, sans-serif`, is used only by the unlayered `:root { font: 18px/145% var(--sans); }` shorthand — a leftover from the same pre-shadcn starter template as §2.1's content tokens. Per the same cascade-layers mechanism as §2.4 (unlayered beats layered), this raw shorthand's `system-ui` stack likely takes precedence over the layered `@apply font-sans` at the root level — worth a quick in-browser check (inspect a heavy-text page and confirm the rendered `font-family` is actually Geist, not the system UI font) and, if confirmed, resolved by either deleting the `font:` shorthand from the unlayered `:root` block or pointing `--sans` at the same `'Geist Variable', sans-serif` stack so both variables agree regardless of which one wins.

**Monospace:** `--mono: ui-monospace, Consolas, monospace` — code blocks, inline `code`, and every `font-mono` utility (form fields for markdown/JSON entry in `AdminEditorPage.jsx`).

| Element | Size / line-height | Notes |
|---|---|---|
| Root (`:root`) | `18px` / `145%`, `letter-spacing: 0.18px` | Drops to `16px` at `max-width: 1024px` |
| `h1` | `56px`, `letter-spacing: -1.68px`, `margin: 32px 0` | `36px` / `20px 0` at ≤1024px — this is the raw-CSS heading rule, distinct from the `text-2xl`/`text-xl` Tailwind classes actual page headers use (see §2.4's `--text-h` note — the *color* of these headings is the flagged issue, not the size rule) |
| `h2` | `24px`, `line-height 118%`, `letter-spacing -0.24px` | `20px` at ≤1024px |
| Prose body (`MarkdownRenderer`) | `0.95rem`, `leading-relaxed` | Set directly on the renderer, independent of the root `18px` |
| Prose `h1`/`h2`/`h3` (inside rendered markdown) | `text-lg` / `text-base` / `text-sm`, all `font-semibold` | Deliberately smaller than the raw document-level `h1`/`h2` above — a card's own `<h1>` (the title) must outrank any `# Heading` inside its markdown body |
| Inline `code` | `15px`, `line-height 135%`, `4px 8px` padding | `--code-bg` background, `--mono` stack |
| UI chrome (buttons, badges, nav) | Tailwind defaults (`text-sm`/`text-xs`) | No custom UI-chrome type scale — this layer intentionally rides on stock Tailwind sizes, only the document/prose layer above has bespoke values |

---

## 5. Spacing

DevAtlas does not define a custom spacing scale — `index.css` has no `--spacing-*` tokens, unlike color and radius. Spacing discipline here is **procedural, not tokenized**: every component read for this document consistently draws from Tailwind v4's stock 0.25rem-multiple scale (`gap-2`, `gap-3`, `px-4`, `py-4`, `space-y-6`, `space-y-8` recur constantly across `AppLayout`, `KnowledgeDetailPage`, `AdminEditorPage`, every card), and none reach for an arbitrary pixel value (`p-[13px]`) or an off-scale number. Keep it that way by convention rather than introducing a formal spacing-token layer that would just duplicate Tailwind's own scale — the restraint is enforceable by code review (does this new class use a value already common elsewhere?), not by a token that doesn't exist yet.

---

## 6. Elevation & Shadow

Two distinct mechanisms, used for two distinct purposes — don't cross them:

- **Static, in-flow surfaces (cards, list rows) use `border`, never `shadow`.** Every card component (`KnowledgeCard`, the category tiles in `ExplorePage`, the pinned/continue-learning rails in `DashboardPage`) is `border border-border` with a `hover:border-foreground/20` shift on interaction — no `shadow-md`/`shadow-lg` anywhere in that set. This is the primary way "this is a distinct, clickable unit" gets communicated, and it's cheaper visually than a shadow: a border doesn't imply the surface is floating above the page, which would be a strange claim for a card sitting in a normal document-flow grid.
- **Genuinely floating/overlaid layers use shadow.** Popovers, dropdowns, dialogs, and the highlight color-swatch toolbar sit *above* page content and need to visually separate from whatever's behind them — these lean on either the base-ui/shadcn primitive's own generated shadow utility or, for the one hand-built floating element (`HighlightableContent`'s selection toolbar), the dedicated `--shadow` custom property (`shadow-(--shadow)`) from §2.2.

Rule of thumb for new components: if it scrolls with the page, it gets a border; if it floats above the page and can be dismissed, it gets a shadow.

---

## 7. Iconography

**Library:** `lucide-react` exclusively (`components.json`'s `iconLibrary: "lucide"`) — no other icon set, no hand-drawn SVGs except the two OAuth brand marks (`GoogleIcon`, and `GithubIcon` once built — see `10-component-library.md` §9) which are logos, not UI icons, and are exempt from the "no color" rule for the same reason a payment form doesn't desaturate the Visa logo.

**Sizing:** consistently one of Tailwind's `size-3` / `size-3.5` / `size-4` / `size-5` utilities depending on context (a badge's leading icon is smaller than a standalone icon button) — never an arbitrary pixel size.

**Meaning-pairing, not color-coding:** every place an icon carries product meaning, it's paired with a visible text label or an `aria-label`, never relied on alone — `TypeBadge`'s `TYPE_META` map (icon + label per type) and `RevisionControls`' `IconToggle` (icon + `Tooltip` + `aria-label`) are the reference pattern. This is what makes "meaning via icon, not color" (§1) actually hold up for accessibility, not just aesthetics — a colorblind user or a screen reader gets the same information a sighted user extracts from the icon shape.

**Dynamic icons:** `Category.icon` stores a kebab-case lucide name server-side (e.g. `"layout-panel-left"`); `lib/iconMap.js`'s `resolveIcon()` does a straight kebab→PascalCase lookup against the full `lucide-react` export map, falling back to a generic `Shapes` icon for an unrecognized/missing value. This is why admin-authored categories can pick any lucide icon by name without a hardcoded lookup table needing a matching update.

---

## 8. Motion

Full strategy (what animates, what deliberately doesn't, reduced-motion handling) lives in `09-frontend-architecture.md` §5 — not duplicated here. The one design-system-level constraint worth restating: motion in this product is functional (a reveal, a state change acknowledgment), never decorative. Nothing loops, nothing plays on its own, nothing celebrates.

---

## 9. The No-Gradient / No-Glow Rule

Stated explicitly, as a checklist a code reviewer can actually apply:

- [ ] No `linear-gradient`/`radial-gradient`/`conic-gradient` anywhere in product UI.
- [ ] No colored `box-shadow` or `filter: drop-shadow` used as a glow/halo effect. (Neutral shadows for floating layers, §6, are fine — a shadow that reads as "this panel is above the page" is not the same thing as a shadow used to make an element look like it's emitting light.)
- [ ] No new CSS color variable introduced without a recorded product decision — "it needs to stand out" is answered with type weight or an icon, not a new hue.
- [ ] No neon/saturated accent color used for emphasis — emphasis is `font-semibold`, a `Badge`, or an icon, never a color shift into a hue that isn't already in the neutral ramp.
- [ ] The only permitted hues in the entire product surface are the destructive red (§2.5), code block syntax highlighting (§2.8), and the six highlighter-mark colors (§2.9) — treat any other colored pixel found in review as a bug, including (especially) the two exceptions named in §2.6, which exist purely because nobody has cleaned them up yet, not because they're allowed.

**Why this is enforced so specifically, not just "keep it minimal":** DevAtlas's core philosophy (`01-product-vision.md`) is explicit that this is a knowledge engine, not a gamified habit tracker or a marketing surface — no streaks, no XP, no badges-as-rewards, no vanity charts. A restrained, colorless UI is the visual expression of that same discipline: nothing on screen is designed to trigger a dopamine response or manufacture urgency. The interface's only job is to get out of the way of 2,000 words of technical explanation, a code block, and a diagram. Every gradient or glow this rule blocks is a small vote for "app," and DevAtlas is explicitly trying not to be one — it's the notebook, not the game.

---

## 10. Dark Mode Strategy

**Mechanism:** `next-themes` (`ThemeProvider`, `attribute="class"`, `defaultTheme="system"`, `enableSystem`) toggles a `.dark` class on `<html>`, matched in CSS via `@custom-variant dark (&:is(.dark *));`. `ThemeToggle` guards the pre-hydration flash with a `mounted` check, rendering a neutral placeholder button until `next-themes` knows the resolved theme client-side.

**The `@media (prefers-color-scheme: dark)` block's actual job:** it's the correct, standard fallback for the brief window before React hydrates and `next-themes` has a chance to add `.dark` — a user with a dark OS shouldn't see a flash of light-themed content while JS boots. That's a legitimate, common pattern (media query as a pre-JS default, class as the post-hydration source of truth) — the problem documented in §2.4 isn't that this block exists, it's that its coverage (all ten content tokens) is wider than the `.dark` class's coverage of the same tokens (two of ten), so the fallback and the "real" mechanism disagree once JS is running, rather than the class cleanly superseding the media query the way it does for every component token.

**Summary of the fix, restated from §2.4:** give `.dark { }` full parity with the media query for all ten content tokens (or better, retire the content-token set and point its four consuming raw selectors — `body`, `h1`, `h2`, `code` — at the component tokens directly), so there is exactly one dark-mode source of truth once the app has hydrated, with the media query surviving only as the documented no-JS default it was always meant to be.

---

## 11. Rationale — Why This Restraint

A "Developer Operating System" competes for a user's trust the same way a text editor or a terminal does: by staying out of the way long enough that the tool disappears and only the content remains. Every other product in the "learn to code" space reaches for streak counters, colorful progress rings, and confetti — DevAtlas's product philosophy explicitly rejects all of it (`01-product-vision.md`), and the visual language has to make good on that promise, not just the feature list. A neutral, grayscale, border-not-shadow, icon-not-color interface is what "this is a serious reference tool, not a game" looks like at the pixel level. The handful of deviations documented in §2.4 and §2.6 aren't evidence the rule is wrong — they're leftover surface area from the project's starter-template origin that the rest of the palette has already been cleaned of, and they're named here precisely so they get closed rather than quietly copied forward the next time someone reaches for `--accent` or `--sidebar-primary` without checking what's actually in it.
