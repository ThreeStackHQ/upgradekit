# UpgradeKit — Sprint 4.3 Integration Test Report

> **Author:** Sage (ThreeStack architect agent)
> **Date:** 2026-03-01
> **Branch:** `main` (HEAD: a5a211f)
> **Scope:** Full integration QA across all flows

---

## Summary

| Category | PASS | PARTIAL | FAIL | Total |
|---|---|---|---|---|
| Auth & Session | 2 | 1 | 1 | 4 |
| Gate Config API | 4 | 0 | 1 | 5 |
| Impression / Conversion Tracking | 2 | 1 | 0 | 3 |
| Embeddable Widget | 1 | 1 | 2 | 4 |
| Feature Hint Overlay | 1 | 0 | 0 | 1 |
| @upgradekit/react Package | 1 | 1 | 3 | 5 |
| Dashboard UI | 0 | 1 | 4 | 5 |
| Stripe Billing | 1 | 1 | 2 | 4 |
| Security | 2 | 0 | 3 | 5 |
| Build / Source Integrity | 0 | 0 | 3 | 3 |
| **TOTAL** | **14** | **6** | **19** | **39** |

**Verdict: ❌ NOT deployment-ready. 5 P0 blockers, 8 HIGH issues.**

---

## Bugs Found

### P0 — CRITICAL

| ID | Title | Location |
|---|---|---|
| BUG-001 | DB migration creates wrong schema — app will fail to start in production | `packages/db/drizzle/0000_initial.sql` |
| BUG-002 | API route source files missing — codebase cannot be rebuilt from source | `apps/web/src/app/api/` |
| BUG-003 | `/api/public/gates` list endpoint doesn't exist — @upgradekit/react SDK broken | (no source file) |
| BUG-004 | React package `main` points to stale source — npm consumers get non-functional package | `packages/react/package.json` |
| BUG-005 | Widget package `main` points to placeholder stub — npm consumers get no-op | `packages/widget/package.json` |

### HIGH

