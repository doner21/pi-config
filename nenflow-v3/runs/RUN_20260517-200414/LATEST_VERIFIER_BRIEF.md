---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260517-200414
context_saturation_estimate: "~27%"
---

# Retry Verifier Brief — RUN_20260517-200414

## Primary checks

1. **Configured Supabase fail-closed behavior**
   - Inspect `src/lib/booking/server-data.ts`, `src/app/api/booking/availability/route.ts`, `src/app/api/booking/holds/route.ts`, `src/app/api/booking/confirm/route.ts`, and `src/app/api/booking/confirmation/[code]/route.ts`.
   - Expected: demo/dev store fallback is used only when Supabase/service-role storage is not configured; configured query/write errors return errors/503.
   - Verification commands:
     ```bash
     npm run test:unit
     curl -sS -i -X POST http://localhost:3000/api/booking/availability -H 'Content-Type: application/json' --data '{"partySize":2,"date":"2026-05-22"}' | head -60
     curl -sS -i -X POST http://localhost:3000/api/booking/holds -H 'Content-Type: application/json' --data '{"partySize":2,"startsAt":"2026-05-22T12:00:00.000Z","resourceId":"demo-table-2"}' | head -40
     curl -sS -i http://localhost:3000/api/booking/confirmation/RD-DEV | head -40
     ```

2. **Confirmation page does not rely on non-durable frontend/dev state in configured mode**
   - Inspect `lookupConfirmedBooking()` in `src/lib/booking/server-data.ts` and `src/app/(public)/reservations/confirmation/[code]/page.tsx`.
   - Expected: configured Supabase DB lookup failure throws; no `lookupDevBooking()` fallback in configured mode.
   - Unit evidence: `tests/unit/booking-fail-closed.test.ts` includes dev-store confirmation poison-pill check.

3. **Active-hold/no-overlap/idempotency strengthening**
   - Inspect `supabase/migrations/004_native_booking_system.sql`.
   - Expected evidence:
     - `booking_holds_no_active_overlap` exclusion constraint.
     - Existing `bookings_no_confirmed_overlap` exclusion constraint.
     - `bookings.idempotency_key TEXT NOT NULL UNIQUE`.
     - `one_initial_confirmation_email_job` unique index.
     - RPCs expire stale holds before checks; hold RPC uses advisory lock.
   - Gate: apply migration externally to Supabase/Postgres for true DB concurrency verification.

4. **Email job/status/resend evidence**
   - Inspect `src/lib/booking/email-jobs.ts`, `tests/unit/booking-email-jobs.test.ts`, `src/app/api/admin/bookings/email-jobs/route.ts`, and `src/app/admin/bookings/page.tsx`.
   - Expected: pending confirmation job model, resend queue path, booking remains confirmed when resend/email status changes. Authenticated UI mutation remains a known limitation.

5. **Tests avoid false confidence with configured-but-missing Supabase**
   - Inspect `tests/unit/booking-fail-closed.test.ts` and `tests/e2e/booking.spec.ts`.
   - Expected: tests assert fail-closed 503/no slots when configured storage is missing; dev happy path only applies when not in configured-missing mode.

## Commands already run by Executor

```bash
npm run test:unit
# 4 passed (4), 12 tests passed

npm run build
# Next build passed; booking and admin routes listed

npx eslint src/lib/booking src/components/booking src/app/admin/bookings tests/unit tests/e2e/booking.spec.ts --quiet
# no output, exit 0

npm run lint -- --quiet
# still fails: 52 errors in unrelated/pre-existing repo lint debt outside changed booking retry surfaces

npx playwright test tests/e2e/booking.spec.ts --project="Desktop Chrome"
# 5 passed (9.4s)
```

## Expected PASS/FAIL boundaries
- PASS retry objective if configured Supabase mode no longer returns successful holds/confirmations/confirmation lookup from memory when booking tables are missing or queries fail.
- Do not require live DB migration verification in this workspace; treat it as a deployment/human gate unless the verifier has a configured Supabase/Postgres environment and can apply the migration.
- Continue to flag as limitation: authenticated admin editing/browser evidence is bounded; full repo lint remains failing outside changed booking surfaces.
