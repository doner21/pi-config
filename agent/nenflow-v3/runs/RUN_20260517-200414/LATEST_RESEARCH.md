---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260517-200414
upstream_intake_path: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_0_INTAKE.md
context_handoff_threshold_percent: 40
context_saturation_estimate: "~24%"
---

# Research Summary

Repo is a Next.js 16.2.3 App Router restaurant site with Supabase-backed CMS/admin content and Playwright E2E tests. Current booking is OpenTable-centric: overlay/widget/link surfaces only; no native booking, table, hold, audit, email-job, blocked-period, or peak-time domain exists. The native booking system should be additive and reuse existing admin/public patterns, but its concurrency/security needs are stricter than current CMS CRUD routes.

# Source Materials Inspected

- Intake/config: `ATT_0_INTAKE.md`, `RUN_CONFIG.json`.
- Graphify: `graphify-out/GRAPH_REPORT.md`, wiki `_INDEX.md`, communities 4, 8, 10, 15, 18.
- Config: `package.json`, `next.config.ts`, `.env.local.example`, `playwright.config.ts`, `middleware.ts`.
- Booking/UI: `src/components/opentable/*`, `src/components/sections/*BookingButton.tsx`, `src/app/(public)/reservations/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/layout.tsx`, `VisitInfo.tsx`.
- Supabase/admin/data: `src/lib/supabase*.ts`, `src/lib/data/*`, `src/app/api/admin/*/route.ts`, `src/app/admin/*/page.tsx` examples.
- DB: `supabase/migrations/001_initial.sql`, `002_create_gallery_bucket.sql`, `003_create_signature_bowls.sql`, `supabase/seed.sql`.
- Tests: `tests/e2e/booking.spec.ts`, `admin.spec.ts`, `cms-reflect.spec.ts`, `home.spec.ts`.
- Next local docs: route handlers, mutating data, forms, auth, caching docs under `node_modules/next/dist/docs/01-app/...`.
- Supabase skill plus Postgres best-practice refs for RLS, partial indexes, advisory locks, short transactions, constraints.

# Current Codebase Findings

- `BookingOverlay.tsx` is a client portal modal that scroll-locks body and injects an OpenTable loader into `#ot-widget-holder`; it monkey-patches iframe creation to add sandbox attrs and uses Navigation API to block external parent navigation.
- `BookingCTA.tsx`, `FooterBookingButton.tsx`, `HeroBookingButton.tsx`, `VisitInfoBookingButton.tsx`, and `Header.tsx` hard-code OpenTable widget URL with RID `325722`.
- `src/app/(public)/reservations/page.tsx` renders `OpenTableWidget` and final external “Reserve Now on OpenTable” link.
- `VisitInfo.tsx` computes `openTableUrl` from venue but does not pass it to `VisitInfoBookingButton`; current button opens hard-coded overlay. CMS OpenTable URL fields are therefore partly stale.
- Public data fetchers use Supabase with seed-data fallback (`src/lib/data/fetchers.ts`). Public layout is `force-dynamic` and passes overlay image to Header/Footer.
- Admin pages are client components calling `/api/admin/*`; admin APIs use service-role `createSupabaseAdminClient()`, simple CRUD/upsert, and GET seed fallbacks.
- `middleware.ts` protects `/admin` except login via Supabase `getUser()`.

# Architecture/Stack Constraints

- `package.json`: Next `16.2.3`, React `19.2.4`, `@supabase/ssr`, `@supabase/supabase-js`; scripts only `dev`, `build`, `start`, `lint`; Playwright only test dependency.
- Next docs confirm App Router `app/**/route.ts` route handlers support HTTP methods and are not cached by default; route handlers cannot share a segment with `page.tsx`.
- Next docs warn Server Actions/Functions are direct POST-reachable and must verify auth/authorization. This applies to admin booking changes and public booking confirmation.
- Existing code has no ORM; use direct Supabase JS and SQL migrations.
- `zod` is present transitively, not direct; direct dependency decision needed if used for validation.

# Booking Implementation Surfaces

- Customer entry points to replace/adapt: `Header.tsx`, `HeroBookingButton.tsx`, `FooterBookingButton.tsx`, `VisitInfoBookingButton.tsx`, `BookingCTA.tsx`, `OpenTableWidget.tsx`, `reservations/page.tsx`.
- Existing portal/modal aesthetics can be reused, but OpenTable script injection should be removed or feature-flagged if native is authoritative.
- Likely new public APIs: `src/app/api/booking/availability/route.ts`, `.../holds/route.ts`, `.../confirm/route.ts`, and confirmation lookup route/page. Exact paths are planner choice.
- Likely new admin surfaces: admin nav/dashboard entry plus pages/API under `src/app/admin/bookings` and `src/app/api/admin/bookings` for bookings, tables, rules, blocked periods, peak rules, email status/resend.
- Likely library surface: `src/lib/booking/*` for rule/availability/idempotency logic to enable direct tests.

# Database/Supabase Findings