| ID | Title | Location |
|---|---|---|
| BUG-006 | Middleware only protects `/dashboard` — `/gates`, `/analytics`, `/settings` are unauthenticated | `apps/web/src/middleware.ts` |
| BUG-007 | Dashboard layout client component — no server-side auth, unauthenticated users can access | `apps/web/src/app/(dashboard)/layout.tsx` |
| BUG-008 | "Save Gate" button has no submit handler — cannot create a gate from UI | `apps/web/src/app/(dashboard)/gates/new/page.tsx` |
| BUG-009 | No API key system — widget/React Bearer & x-api-key tokens are never verified server-side | `apps/web/src/app/api/track`, `/api/convert`, `/api/public/gates/[id]` |
| BUG-010 | React package `useGate` hook calls non-existent endpoint `/api/gates/:id/check` | `packages/react/src/hooks.ts` |
| BUG-011 | Auth header inconsistency — widget uses `Authorization: Bearer`, React SDK uses `x-api-key` | `packages/widget/dist/upgradekit.js`, `packages/react/dist/cjs/hooks/useUpgradeKit.js` |
| BUG-012 | Stripe env vars missing from `.env.example` — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_INDIE`, `STRIPE_PRICE_PRO` | `apps/web/.env.example` |
| BUG-013 | Pro plan price inconsistency: pricing page shows $29/mo, checkout handler uses $19/mo | `apps/web/src/app/pricing/page.tsx` vs compiled checkout |

### MEDIUM

| ID | Title | Location |
|---|---|---|
| BUG-014 | All dashboard pages use hardcoded mock data — no real API calls | `analytics/page.tsx`, `gates/page.tsx`, `layout.tsx` |
| BUG-015 | Sidebar stats hardcoded: "12,847 impressions / 1,423 clicks / 11.1% rate" | `apps/web/src/app/(dashboard)/layout.tsx` |
| BUG-016 | `packages/react/src` exports stale API (`useGate`) — dist exports different API (`useUpgradeKit`, `UpgradeKitProvider`, `UpgradeButton`) | `packages/react/src/` |
| BUG-017 | `/signup`, `/docs`, `/demo` routes are 404 — landing page + pricing page links broken | `apps/web/src/app/` |
| BUG-018 | `settings/page.tsx` renders "coming soon" placeholder — no auth check, fully stub | `apps/web/src/app/(dashboard)/settings/page.tsx` |

### LOW

| ID | Title | Location |
|---|---|---|
| BUG-019 | No rate limiting on public `/api/track` and `/api/convert` endpoints | `apps/web/src/app/api/` |
| BUG-020 | `packages/react/README.md` documents outdated API (`useGate` / `projectId`) vs dist API (`useUpgradeKit` / `apiKey`) | `packages/react/README.md` |
| BUG-021 | Free plan impression limit (100/mo) defined but NOT enforced in tracking endpoint | compiled `/api/track/route.js` |

---

## Detailed Test Results

---

### 1. Auth & Session

#### TEST-01: OAuth Sign-in (GitHub / Google)
**Result: PASS**

`src/auth.ts` implements NextAuth with GitHub + Google OAuth providers. JWT strategy, 30-day session. On sign-in it upserts user into `users` table by email. Session callback attaches `userId` from DB. Wiring is correct; routes at `/api/auth/[...nextauth]/route.ts` exist in source.

#### TEST-02: Protected Route Redirect
**Result: PARTIAL**

Middleware (`src/middleware.ts`) correctly redirects unauthenticated requests to `/dashboard` → `/login`. However the matcher only covers:
```
["/dashboard/:path*", "/login"]
```
The app's actual routes live at `/gates`, `/analytics`, `/settings` (Next.js route groups don't affect URL paths). These routes are **not** in the middleware matcher and receive **no server-side auth enforcement**.

See BUG-006, BUG-007.

#### TEST-03: Session in API Routes
**Result: PASS**

All authenticated API routes (gates CRUD, checkout) call the shared `requireAuth()` helper which calls `auth()` from NextAuth. Returns 401 JSON on failure. Consistent pattern throughout compiled routes.

#### TEST-04: Login Page Redirect for Logged-in Users
**Result: PASS**

Middleware correctly redirects `/login` → `/dashboard` if user is already authenticated.

---

### 2. Gate Config API

#### TEST-05: POST /api/gates — Create gate
**Result: PASS** *(compiled only)*

Validated via compiled `.next/server/app/api/gates/route.js`. Zod validation on all fields, plan limit check (free=1, indie=10, pro=unlimited), inserts into DB, returns gate object with 201. Auth required.

Fields validated: `name`, `trigger_type` (`button-intercept`|`feature-hint`|`auto-on-load`), `headline`, `body`, `cta_text`, `upgrade_url`, `dismiss_behavior`.

#### TEST-06: GET /api/gates — List user's gates
**Result: PASS** *(compiled only)*

Returns gates filtered by `userId`, ordered by `createdAt` desc. Auth required.

#### TEST-07: GET /api/gates/:id — Get single gate with stats
**Result: PASS** *(compiled only)*

Ownership check (WHERE `id = ? AND userId = ?`). Returns gate + `stats: { impressions, conversions, conversion_rate }` computed from `gate_events` table.

#### TEST-08: PATCH /api/gates/:id — Update gate
**Result: PASS** *(compiled only)*

Fetches gate, checks `userId` ownership before update. Returns updated gate. Partial update supported.

#### TEST-09: DELETE /api/gates/:id — Delete gate
**Result: PASS** *(compiled only)*

Ownership check before delete. Returns 204 No Content.

**⚠️ CRITICAL CAVEAT (BUG-001, BUG-002):** All these routes exist ONLY in the compiled `.next` bundle — the source files `src/app/api/gates/route.ts`, `src/app/api/gates/[id]/route.ts`, etc. do NOT exist. Running `next build` would fail because the source files are absent. The existing build is stale and cannot be reproduced.

---

### 3. Impression / Conversion Tracking

#### TEST-10: POST /api/track — Record impression or dismiss
**Result: PASS** *(compiled only)*

Validates `gate_id` (UUID), `session_id` (required), `type` (`impression`|`dismiss`). No auth required. Inserts into `gate_events`. Returns CORS headers (`Access-Control-Allow-Origin: *`). Gate existence + `isActive` check performed.

#### TEST-11: POST /api/convert — Record conversion
**Result: PASS** *(compiled only)*

Same pattern as `/api/track` but records `eventType: "conversion"` with `source` field (`cta-click`|`dismiss`). CORS headers present.

#### TEST-12: Impression limit enforcement for free tier
**Result: PARTIAL**

Free plan has `impressionLimit: 100` defined in plan config. However, the `/api/track` handler does NOT check or enforce this limit before inserting. A free-plan user can record unlimited impressions.

See BUG-021.

---

### 4. Embeddable Widget

#### TEST-13: Compiled widget bundle exists
**Result: PASS**

`packages/widget/dist/upgradekit.js` exists and is a fully self-contained IIFE bundle (~5KB minified). Exposes `window.UpgradeKit` with `.init()`, `.gate()`, `.hint()` methods.

#### TEST-14: Widget API call pattern
**Result: PARTIAL**

Widget uses:
- `GET /api/public/gates/:id` — ✅ endpoint exists, CORS headers present
- `POST /api/track` — ✅ endpoint exists
- `POST /api/convert` — ✅ endpoint exists

Widget correctly escapes user content in modal HTML (XSS mitigation via `l()` function). Handles `dismiss_behavior: "force"` (no close button).

**Issue:** Widget sends `Authorization: Bearer <apiKey>` on all requests — but no API route validates this header. The bearer token is entirely ignored.

See BUG-009, BUG-011.

#### TEST-15: Widget package `main` entry
**Result: FAIL**

`packages/widget/package.json`:
```json
"main": "./src/index.ts"
```
`packages/widget/src/index.ts` is a placeholder that only exports a stub `initWidget()` that `console.log("[UpgradeKit] Widget initialized - coming soon")`. The real widget is in `dist/upgradekit.js` but the package doesn't expose it.

See BUG-005.

#### TEST-16: Widget build reproducibility
**Result: FAIL**

`packages/widget/package.json` build script: `echo 'Widget build coming soon'`. No real build tooling (esbuild/rollup/etc) configured. The `dist/upgradekit.js` was built manually and committed — it cannot be reproduced or updated from source without manual intervention.

---

### 5. Feature Hint Overlay

#### TEST-17: Widget hint() functionality
**Result: PASS**

`window.UpgradeKit.hint(gateId, element, options)` inserts a "Pro ↗" badge tooltip next to any DOM element. Clicking the badge triggers the full gate modal. Tooltip text can be overridden or auto-fetched from gate's headline. Implementation is clean and functional in the compiled widget.

---

### 6. @upgradekit/react Package

#### TEST-18: Package exists and is importable
**Result: PASS**

`packages/react/` exists with CJS + ESM dist and TypeScript declarations. The dist exports `UpgradeKitProvider`, `UpgradeGate`, `UpgradeButton`, `useUpgradeKit`, `useUpgradeKitContext` — a complete React integration SDK.

#### TEST-19: UpgradeGate component tracks impressions automatically
**Result: PARTIAL**

`UpgradeGate` in dist correctly uses `useEffect` to call `trackImpression(gateId)` when `isGated` is true. Impression tracking is properly reactive.

**Issue:** `useUpgradeKit` calls `GET /api/public/gates` (bulk list) — this endpoint does not exist. Only `GET /api/public/gates/:id` (single gate by ID) is implemented.

See BUG-003.

#### TEST-20: useGate hook (src) calls non-existent endpoint
**Result: FAIL**

`packages/react/src/hooks.ts` (source):
```ts
fetch(`${baseUrl}/api/gates/${gateId}/check?userId=${encodeURIComponent(userId)}`, {
  headers: { "x-project-id": projectId },
})
```
`/api/gates/:id/check` does not exist in the compiled API. This endpoint is never implemented.

See BUG-010.

#### TEST-21: React package main field points to stale source
**Result: FAIL**

`packages/react/package.json`:
```json
"main": "src/index.ts",
"types": "src/index.ts"
```
npm consumers who install `@upgradekit/react` will resolve to `src/index.ts` which exports the old, broken API (`UpgradeGate` calling non-existent endpoint, no `UpgradeKitProvider`). The correct dist is in `dist/cjs/index.js` but is never referenced.

See BUG-004.

#### TEST-22: React SDK API inconsistency: src vs dist
**Result: FAIL**

| Feature | src/ (stale) | dist/ (newer) |
|---|---|---|
| Main hook | `useGate(gateId, projectId, userId)` | `useUpgradeKit({ apiUrl, apiKey, userId, plan })` |
| Gate fetch | `GET /api/gates/:id/check` | `GET /api/public/gates` (list) |
| Auth header | `x-project-id` | `x-api-key` |
| Provider | None | `UpgradeKitProvider` |
| Gate component | Standalone `UpgradeGate` | Context-based `UpgradeGate` |

README documents the stale src API. See BUG-016, BUG-020.

---

### 7. Dashboard UI

#### TEST-23: Dashboard stats connect to real data
**Result: FAIL**

`apps/web/src/app/(dashboard)/dashboard/page.tsx` renders:
```tsx
<div className="text-2xl font-bold text-zinc-50">0</div>
```
All three stat cards (Active Gates, Impressions, Conversions) are hardcoded as `0`. No API call is made.

#### TEST-24: Gates list fetches real data
**Result: FAIL**

`gates/page.tsx` hardcodes:
```ts
const MOCK_GATES: Gate[] = [
  { id: '1', name: 'Pro Features Gate', ... },
  { id: '2', name: 'Export CSV Gate', ... },
  ...
];
```
No fetch from `/api/gates`. Toggle button only modifies local state.

#### TEST-25: Analytics page uses real data
**Result: FAIL**

`analytics/page.tsx` generates all data with `Math.random()`:
```ts
function generateData(days: number) { ... Math.random() * 200 ... }
const GATE_TABLE = [
  { name: 'Pro Features Gate', impressions: 4821, clicks: 423, ... },
  ...
];
```
KPI cards show static values (`"12,847"`, `"$2,847/mo"`). No API call.

#### TEST-26: New Gate form submits to API
**Result: FAIL**

`gates/new/page.tsx` has a "Save Gate" button:
```tsx
<button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6]...">
  <Save className="w-4 h-4" /> Save Gate
