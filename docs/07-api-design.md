# 07 — API Design (REST)

> Authoritative contract for `backend/src/routes` + `backend/src/controllers`. Base URL: `/api/v1`. Frontend RTK Query slices (`frontend/src/store/api`) implement this document exactly.

## 0. Conventions (fixed, apply to every endpoint)

**Envelope.** Every response body is either an `ApiResponse` or an `ApiError`, per the existing `backend/src/utils` contract:

```jsonc
// success — new ApiResponse(statusCode, data, message)
{ "statusCode": 200, "success": true, "message": "Knowledge cards fetched", "data": { /* ... */ } }

// failure — new ApiError(statusCode, message, errors)
{ "statusCode": 400, "success": false, "message": "Validation failed", "errors": ["title is required"], "data": null }
```

No endpoint returns a bare array or bare object — always wrapped. Every controller is wrapped in `asyncHandler`; errors thrown as `ApiError` are caught by the global error middleware (`backend/src/middlewares/error.middleware.js`) and serialized to the shape above.

**Auth.** Stateless JWT via httpOnly cookies (`accessToken`, `refreshToken`) — never via `Authorization` header from the browser client (avoids XSS token theft; see `15-security-design.md`). `verifyJWT` middleware reads `req.cookies.accessToken`, falls back to `Authorization: Bearer` only for non-browser API clients. Role checks run after `verifyJWT` via `verifyRole(...roles)`: content/admin routes use `verifyRole("admin", "super_admin")` (both roles have full content authority), while role-promotion (`PATCH /users/:id/role`) uses `verifyRole("super_admin")` alone — see `06-database-design.md §2` for the three-role model.

**Pagination** (all list endpoints): query params `page` (default 1), `limit` (default 20, max 100). Response `data` shape:

```jsonc
{ "items": [ /* ... */ ], "page": 1, "limit": 20, "total": 143, "totalPages": 8 }
```

**Filtering/Sorting** (list endpoints): documented per-resource below as query params; `sort` accepts `field` or `-field` (descending), default varies per resource.

**Status codes.** `200` read/update, `201` create, `204` delete (no body), `400` validation, `401` unauthenticated, `403` unauthorized (wrong role / not owner), `404` not found, `409` conflict (duplicate slug/email), `422` semantically invalid (e.g. malformed CSV row), `429` rate-limited, `500` unhandled.

**Slugs vs IDs.** Public read routes for `Knowledge`/`Category`/`Company` are slug-addressed (`GET /knowledge/:slug`) — SEO- and bookmark-friendly. Admin write routes are ID-addressed (`PATCH /knowledge/:id`) since the admin UI always has the doc already loaded.

---

## 1. Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/google` | public | Redirects to Google OAuth consent screen (Passport `google` strategy) |
| GET | `/google/callback` | public | Passport callback. On success: upsert `User` (match by `providers.providerId`, else by `email` to link a second provider; auto-promote to `super_admin` if the email matches `SUPER_ADMIN_EMAIL`), issue access+refresh JWT cookies, `302` redirect to `FRONTEND_URL/auth/callback` |
| GET | `/github` | public | Redirects to GitHub OAuth consent screen |
| GET | `/github/callback` | public | Same upsert/issue/redirect/auto-promote flow as Google |
| POST | `/refresh` | cookie: refreshToken | Verifies refresh token against `user.refreshTokenHash`, rotates both tokens, sets new cookies. `401` + clears cookies if invalid/reused (reuse = revoked token replay, a security event → also nulls `refreshTokenHash`, forcing full re-login) |
| POST | `/logout` | required | Clears cookies, nulls `refreshTokenHash` |
| GET | `/me` | required | Returns the current `User` doc (used by frontend on app boot to hydrate Redux auth state) |

`/google/callback` and `/github/callback` are the **only** two routes in the entire API that issue tokens. There is no `/register` or `/login` with a body — this is the enforced consequence of [[ADR-0003]].

