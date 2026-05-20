---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260517-200414
upstream_intake_path: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_0_INTAKE.md
upstream_research_path: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_1_RESEARCH.md
context_handoff_threshold_percent: 40
threshold_source: user_prompt
context_saturation_estimate: "~22%"
---

# ATT_2_PLAN — Native Restaurant Booking System

## Task Statement
Build an additive native restaurant booking system in the existing Next.js 16/Supabase Ramen Don app. Replace OpenTable as the authoritative booking path with backend-enforced availability, holds, idempotent confirmation, audit events, admin controls, and booking-confirmation email jobs while preserving the current site aesthetic.

## Invariants and Constraints Carried Forward
- Backend/Supabase is source of truth for availability; frontend only renders backend results.
- Confirmation requires open hours, capacity fit, no blocked period, no conflicting confirmed booking, no conflicting active hold, valid duration/buffer, and peak-rule compliance.
- Every customer resource/table selection creates a persisted hold before confirmation; holds expire automatically via `expires_at > now()` semantics at minimum.
- No double booking; confirmation is idempotent for retries/double-clicks/refreshes and creates no duplicate booking or initial email job.
- Confirmation page only shows after backend lookup of a confirmed booking.
- Every meaningful hold/booking/email/admin action is auditable.
- Every confirmed booking creates exactly one booking-confirmation email job; email failure does not cancel the booking.
- Staff can see email status and resend; peak-time mode/rules are configurable and globally toggleable.
- No payments, newsletter signup/UI, marketing email, unrelated redesign, or generic SaaS rewrite.
- Booking email concepts remain separate from future newsletter concepts.
- Executor must read local Next docs under `node_modules/next/dist/docs/` before coding and follow existing Supabase/admin patterns without copying public CMS RLS to booking PII tables.

## Staged Implementation Plan with Atomic Tasks

### Stage 0 — Preflight
1. Read `AGENTS.md` and local Next docs for App Router route handlers, mutations/forms, auth, and caching.
2. Re-inspect `src/lib/supabase-admin.ts`, `src/lib/supabase-server.ts`, `middleware.ts`, `src/app/api/admin/*/route.ts`, and representative `src/app/admin/*/page.tsx`.
3. Run baseline and record: `npm run lint`, `npm run build`, `npx playwright test tests/e2e/booking.spec.ts`.

### Stage 1 — Database/schema
1. Add `supabase/migrations/004_native_booking_system.sql`.
2. Add `btree_gist` if using exclusion constraints.
3. Create: `booking_resources`, `booking_default_rules`, `booking_peak_rules`, `booking_blocked_periods`, `booking_holds`, `bookings`, `booking_email_jobs`, `booking_audit_events`, and optional `booking_idempotency_keys`.
4. Required fields: bookings include customer name/email, phone if policy requires, party size, start/end, status, confirmation code, resource/table, hold id, idempotency key. Holds include resource, party size, start/end, expires_at, status.
5. Add DB protection: no-overlap exclusion/constraint for confirmed bookings; unique idempotency key; unique initial confirmation email job per booking/kind; checks for statuses/time ranges/capacity.
6. RLS: no broad public reads of bookings/holds/email jobs/audit. Customer access is mediated by server APIs. Admin APIs verify auth before service-role operations.
7. Do not add newsletter tables/routes/UI; future newsletter extension must be a separate later table/flow.

### Stage 2 — Booking library
1. Create `src/lib/booking/` with `types.ts`, `validation.ts`, `time.ts`, `rules.ts`, `availability.ts`, `confirmation-code.ts`, `email-jobs.ts`, `audit.ts`.
2. Keep rule/availability logic server-side and testable. Client components must not authoritatively compute availability.
3. If adding `zod`, `vitest`, or other dependencies, add direct dependencies/scripts and justify them.

### Stage 3 — Public/admin APIs and RPC
1. Public route handlers under `src/app/api/booking/`:
   - `availability/route.ts` POST: validate party/date/preference and return backend slots/resources.
   - `holds/route.ts` POST: recheck availability and create hold.
   - `confirm/route.ts` POST: confirm from hold + contact + idempotency key.
   - confirmation lookup route/helper for minimal confirmed booking summary.
2. Prefer Postgres RPCs for critical transactions: `create_booking_hold(...)` and `confirm_booking_hold(...)`, rechecking all rules inside the transaction and creating booking, audit event, and email job atomically.
3. Use short transactions and advisory locks where needed for resource/time race safety.
4. Admin routes under `src/app/api/admin/bookings/**` for bookings, resources, rules, blocked periods, peak rules, email status, and resend. Explicitly verify admin/session inside each handler.

### Stage 4 — Customer frontend
1. Replace/adapt OpenTable surfaces while preserving design: `src/app/(public)/reservations/page.tsx`, `src/components/opentable/*` or new `src/components/booking/*`, `src/components/sections/*BookingButton.tsx`, `src/components/layout/Header.tsx`, `Footer.tsx`, `VisitInfo.tsx`.
2. Centralize booking CTA behavior; remove duplicated hard-coded OpenTable RID as authoritative flow.
3. Build flow: party/date → backend times → backend resource/seating choice or auto-assignment message → contact details → confirm → backend-loaded confirmation page.
4. Add `src/app/(public)/reservations/confirmation/[code]/page.tsx` or equivalent; direct navigation without confirmed record fails/not-found.
5. Preserve current palette and calm restaurant aesthetic (`#1A1714`, `#2C231D`, `#C8892A`, `#F0EBE3`). No newsletter checkbox/signup.