</button>
```
No `onClick` handler, no `form` element, no `fetch` to `POST /api/gates`. Clicking saves nothing.

See BUG-008.

#### TEST-27: Sidebar stats are hardcoded
**Result: PARTIAL**

Dashboard layout sidebar shows hardcoded stats:
```tsx
<span className="text-slate-300 font-medium">12,847</span>  {/* Total Impressions */}
<span className="text-slate-300 font-medium">1,423</span>   {/* Upgrade Clicks */}
<span className="text-[#3b82f6] font-medium">11.1%</span>  {/* Rate */}
```
These match the fake analytics numbers — all static, never fetched from API.

See BUG-014, BUG-015.

---

### 8. Stripe Billing

#### TEST-28: POST /api/stripe/checkout — Create checkout session
**Result: PASS** *(compiled only)*

Auth required. Creates Stripe customer if not exists. Creates checkout session with correct `mode: "subscription"`. Embeds `userId` in session metadata for webhook. Returns `{ url: checkoutUrl }`. Plan validation enforced.

#### TEST-29: POST /api/stripe/webhook — Handle events
**Result: PARTIAL**

Webhook handler is implemented and handles:
- `checkout.session.completed` (subscription mode) → upserts subscription record ✅
- `customer.subscription.updated` → updates tier/status ✅
- `customer.subscription.deleted` → sets tier=free, status=canceled ✅

Stripe signature verification via `constructEvent()` is correctly implemented. ✅

**Issue:** `STRIPE_WEBHOOK_SECRET` not documented in `.env.example`. Missing Stripe price env vars cause fallback to placeholder values `"price_indie_placeholder"` / `"price_pro_placeholder"`.

See BUG-012.

#### TEST-30: Plan limits enforced on gate creation
**Result: PASS** *(compiled only)*

`POST /api/gates` checks plan tier:
```
free  → gateLimit: 1
indie → gateLimit: 10
pro   → gateLimit: null (unlimited)
```
Returns 403 `GATE_LIMIT_REACHED` if limit exceeded. Logic is correct.

#### TEST-31: Pro plan price inconsistency
**Result: FAIL**

Pricing page (`pricing/page.tsx`): Pro = **$29/mo**
Compiled checkout handler: `pro.priceUsd = 19` / `STRIPE_PRICE_PRO` → **$19/mo**

These are inconsistent. Users see one price, get charged another.

See BUG-013.

---

### 9. Security

#### TEST-32: IDOR on gate endpoints
**Result: PASS**

All authenticated gate endpoints (`GET /api/gates/:id`, `PATCH /api/gates/:id`, `DELETE /api/gates/:id`, `GET /api/gates/:id/stats`) verify `gate.userId === session.user.id` before granting access. Return 403 FORBIDDEN on mismatch. IDOR is properly prevented.

#### TEST-33: XSS in widget modal
**Result: PASS**

Widget escapes all gate content before inserting into DOM:
```js
function l(e) {
  return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")
}
```
`headline`, `body`, `cta_text` all passed through `l()`. No XSS vector from API-sourced data.

#### TEST-34: No auth on `/gates`, `/analytics`, `/settings`
**Result: FAIL**

Middleware matcher `["/dashboard/:path*", "/login"]` does NOT cover `/gates`, `/analytics`, `/settings`. These are accessible without authentication:
- `/gates` — renders with mock data
- `/analytics` — renders fake charts
- `/settings` — renders stub UI

While no real user data is currently served (all mocked), this is an architectural security failure that will leak real data once API calls are wired up.

See BUG-006, BUG-007.

#### TEST-35: No API key validation on public endpoints
**Result: FAIL**

`/api/public/gates/:id`, `/api/track`, `/api/convert` accept all requests regardless of `Authorization` or `x-api-key` header. Any party can:
- Fetch any gate config by ID (enumerable if IDs are guessable)
- Spam impression/conversion events for any gate
- Inflate/deflate competitor's metrics

See BUG-009.

#### TEST-36: CORS policy
**Result: FAIL** *(by design issue, not vulnerability)*

`Access-Control-Allow-Origin: *` is set on all three public endpoints. This is intentional (widget embeds must work cross-origin), but combined with no API key enforcement (BUG-009), any domain can freely abuse the tracking APIs.

---

### 10. Build / Source Integrity

#### TEST-37: Build from source succeeds
**Result: FAIL**

`apps/web/src/app/api/` contains only `auth/[...nextauth]/route.ts`. All other API routes are missing from source:
```
MISSING: src/app/api/gates/route.ts
MISSING: src/app/api/gates/[id]/route.ts
MISSING: src/app/api/gates/[id]/stats/route.ts
MISSING: src/app/api/public/gates/[id]/route.ts
MISSING: src/app/api/track/route.ts
MISSING: src/app/api/convert/route.ts
MISSING: src/app/api/stripe/checkout/route.ts
MISSING: src/app/api/stripe/webhook/route.ts
```
Running `next build` from the committed source would fail. The existing `.next/` build is stale and should not be committed.

See BUG-002.

#### TEST-38: DB migration matches compiled schema
**Result: FAIL**

`packages/db/drizzle/0000_initial.sql` (and `packages/db/src/schema/gates.ts`) are completely out of sync with the compiled API:

| Field | DB Migration | Compiled API |
|---|---|---|
| `trigger_type` enum | `['feature', 'page', 'usage']` | `['button-intercept', 'feature-hint', 'auto-on-load']` |
| Gates table extra cols | `slug`, `triggerValue`, `description` | `bodyText`, `ctaText`, `dismissBehavior` |
| Event tracking | Separate `gate_impressions` + `gate_conversions` tables | Unified `gate_events` table with `event_type` enum |
| `tier` enum | `['free', 'pro', 'business']` | `['free', 'indie', 'pro']` |

Running the migration will create a schema the API cannot use. This is a P0 blocker for any deployment.

See BUG-001.

#### TEST-39: pnpm build runs without errors
**Result: FAIL** *(not run — blocked by BUG-002)*

Cannot attempt build as source files are missing. Widget package build script is a no-op (`echo 'Widget build coming soon'`). React package has no build script configured.

---

## What Works (as compiled)

The following flows are correctly implemented **in the compiled `.next` bundle** and would work if deployed with the correct DB schema:

✅ OAuth sign-in (GitHub / Google)  
✅ Session management (JWT, 30-day expiry)  
✅ Gate CRUD API (create, list, get+stats, update, delete)  
✅ IDOR protection on all gate endpoints  
✅ Impression & conversion tracking (public, CORS-enabled)  
✅ Public gate fetch endpoint (used by widget)  
✅ Stripe checkout session creation  
✅ Stripe webhook handling (3 event types with signature verification)  
✅ Plan-based gate limits enforced  
✅ Widget modal (compiled) — full feature-hint overlay, animations, keyboard nav  
✅ @upgradekit/react dist — UpgradeKitProvider, UpgradeGate, UpgradeButton, impression tracking  
✅ XSS protection in widget  
✅ Landing page + pricing page (static, looks great)  

---

## Required Bolt Fixes (Priority Order)

### P0 — Must Fix Before Any Deployment

1. **Restore all missing API source files** — `src/app/api/gates/route.ts`, `[id]/route.ts`, `[id]/stats/route.ts`, `public/gates/[id]/route.ts`, `track/route.ts`, `convert/route.ts`, `stripe/checkout/route.ts`, `stripe/webhook/route.ts` — write them from the compiled bundle

2. **Fix DB migration** — Rewrite `packages/db/drizzle/0000_initial.sql` and `packages/db/src/schema/` to match the compiled schema (correct enums, unified `gate_events` table, `indie`/`pro` tiers)

3. **Add `/api/public/gates` list endpoint** — or change `useUpgradeKit` dist to fetch gates individually

4. **Fix `packages/react/package.json` main** — point to `dist/cjs/index.js` not `src/index.ts`

5. **Fix `packages/widget/package.json` main** — point to `dist/upgradekit.js` not `src/index.ts`

### HIGH — Fix Before Beta

6. **Extend middleware matcher** to cover `/gates`, `/analytics`, `/settings`, `/gates/:path*`

7. **Add auth check** to `(dashboard)/layout.tsx` (convert to server component with `auth()` call)

8. **Wire "Save Gate" button** in `gates/new/page.tsx` to `POST /api/gates`

9. **Add API key system** — generate per-user API keys, store in DB, validate on public endpoints

10. **Document Stripe env vars** in `.env.example`

11. **Fix auth header** — standardize on `Authorization: Bearer <apiKey>` or `x-api-key` everywhere

12. **Fix Pro plan price** — align pricing page ($29) with checkout handler ($19)

### MEDIUM — Fix Before Public Launch

13. **Wire dashboard to real API** — replace all mock data in `gates/page.tsx`, `analytics/page.tsx`, `dashboard/page.tsx`

14. **Enforce free-tier impression limit** in `/api/track` handler

15. **Add rate limiting** to `/api/track` and `/api/convert`

16. **Create `/signup`** route (or redirect to `/login` with signup intent)

17. **Add settings page** functionality

18. **Fix React package README** to document dist API

---

*Report generated by Sage — ThreeStack architect agent. See `/tmp/upgradekit/INTEGRATION-TEST-REPORT.md`.*