## 2. Users — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/me` | required | Update own `name`, `bio`, `headline`, `socialLinks`, `avatarUrl` |
| GET | `/` | admin, super_admin | List users. Query: `q` (name/email search), `role`, `isActive`, pagination |
| PATCH | `/:id/role` | **super_admin only** | Body `{ role: "user" \| "admin" \| "super_admin" }` — promote/demote. `admin` gets `403` here even though it passes every other admin check |
| PATCH | `/:id/status` | admin, super_admin | Body `{ isActive: boolean }` — deactivate blocks login at `verifyJWT` |

## 3. Categories — `/api/v1/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | public | Query `?tree=true` returns nested tree (root + children), otherwise flat list. `?parent=<id\|null>` filters one level |
| GET | `/:slug` | public | Single category + its direct children |
| POST | `/` | admin | Create. Body: `name, parent, icon, description, order` |
| PATCH | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Soft delete. `409` if it has non-deleted children or published `Knowledge` docs referencing it |

## 4. Companies — `/api/v1/companies`

Same CRUD shape as Categories, no tree (`name, slug, logoUrl`). `GET /` supports `?q=` search for the DSA filter UI's company picker.

## 5. Knowledge — `/api/v1/knowledge` (the core resource)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | public* | List/filter across all types. See query params below |
| GET | `/:slug` | public* | Full card. Increments `viewCount`, fires an `Activity(action:"viewed")` (fire-and-forget, doesn't block response) |
| GET | `/:slug/related` | public | Resolves `relations[]` into populated summary cards, grouped by `relationType` |
| POST | `/` | admin | Create. `type` is immutable after create |
| PATCH | `/:id` | admin | Update. Re-slugging blocked if `status:"published"` (see §6 of `06-database-design.md`) |
| POST | `/:id/publish` | admin | `status → "published"`, sets `publishedAt` via `Activity` log entry |
| DELETE | `/:id` | admin | Soft delete |
| POST | `/import/dsa-csv` | admin | `multipart/form-data`, field `file`. Streams CSV → validates each row → bulk-creates `type:"dsa"` cards. Returns `{ created, skipped, errors: [{row, reason}] }` — partial success is not an error, it's `200` with a report |

\* `public` here means "no auth required to **read**", but the query is always implicitly scoped to `status: "published"` for non-admin/anonymous callers; admins additionally see `draft`/`archived` via `?status=` filter.

**`GET /knowledge` query params:**

```
type=concept|dsa|interview|project      (repeatable → OR)
category=<categorySlug>
difficulty=beginner|intermediate|advanced
tags=async,microtask                     (comma-separated → AND)
company=<companySlug>                    (dsa/interview)
pattern=<string>                          (dsa only, e.g. "Two Pointers")
status=draft|published|archived          (admin only; ignored for non-admin)
q=<string>                                (delegates to §8 Search — same ranking)
sort=-createdAt|title|-viewCount|difficulty   (default -createdAt)
page, limit
```

Response `items[]` are **summary** projections (`title, slug, type, category, difficulty, tags, readTimeMinutes, updatedAt` + type-discriminator's 1-2 "headline" fields e.g. `pattern` for dsa) — never the full `content` blob, to keep list payloads light. Full `content` only on the single-card `GET /:slug`.

## 6. Resources — `/api/v1/resources`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | public | `?knowledge=<id>` filters to resources attached to a card |
| POST | `/` | admin | Create standalone, then attach via `PATCH /knowledge/:id` adding to `resources[]` |
| PATCH | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Soft delete; also pulled from any `Knowledge.resources[]` referencing it |

## 7. Uploads / Attachments — `/api/v1/uploads`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | required (admin for content media; any user for note-attached images) | `multipart/form-data`, field `file`, optional `resourceType` hint. Multer writes to `backend/public/temp`, controller uploads to Cloudinary, deletes the temp file (success or failure — `finally` block), creates an `Attachment` doc, returns it |
| DELETE | `/:id` | owner or admin | Destroys the Cloudinary asset by `publicId`, then the `Attachment` doc |

## 8. Search — `/api/v1/search`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | public* | `q` (required), `type`, `category`, `difficulty`, `company` facet filters, `page`, `limit` |

Implementation: Mongo `$text` search against the weighted index in `06-database-design.md §11`, `$meta:"textScore"` sort, facet filters as additional `$match` stage. Response includes a `facets` block (counts per `type`) so the UI can render filter chips with counts without a second round-trip:

```jsonc
{ "items": [...], "facets": { "concept": 12, "dsa": 4, "interview": 2, "project": 1 }, "page":1, "limit":20, "total":19, "totalPages":1 }
```

`GET /search/recent` and `POST /search/recent` (required auth) — get/append the caller's last 10 queries, stored as a capped array on... **not** a new collection: appended to `User.recentSearches: [String]` (max 10, push-and-trim), since it's small and always fetched alongside the user's own session. *(Field added to §2 `User` schema — see amendment note at bottom of `06-database-design.md` if not already present; treat as part of the `User` doc.)*

## 9. Progress (bookmark / favorite / pin / notes / revision) — `/api/v1/progress`

All routes `required` auth, always scoped to `req.user`.

| Method | Path | Description |
|---|---|---|
| GET | `/:knowledgeId` | Get my `UserProgress` for a card (creates a default lazily if none exists yet — read-only lazy-create, doesn't persist until first real mutation) |
| PATCH | `/:knowledgeId` | Upsert partial state: `{ isBookmarked?, isFavorite?, isPinned?, status?, personalNotes?, personalMistakes? }` |
| POST | `/:knowledgeId/revision` | Body `{ result: "forgot"\|"shaky"\|"confident" }` — applies the level/interval table from `06-database-design.md §5`, appends to `revision.history` |
| PATCH | `/:knowledgeId/revision/mark` | Body `{ marked: boolean }` — toggle `revision.isMarkedForRevision` without submitting a result |
| GET | `/revision/due` | List of my due cards (`nextRevisionAt <= now`), populated summary — powers Dashboard + Revision page |
| GET | `/bookmarks` | My bookmarked cards, paginated |
| GET | `/pinned` | My pinned cards (small, uncapped — pins are meant to be few) |
| GET | `/favorites` | My favorited cards, paginated |

## 10. Annotations — `/api/v1/annotations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | required | `?knowledge=<id>` — my highlights on a card |
| POST | `/` | required | `{ knowledge, block, quote, startOffset, endOffset, color, note? }` |
| PATCH | `/:id` | required, owner | Update `color`/`note` |
| DELETE | `/:id` | required, owner | Remove a highlight |

## 11. Dashboard — `/api/v1/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | required | Single aggregated payload: `{ continueLearning[], recentlyViewed[], recentlyUpdated[], revisionDueCount, pinned[], recentActivity[], stats }`. `stats` is intentionally minimal per product principle (no gamification): `{ totalCardsViewed, totalBookmarks, totalRevisionsDone }` — counts, not charts/streaks/XP. |

One endpoint, one round-trip, because the Dashboard is explicitly "very minimal" per the reference spec — it doesn't need six separate widget fetches.

## 12. Activities — `/api/v1/activities`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | required | My recent activity, paginated |
| GET | `/knowledge/:id` | admin | Audit trail for one card (who created/edited/published) |

---

## 13. Rate limiting (applied via middleware, see `15-security-design.md`)

| Scope | Limit |
|---|---|
| `/auth/*` | 20 req / 15 min / IP |
| `/uploads` | 30 req / 15 min / user |
| `/search`, `/knowledge` (GET) | 300 req / 15 min / IP |
| everything else, authenticated | 600 req / 15 min / user |

## 14. Versioning

Prefix `/api/v1` is fixed from day one (cheap now, expensive to retrofit). No endpoint deprecation policy needed yet — first documented in `18-future-roadmap.md` if/when a public API is opened up.