### Stage 5 — Admin controls
1. Add admin nav/pages: bookings list/detail with email status/resend, resources/capacity, default rules, blocked periods, peak rules/global toggle.
2. Likely pages: `src/app/admin/bookings/page.tsx`, `resources/page.tsx`, `rules/page.tsx`, `blocks/page.tsx`, `peak-rules/page.tsx`.
3. All admin mutations write audit events with actor metadata.

### Stage 6 — Email jobs and hold expiry
1. Persist provider-agnostic email job in same atomic path as confirmed booking.
2. Human gate before adding email provider/worker/cron; none exists. If no provider, implement pending/resend status and mocked send tests only.
3. If provider approved, isolate in server-only `src/lib/booking/email-provider.ts`; provider failure marks job failed and never rolls back booking.
4. Enforce expiry in every availability/hold/confirm query. Cleanup job/cron is optional/deferred.

## Files/areas likely to inspect/change per task
- Migrations/seeds: `supabase/migrations/*.sql`, `supabase/seed.sql`.
- Supabase/auth: `src/lib/supabase-admin.ts`, `src/lib/supabase-server.ts`, `middleware.ts`.
- Booking domain: new `src/lib/booking/*`.
- APIs: `src/app/api/booking/**/route.ts`, `src/app/api/admin/bookings/**/route.ts`.
- Public UI: `src/app/(public)/reservations/page.tsx`, confirmation page, `src/components/opentable/*`, `src/components/sections/*BookingButton.tsx`, `src/components/layout/Header.tsx`, `Footer.tsx`, `VisitInfo.tsx`.
- Admin UI/nav: `src/app/admin/**`.
- Tests: `tests/e2e/booking.spec.ts`, new admin booking specs, new unit/integration tests. `package.json` only if adding scripts/dependencies.

## Database migration/schema plan
Use one additive migration. Protect PII with restrictive RLS. Enforce overlap/idempotency with DB constraints and/or RPC transactions, not only JavaScript. Add unique indexes for idempotency and one initial confirmation email job per booking. Keep newsletter absent; future newsletter consent and marketing email should be separate later work.

## API/server action/route plan
Use App Router route handlers for testability. Do not put route handlers in same segment as pages. Public routes validate input and return minimal data. Admin routes verify auth in handler. Critical hold/confirm paths should use transaction-safe Postgres RPCs that re-check all invariants.

## Frontend flow plan
Native booking CTAs open the booking flow or `/reservations`; OpenTable iframe/script must not remain authoritative. UI handles loading, expired holds, stale state, and retry. Confirmation success comes only from backend confirmed booking lookup.

## Admin controls plan
MVP admin covers resources/capacity, default rules, blocked periods, peak toggle/rules, booking list/detail, email status, and resend. Keep forms/tables simple and consistent with existing CMS; no full admin redesign.

## Email/job/hold-expiry plan
Confirmation creates booking plus one confirmation email job atomically. Sending is decoupled. Resend records audit and pending/resent status without changing booking. Expired holds stop blocking via `expires_at` semantics even before physical cleanup.

## Test and verification plan
Executor must add/update tests and run them:
1. Backend/unit tests for closed-time rejection, capacity, blocked periods, confirmed overlap, active hold block, expired hold release/reject confirm, duration+buffer, peak rules, idempotent confirm, single email job, email failure leaves booking confirmed.
2. DB/integration tests where feasible for migration, constraints, and RPC behavior.
3. Playwright tests for customer happy path, direct confirmation URL without record, stale/expired hold recovery, mobile flow, admin email status/resend, and peak rule changing availability.
4. Rewrite stale OpenTable `tests/e2e/booking.spec.ts` to verify native flow.
5. Run/record `npm run lint`, `npm run build`, new backend test command, and `npx playwright test` or targeted specs with honest env-gate notes.
6. Evidence must include outputs plus screenshots/traces or API/DB samples proving availability, holds, email jobs/status, admin controls, frontend flow, audit, and idempotency.

## Rollback/safety plan
Keep changes additive; avoid destructive CMS changes. OpenTable may remain only as approved fallback, not as claimed native authority. Service-role stays server-only. Do not expose PII through public RLS/API. If email provider undecided, stop at persisted jobs/status/resend semantics.

## Human gates and assumptions
Gates: OpenTable strategy; email provider/worker/cron; real table inventory/capacities; phone required policy; default duration/buffer/hold TTL/booking range; exact table vs seating/auto-assignment; admin role/override model. If unanswered, make policies configurable, use conservative test/demo seed data, and keep email provider-agnostic.

## Executor handoff notes
Prioritize DB constraints/RPC and backend invariant tests before UI polish. Existing OpenTable tests/components will change; preserve aesthetic and CTA placement, not OpenTable authority. Booking admin routes need stronger auth, validation, audit, and transaction semantics than current CMS CRUD. If local Supabase testing is unavailable, still add pure rule tests and document integration gaps.

## Verifier brief expectations
Verifier should reject if frontend state can confirm bookings, overlaps are possible, active/expired holds behave incorrectly, duplicate submit creates duplicate bookings/email jobs, confirmation page succeeds without backend confirmation, email failure cancels booking, peak rules are hard-coded, admin cannot see/resend email status, newsletter functionality appears, or tests only cover UI happy path without availability/holds/email/admin/idempotency evidence.
