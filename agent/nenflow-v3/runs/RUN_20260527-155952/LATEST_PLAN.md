---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260527-155952
context_saturation_estimate: "~18%"
---

# ATT_1 — PLAN: Booking Time Display + Email Status Fixes

## Task Statement

Fix customer/admin booking display bugs without changing stored booking data: confirmation page, confirmation email, and admin bookings list must show restaurant-local `Europe/London` times. Separately, hide misleading customer email status and fix the email-job status update path so successful sends become admin-visible `sent` rows and failures are logged clearly.

## Invariants

- Do not alter stored booking times, booking creation, availability logic, `src/lib/booking/time.ts`, migrations, or historical data.
- Use `Europe/London` with `Intl.DateTimeFormat`; never hardcode `+1 hour`.
- Customer confirmation page must not display internal email states (`Pending`, `Queued`, `Sent`).
- Preserve admin floor plan behavior; it currently displays the correct booking time.
- Email delivery must continue to work; email status update failures must not break the booking confirmation flow.
- No schema changes, data backfills, or broad time-system refactors without human approval.
- Preserve existing visual design except the minimal customer email-copy replacement and admin timestamp formatting.

## Success Criteria

1. **[Track A]** Confirmation page renders a UK-local 5 PM booking as 5 PM, not 4 PM, on a UTC server.
2. **[Track A]** Confirmation email `When:` line renders booking time in `Europe/London`.
3. **[Track B]** Customer confirmation page shows neutral copy such as `Check your email for details.` and no `Pending`/`Queued`/`Sent` label.
4. **[Track A]** Admin bookings list displays readable UK-local date/time, not raw ISO `starts_at` / `startsAt`.
5. **[Track B]** After successful Resend delivery with a valid `jobId`, `booking_email_jobs.status` updates to `sent`.
6. **[Track B]** Resend errors/thrown exceptions mark the job `failed` where possible, and Supabase update errors or unmatched job IDs are logged clearly.
7. **[Both]** Admin floor plan remains behaviorally unchanged and still shows bookings at the selected time.
8. **[Both]** `npm run lint` and `npm run test:unit` pass, or unrelated pre-existing failures are documented with evidence.

## Implementation Steps

### Track A — Time Display Fixes (Executor A)

1. **Add a shared booking datetime formatter.**
   - Preferred file: `src/lib/utils/booking-time-format.ts`.
   - Do not repurpose `src/lib/utils/format-time.ts`; it formats opening-hour strings (`HH:MM`), not ISO timestamps.
   - Export `RESTAURANT_TIME_ZONE = "Europe/London"` plus helpers such as:
     - `formatBookingDate(iso: string): string`
     - `formatBookingTime(iso: string): string`
     - `formatBookingDateTime(iso: string): string`
   - Use `new Intl.DateTimeFormat("en-GB", { timeZone: RESTAURANT_TIME_ZONE, ... })`.

2. **Fix confirmation page date/time only.**
   - File: `src/app/(public)/reservations/confirmation/[code]/page.tsx`.
   - Replace default server-timezone `new Date(...).toLocaleDateString(...)` / `toLocaleTimeString(...)` with the shared helper.
   - Preserve the details-card layout.
   - Do not reintroduce the email status label if Track B has already removed it.

3. **Fix email time display.**
   - File: `src/lib/email.ts`.
   - Replace `new Date(booking.startsAt).toLocaleString()` in the email HTML with the shared `Europe/London` formatter.
   - Preserve Track B's checked email-job status helper if it already exists.

4. **Fix admin bookings list raw timestamp.**
   - File: `src/app/admin/bookings/page.tsx`.
   - Render `formatBookingDateTime(booking.starts_at || booking.startsAt)` with a safe `"—"` fallback.
   - Keep the admin `Email: {job.status || "pending"}` display; Track B fixes the backend status truthfulness.

5. **Leave floor plan unchanged.**
   - File inspected: `src/components/admin/InteractiveFloorPlan.tsx`.
   - It has local browser-side `formatTime(iso)` and is the known-good surface. Do not modify overlap, selected-time, drag/drop, create/edit/move, or status behavior.

6. **Track A validation.**
   - Run `npm run lint` and `npm run test:unit`.
   - Sanity-check May/BST and December/GMT formatting to prove there is no hardcoded one-hour offset.

### Track B — Email Status Fix (Executor B)

