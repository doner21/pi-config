---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260519-011017
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~3%"
context_handoff_threshold_percent: 40
context_handoff_threshold_source: user_prompt
---

# ATT_0_INTAKE — Interactive Floor Plan for Admin Bookings

## Task Summary
Build a date-and-time-range-aware interactive floor plan on `/admin/bookings` (floor-plan tab) that replaces the current static marker view. Staff select a date + time range, see all 35 numbered tables color-coded by status (available/booked/held), click tables to view/manage bookings, and perform cancel/update/move/create operations — all silent admin-only (no emails), all audited.

## Task Type
Full-stack feature: database migration + API routes + React client component with drag-and-drop.

## User Intent
Restaurant staff need a visual, spatial, time-aware view of the dining room to reduce cognitive load. They need to see "which tables are free at 7 PM on Friday" at a glance, then cancel, update, move, or create bookings without context-switching. The `table3.html` design provides the visual reference.

## Goal Attractor
A floor plan that staff trust — every table's color matches reality, every mutation works, nothing silently breaks. The floor plan becomes the go-to screen for managing reservations during service.

## Constraints
- **Time mode:** Range-based, hour increments (6-7 PM, 7-8 PM, etc.)
- **Table capacity:** All 35 tables have capacity 1 (1 person per table)
- **Drag-and-drop:** Desktop only; click-based move fallback for tablets
- **Admin mutations:** Silent (no customer emails), all audited via `booking_audit_events`
- **Existing DB:** Overlap exclusion constraints must not be violated
- **Public flow:** Must remain unchanged — `src/app/(public)/reservations/*` and `src/api/booking/*` off-limits
- **Admin list tab:** Must remain functional
- **No real-time sync:** Manual refresh or re-fetch on date/time change and after mutations
- **Warm theme:** Floor plan keeps `table3.html` cream/orange/charcoal design as embedded distinct area within dark admin panel
- **Tech:** Next.js App Router, Supabase Postgres, TypeScript, `@dnd-kit/core` for drag-and-drop

## Invariants
1. Existing booking overlap constraints (DB exclusion) must not be violated
2. Existing bookings must not be silently altered or lost
3. Public booking flow must remain unchanged
4. Admin list tab must remain functional
5. All mutations must be audited (cancel, update, move, create)
6. Cancel/update/move must not trigger customer emails
7. Floor plan visual state must accurately reflect database state
8. Party size must not exceed table capacity (max 1)

## Success Criteria
1. Floor plan displays all 35 tables with correct status for selected date/time range
2. Date picker and time range selectors update floor plan correctly
3. Cancel booking from detail panel succeeds, table turns available
4. Update booking fields persist correctly; invalid party size (>1) rejected
5. Drag-and-drop move to different table succeeds
6. Drag-and-drop move to occupied table blocked with clear error
7. Create booking from available table succeeds with generated confirmation code
8. All admin mutations produce `booking_audit_events` rows
9. No `booking_email_jobs` rows created for admin mutations
10. Public booking flow unaffected (hold → confirm → email works end-to-end)

## Ambiguities (All Resolved)
- ~~Table capacities~~ → All 35 tables: capacity 1
- ~~Floor plan image~~ → Confirmed at `public/images/floor-plan.png`
- ~~Design treatment~~ → Keep warm theme as embedded distinct area
- ~~Time granularity~~ → Range-based, hour increments
- ~~Move workflow~~ → Drag-and-drop (desktop) + click-based fallback
- ~~Update fields~~ → Customer name, party size, date, time slot, table assignment
- ~~Create from available~~ → Yes, direct booking creation from green tables
- ~~Emails on admin ops~~ → Silent, no emails

## Routing Decision
RESEARCH → PLAN → EXECUTE → VERIFY loops. Context handoff at 40% threshold per user instruction.

## Epistemic Map
### Known
- 35 tables from `table3.html` with percentage-based positions extracted
- Existing DB: `booking_resources` (4 rows), `bookings`, `booking_holds`, etc.
- Existing APIs: GET/DELETE bookings, GET holds, GET resources
- Existing `FloorPlan.tsx` component to be replaced
- `calculateAvailability()` engine exists in `src/lib/booking/availability.ts`
- All admin routes use `requireAdminUser()` and `createSupabaseAdminClient()`

### Inferred
- Admin-created bookings bypass hold flow — direct insertion with generated confirmation code
- Move = PATCH booking (not cancel+create) — preserves confirmation code
- Admin bookings page is at `src/app/admin/bookings/page.tsx` with tab-based navigation

### Assumed
- Floor plan image proportions match `table3.html` layout
- Hour increments sufficient; no arbitrary minute ranges needed
- No real-time sync needed
- All standard tables have same visual size class as in `table3.html`

### Unknown (Resolved)
- All material unknowns resolved during intake

## Affordance Landscape
- **Human:** Select date/time, see table statuses, click tables for detail, cancel/update/move/create
- **Planner:** Derive staged tasks from migration, API, UI, drag-and-drop layers
- **Executor:** Incremental work — migration first, then APIs, then UI components
- **Verifier:** Each API independently testable; floor plan vs DB comparison; drag-and-drop via browser

## Attractors and Failure Modes
### Good attractors to strengthen
- Small diffs, read before edit, reuse existing infrastructure
- Progressive enhancement (migration → API → UI)

### Bad attractors to counter
- Overbuilding drag-and-drop (MVP only)
- Reinventing booking engine (extend, don't rewrite)
- Stale UI after mutations (must re-fetch on every action)
- Assuming image matches HTML perfectly (verify early)

## Falsifiers
1. Double-booking accepted → system unsafe
2. Floor plan shows available but DB has booking → trust lost
3. Admin op triggers customer email → explicit requirement violated
4. Public booking flow breaks → regression
5. Booking disappears without audit → revenue/trust loss
6. Move silently fails → staff operates on wrong info

## Human Gates (All Resolved)
- ✅ Table capacities: All 1
- ✅ Floor plan image: `/public/images/floor-plan.png` exists
- ✅ Design: Warm theme as embedded distinct area

## Handoff Notes for Researcher
- Source-of-truth files: `src/app/admin/bookings/page.tsx`, `src/components/admin/FloorPlan.tsx`, `src/lib/booking/*`, `src/app/api/admin/bookings/*`, `supabase/migrations/*`
- Check: how `calculateAvailability` handles time ranges (it works with slots, not ranges — may need extension)
- Check: existing `booking_resources` rows that don't match 35-table naming (Booth 6, Large Table)
- Check: what the existing `DELETE /api/admin/bookings` returns — does it need extension for the new UI?
- Check: npm packages available — does `@dnd-kit/core` need installation?
- Table positions are in `specs/floor-plan-intake-spec.md` — extracted from `table3.html`
