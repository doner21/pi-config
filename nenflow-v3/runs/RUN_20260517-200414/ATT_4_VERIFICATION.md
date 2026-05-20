---
artifact_type: VERIFICATION_REPORT
role: VERIFIER
run_id: RUN_20260517-200414
verdict: FAIL
upstream_verifier_brief_path: C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260517-200414\ATT_3_VERIFIER_BRIEF.md
context_handoff_threshold_percent: 40
threshold_source: user_prompt
context_saturation_estimate: "~18%"
---

# Verification Report — RUN_20260517-200414

## PASS/FAIL decision

**FAIL.** The native demo flow works, but critical backend invariants are not satisfied. In this workspace Supabase credentials are configured and the booking tables are absent; public booking APIs still return successful holds and confirmed bookings by falling back to in-memory `devBookingStore`. This violates backend source of truth, durable confirmation, audit, and email-job requirements.

## Evidence inspected

Read the intake, research, plan, execution report, verifier brief, and `RUN_CONFIG.json`. Inspected key files: `supabase/migrations/004_native_booking_system.sql`, `src/lib/booking/availability.ts`, `server-data.ts`, `dev-store.ts`, public routes under `src/app/api/booking/**`, admin routes/pages under `src/app/api/admin/bookings/**` and `src/app/admin/bookings/**`, `BookingFlow.tsx`, reservation/confirmation pages, and booking unit/E2E tests.

## Commands/tests run with results

- `npm run test:unit` — PASS, 2 files / 7 tests.
- `npm run build` — PASS, Next build succeeded and listed booking/admin routes.
- `npm run lint` — FAIL, 78 errors / 27 warnings. Some are existing debt, but new booking/admin files also have lint errors.
- `npx next dev --webpack` + `npx playwright test tests/e2e/booking.spec.ts --project="Desktop Chrome"` — PASS, 5/5 tests.
- `supabase --version` — FAIL/environmental, CLI not installed.
- API smoke: closed Monday returned 0 slots; active hold blocked a second same hold; same idempotency key returned same confirmation code; post-confirm hold blocked.
- Critical API smoke: `.env.local` has Supabase URL/anon/service keys, but `POST /api/booking/holds` returned 200 with warning `Could not find the table 'public.booking_holds' in the schema cache`; `POST /api/booking/confirm` returned 200 with warning `Could not find the table 'public.bookings' in the schema cache`.

## Criteria-by-criteria assessment

1. Native customer booking flow — PASS with caveat. `/reservations`, CTA links, and E2E happy path exist, but the tested booking was in-memory fallback.
2. Backend availability authoritative — FAIL. The library uses required inputs, but `getAvailabilityData()` silently falls back to demo data when configured Supabase queries fail.
3. Holds prevent double-booking and expire — PARTIAL/FAIL. Sequential dev checks work, but there is no DB exclusion constraint for active holds and no verified lock/transaction for concurrent hold creation.
4. Confirmed bookings cannot overlap — PARTIAL/FAIL. SQL has an exclusion constraint, but migration is not applied/tested and runtime fallback bypasses DB.
5. Idempotency — PARTIAL. Dev/API smoke works and SQL has a unique key, but real DB path is unverified.
6. Confirmation page requires backend record — FAIL. `lookupConfirmedBooking()` falls back to in-memory `lookupDevBooking()` on DB error; a confirmation page can be shown after DB insert failed.
7. Exactly one email job/status — FAIL. Schema/dev code exist, but no durable DB email job was verified; fallback creates memory job without durable booking.
8. Email failure does not cancel booking — PARTIAL/WEAK. Only a trivial unit assertion covers this; no real failure path was exercised.
9. Staff/admin peak/operational controls — FAIL. APIs expose PATCH routes, but inspected admin pages are mostly read-only. E2E only checks page container visibility and server logs showed unauthenticated admin API calls returned 401.
10. No newsletter signup/payments — PASS. No newsletter signup or payments found. Caveat: migration adds `email_consent_future` on `bookings`, which may couple future newsletter consent to booking records.

## Invariants assessment

Open-hours, capacity, blocked-period, party-size, buffer, and peak-rule checks are partially present in library/demo path but not fully enforced by RPC if called directly. No-overlap confirmed booking is only designed in unapplied SQL. Active-hold overlap/race protection is weak. Required booking fields mostly exist; phone-required is route-level. Backend authoritative source of truth FAILS due configured-DB fallback to memory. Hold creation, expiry semantics, and idempotency are partial. Confirmation from durable backend record FAILS. Audit and email-job invariants are partial/in-memory in fallback. Peak-time config is partial. No payments/newsletter signup passed.

## Falsifiers checked

- Booking confirmed without durable backend table — FOUND.
- Email job without durable confirmed booking — FOUND in fallback path.
- Confirmation page from non-durable state — FOUND.
- DB overlap prevention — unverified because migration not applied.
- Active hold race — not adequately protected.
- Newsletter signup/payments — not found.

## Issues found, severity, retry

1. Critical, implementation-error, retry required: public APIs succeed with in-memory bookings when configured Supabase writes fail.
2. High, implementation-error/environmental, retry required: migration/RPC not applied or DB-tested; configured DB lacks booking tables.
3. High, implementation-error, retry required: active-hold concurrency protection is insufficient.
4. High, implementation-error, retry required: admin configuration UI/evidence is insufficient.
5. Medium, implementation-error, retry recommended: lint fails in new files as well as old debt.
6. Medium, weak tests, retry required: email status/failure/resend paths are under-tested.

## Unverified claims

Migration applies cleanly; RPCs enforce invariants under concurrency; RLS/grants are deployment-safe; authenticated admin PATCH flows mutate durable state; email sent/failed/bounced/resent transitions work; real persistent Supabase customer flow works.

## Final recommendation

Route back to execution. Fail closed when Supabase is configured and DB reads/writes fail; do not create successful in-memory bookings in that mode. Apply/test migration against Supabase, add DB/transaction-safe active-hold protection, add authenticated admin editing evidence, and strengthen backend integration tests for holds, overlap, idempotency, audit, and email jobs.

VERDICT: FAIL