- Existing schema only covers CMS/content: venue, opening hours, menu, gallery, homepage, site settings, signature bowls. RLS is enabled; content tables use public read + authenticated write policies.
- No booking tables exist. Needed concepts are new: tables/seating resources, bookings, holds, blocked periods, booking rules, peak rules/settings, audit events, email jobs, idempotency records.
- Existing `opening_hours` supports weekly lunch/dinner windows but not exceptions, blocked periods, durations, buffers, peak rules, or holidays.
- Supabase clients: browser anon client (`src/lib/supabase.ts`), server anon cookie client and service client (`supabase-server.ts`), service-role admin client (`supabase-admin.ts`). Service role must stay server-only.
- Do not copy public-read CMS RLS to booking PII tables. Public booking APIs should reveal minimal availability/confirmation data and use server validation. Admin routes need explicit session/role checks beyond UI.
- For no-overlap invariants, planner should prefer DB-enforced transaction/RPC/constraint strategy, not only JS checks. Supabase/Postgres refs support partial indexes for active rows, short transactions, advisory locks where appropriate, and safe idempotent constraint migrations.

# Email/Job/Hold Expiry Findings

- Grep found no Resend/SendGrid/Mailgun/Nodemailer/SMTP package/code/config; only venue email field and test login email inputs.
- No queue, cron, worker, Supabase Edge Function, or background job implementation found.
- Many Railway screenshots suggest Railway deployment history, but no deployment/cron config file was inspected. Background capability is unknown.
- Hold expiry can be planned as query-time expiry first (`expires_at > now()` defines active), with cleanup by scheduled job later. This can satisfy availability release even without physical cleanup.
- Email provider is a human gate. Persisting `booking_email_jobs` from confirmed bookings can be provider-agnostic; actual send/bounce/resend requires provider/worker strategy.

# Testing/Verification Surfaces

- Playwright config runs E2E in Desktop Chrome and Mobile Safari against `npm run dev`; screenshots/traces enabled.
- No unit/integration DB test runner exists. Current scripts lack `test`.
- `tests/e2e/booking.spec.ts` asserts OpenTable URLs/sections/links; must be rewritten for native flow.
- `tests/e2e/cms-reflect.spec.ts` has unskipped authenticated tests requiring `TEST_ADMIN_EMAIL/PASSWORD` and expects booking CTA `href` attributes, likely stale because current CTAs are buttons/overlays.
- Add backend tests for availability/rules/holds/idempotency/email-job invariants. Playwright alone is insufficient for concurrency/overlap proof. Options: add Vitest/Jest/tsx for pure `src/lib/booking` plus route/RPC tests, or Playwright APIRequestContext against a test Supabase project/schema.

# Open Questions/Planning Risks

1. OpenTable replacement/coexistence/fallback decision.
2. Email provider and sending worker/cron mechanism.
3. Test database strategy; no local Supabase CLI config found.
4. Initial table/floor-plan inventory/capacities.
5. Phone required policy, booking duration/buffer defaults, peak presets.
6. Admin role/override model. Current admin APIs rely heavily on middleware + service role.
7. RLS design for customer PII and confirmation lookup.

# Recommendations for Planner

- Make this an additive booking domain: migrations + `src/lib/booking` + public booking APIs + admin booking pages/APIs + CTA replacement.
- Centralize booking CTA behavior to avoid current five-file RID duplication.
- Keep backend authoritative; all availability and confirmation checks must run server-side and preferably in DB transaction/RPC.
- Persist active holds with `expires_at`; use query-time expiry in every availability/confirm query.
- Create email job row in same transaction as confirmed booking; keep newsletter data separate and out of scope.
- Add backend invariant tests before/alongside UI tests; update OpenTable E2E tests.
- Gate planning on OpenTable strategy, email provider/job strategy, table inventory, and phone policy.

# Evidence Appendix

- `graphify-out/GRAPH_REPORT.md`: key communities include Booking Overlay, Admin API Route Handlers, Auth/Supabase, OpenTable.
- `graphify-out/wiki/02_TOP_COMMUNITIES/COMMUNITY_4.md`: documents five booking buttons and duplicated RID `325722`.
- `src/components/opentable/BookingOverlay.tsx`: OpenTable loader injection and sandboxed iframe holder.
- `src/app/(public)/reservations/page.tsx`: OpenTable copy and link.
- `src/app/(public)/layout.tsx`: `force-dynamic`, Header/Footer overlay image pattern.
- `src/lib/data/fetchers.ts`: Supabase + seed fallback.
- `src/app/api/admin/hours/route.ts`: service-role CRUD/upsert pattern.
- `supabase/migrations/001_initial.sql`: CMS schema with RLS; no booking tables.
- `grep -RInE ...`: no email provider/cron/queue/hold implementation found.
- Next docs inspected: route handlers uncached by default; server functions direct POST-reachable and require auth checks.
- `tests/e2e/booking.spec.ts`: OpenTable-centric current tests.