1. **Replace customer email-status copy.**
   - File: `src/app/(public)/reservations/confirmation/[code]/page.tsx`.
   - Remove the `emailLabel` derivation and do not render `booking.emailStatus`.
   - Keep the row/card styling but use neutral text, e.g. label `Confirmation Email` and value `Check your email for details.`
   - Preserve Track A's date/time formatter import/use if present.

2. **Create a checked email-job status update path.**
   - File: `src/lib/email.ts`.
   - Current code awaits Supabase `.update()` but ignores returned `{ error }`.
   - Add a small local helper, e.g. `updateEmailJobStatus(jobId, status, lastError?)`, that:
     - uses `createSupabaseAdminClient()` inside `try/catch`;
     - updates `booking_email_jobs` with `status` and `updated_at`;
     - sets `last_error` for `failed` and preferably clears it for `sent`;
     - uses `.eq("id", jobId).select("id,status").maybeSingle()` or an equivalent count-returning update;
     - logs returned `error` explicitly;
     - logs a clear warning if no row matched `jobId`;
     - does not throw outward and does not fail the booking flow.

3. **Handle Resend returned errors correctly.**
   - In `sendBookingConfirmation()`, after `resend.emails.send()`:
     - if `error` is non-null, update job to `failed` with a clear message and return `{ data, error }`;
     - only update job to `sent` when `error` is null;
     - keep the outer `catch` for thrown exceptions and mark `failed` there too.
   - Keep return shape `{ data, error }`.

4. **Preserve email delivery behavior.**
   - Do not change `from`, `to`, `DEV_EMAIL_REDIRECT`, subject prefixing, or Resend initialization except for preserving Track A's formatted `When:` line.
   - Do not expose service-role or Resend errors to customers.

5. **Dev fallback note.**
   - In configured Supabase/Railway mode, `jobId` is a `booking_email_jobs.id` and must be updated in Supabase.
   - In unconfigured dev fallback, `devBookingStore.emailJobs` may still stay pending unless minimally supported; do not introduce broad architecture changes just for dev fallback. Document if not addressed.

6. **Track B validation.**
   - Run `npm run lint` and `npm run test:unit`.
   - If credentials are available, create/resend a booking email and verify the corresponding job becomes `sent` in admin/Supabase.
   - If credentials are unavailable, document code-inspection evidence that all update results are checked and logged.

## Handoff Notes

### Track A Handoff Notes

- Inspected `src/app/(public)/reservations/confirmation/[code]/page.tsx`: server component currently formats with default timezone.
- Inspected `src/lib/email.ts`: email currently uses default server timezone in `toLocaleString()`.
- Inspected `src/app/admin/bookings/page.tsx`: list currently renders raw `{booking.starts_at || booking.startsAt}`.
- Inspected `src/components/admin/InteractiveFloorPlan.tsx`: floor plan uses local browser formatting and should remain unchanged.
- Existing `src/lib/utils/format-time.ts` is not an ISO datetime formatter.
- Main merge risk: Track B also edits `page.tsx` and `email.ts`; preserve its neutral email copy and status-update helper.

### Track B Handoff Notes

- `src/lib/email.ts` is the likely status bug: Supabase update responses are ignored, so `{ error }` can be silent.
- `booking_email_jobs` schema supports statuses `pending`, `sent`, `failed`, `bounced`, `resent`, plus `attempts`, `last_error`, `updated_at`.
- `src/app/api/booking/confirm/route.ts` and `src/app/api/admin/bookings/email-jobs/route.ts` create pending jobs and call `sendBookingConfirmation(..., jobId).catch(console.error)`.
- `src/app/admin/bookings/page.tsx` displays admin status from `booking_email_jobs`; do not remove admin status.
- Customer page must use neutral copy regardless of backend status.
- Main merge risk: Track A also edits `email.ts` for the `When:` formatter; preserve that change.

### Shared Verification Notes

- Required commands after combined implementation: `npm run lint` and `npm run test:unit`.
- Manual checks: 17:00 UK booking shows 17:00 on confirmation page, email, admin list, and floor plan; winter/GMT case is not shifted by +1; customer sees `Check your email for details.`; new sent email jobs update to `sent` or log actionable status-update errors.
- Human gates remain active for DB migrations, data corrections/backfills, broad time refactors, or removing admin email status entirely.
