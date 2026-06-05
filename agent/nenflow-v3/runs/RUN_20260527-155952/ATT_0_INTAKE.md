---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260527-155952
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# ATT_0 — INTAKE: Ramen Don Booking Time & Email Bugs

## Task Summary

Fix three bugs in the Ramen Don booking system (Birmingham, UK):

1. **Timezone offset on customer-facing surfaces:** Confirmation page and email show booking time 1 hour earlier than actual. Admin floor plan shows correct time.
2. **Email status stuck at pending:** Customer confirmation and admin surfaces show `pending` even though emails go through.
3. **Admin bookings list raw timestamp:** Admin list shows raw ISO `starts_at` instead of formatted time.

## Task Type

Bug fix — display-layer timezone formatting, email-job status diagnostics, and admin UI formatting.

## User Intent

Make the booking system display consistent, correct UK-local times across all surfaces (customer confirmation, email, admin floor plan, admin list), remove misleading email status labels from the customer view, and fix/admin-diagnose the backend email-job status update path.

## Goal Attractor

A customer booking for 5 PM UK local time shows 5 PM on the website confirmation, email confirmation, admin floor plan, and admin booking list. The customer sees neutral check-email guidance. Admin list shows formatted times, not raw ISO strings. Admin email status reflects actual send state.

## Constraints

- Do not alter stored booking times (no DB migrations or mass updates).
- Use `Europe/London` timezone, not a hardcoded offset.
- Customer page must not expose misleading email-job status.
- Admin floor plan must not regress.
- Email sending must continue to work.
- No schema changes without explicit human gate.

## Invariants

1. Stored booking times unchanged (display-layer changes only).
2. `Europe/London` timezone used, never hardcoded `+1 hour`.
3. Customer sees neutral check-email copy, not `Pending`/`Queued`/`Sent`.
4. Admin floor plan behavior preserved.
5. Email delivery continues to work.

## Success Criteria

1. Correct confirmation page time — 5 PM UK displays as 5 PM.
2. Correct email time — email body shows UK-local time.
3. Neutral customer email copy — check-email guidance, not `Pending`.
4. Admin booking list formatted time — readable date/time, not raw ISO.
5. Admin email status no longer misleading — sent emails update to `sent`.
6. No floor-plan regression.

## Project Context

- **Stack:** Next.js App Router, Supabase/Postgres, Resend email, Railway hosting
- **Restaurant timezone:** Europe/London (BST/GMT)
- **Railway server:** UTC
- **Key files:**
  - `src/app/(public)/reservations/confirmation/[code]/page.tsx` — server component
  - `src/lib/email.ts` — email formatting
  - `src/components/admin/InteractiveFloorPlan.tsx` — client component
  - `src/app/admin/bookings/page.tsx` — admin list
  - `booking_email_jobs` — Supabase table
- **Root cause hypothesis:** Server-side formatting in UTC without `timeZone: "Europe/London"`. Admin floor plan works because it formats in browser. Email status update likely silently failing (Supabase `.update()` returns `{ error }` which may not be checked).

## Ambiguities

- Exact runtime error when updating `booking_email_jobs.status` — needs investigation.
- Whether production schema matches local migrations exactly.
- Whether old email jobs need backfilling (explicitly out of scope unless separately requested).

## Routing Decision

- **Planner:** gpt-5.5-codex (via executor route) — produces structured plan with two executor tracks.
- **Executor A (Time Fixes):** deepseek-v4-pro — booking time display fixes on confirmation page, email, admin list.
- **Executor B (Email Status Fix):** deepseek-v4-pro — email-job status investigation and fix.
- **Verifier:** To be assigned after execution.

## Ecological Supplements

The intake was produced from a 15-phase ecological intake process. The full ecological spec at `C:\Users\doner\ramen-don\specs\booking-time-email-status-intake.md` contains detailed epistemic maps, affordance landscapes, attractor/failure-mode analysis, perturbation tests, falsifiers, and human gates. This ATT_0_INTAKE.md is the condensed NenFlow-compatible version.

### Epistemic Map (Key Points)

**Known:** Exact file paths, stack, timezone behavior pattern (server UTC vs browser local), `booking_email_jobs` RLS policies, `createSupabaseAdminClient()` behavior.

**Inferred:** 1-hour offset = server formatting in UTC; admin floor plan correct because browser timezone IS Europe/London; raw ISO = simple presentation bug; email status = silent update failure.

**Assumed:** Data not corrupted; single restaurant timezone; no schema changes needed; availability logic untouched.

**Unknown:** Exact email-job update error; production schema parity; old-email-job staleness.

### Perturbation Tests (Key)

1. BST Display Test: 5 PM May → shows 5 PM everywhere
2. GMT Display Test: 5 PM December → shows 5 PM (not 6 PM via hardcoded offset)
3. Context Loss Test: Fresh agent knows not to mutate DB
4. Email Status Failure Test: Supabase update failure logged visibly
5. Scope Creep Test: Fix only specified surfaces

### Falsifiers

1. Fix requires changing stored booking data → invalidates assumption
2. Hardcoded offset breaks winter → design error
3. Customer still sees `Pending` → requirement not met
4. Admin status stays pending with no diagnostic evidence → unresolved
5. Floor plan shifts by 1 hour → regression

### Human Gates

- DB migration or data correction requires human approval.
- Broad time-system refactor requires human approval.
- Removing admin email status entirely requires human approval.
