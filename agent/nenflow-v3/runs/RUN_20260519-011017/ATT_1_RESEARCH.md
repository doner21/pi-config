---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260519-011017
context_saturation_estimate: "~18%"
context_handoff_threshold_percent: 40
threshold_source: user_prompt
---

# ATT_1_RESEARCH — Interactive Floor Plan: Codebase Investigation

## Investigation Scope

Investigated 10 areas per INTAKE directive, covering the existing FloorPlan component, admin bookings page, all booking API routes, calculateAvailability(), database schema, audit infrastructure, dependencies, the table3.html design asset, booking type definitions, and existing PATCH patterns across admin routes.

## Key Findings

### 1. FloorPlan.tsx — Current Component (Replacement Target)

**File:** `src/components/admin/FloorPlan.tsx` (197 lines)

**What it does:**
- Client component fetching 3 endpoints on mount: `/api/admin/bookings/resources`, `/api/admin/bookings`, `/api/admin/bookings/holds`
- Renders a floor-plan image container (`aspectRatio: "16/9"`, loading `/images/floor-plan.png`) with 4 hard-coded marker dots positioned via percentage coordinates
- Markers colored green/amber/grey based on `statusFor()` — but status is **today-only**, no date filtering whatsoever
- Clicking a marker opens a modal showing today's bookings and active holds on that table
- Modal has Cancel button calling `DELETE /api/admin/bookings` — the only mutation supported
- Card strip below map shows all active resources with status badges
- Handles snake_case/camelCase normalization via `rn()` helper

**What's reusable:**
- The image container pattern (relative positioning, aspect ratio, object-contain on image)
- The modal back-drop pattern (fixed inset-0, bg-black/60, centered panel)
- Status color mapping: `available: #4CAF50`, `booked: #C8892A`, `blocked: #A09488`
- The toast message display pattern
- `formatTime()` helper
- `rn()` snake/camel normalization utility
- Cancel booking logic (calls existing DELETE endpoint, then refreshes)

**What must change:**
- Hard-coded marker positions → static import from position map (35 tables from table3.html)
- `today` constant → user-selected date from date picker
- "Today's bookings" filter → time-range overlap filter using selected start/end times
- `statusFor()` logic → must check booking/hold overlap against selected date+time range (not just starts-with-today)
- Modal must add Update, Move, Create actions (currently only Cancel + view)
- Warm theme from table3.html must be applied as scoped container
- Table buttons need `table3.html` styling (orange gradient, hover scale, selected state)
- "blocked" status is really "held" — terminology should be "held" for consistency

**Risk:** The current component uses `"use client"` and fetches data client-side. The new component will need to pass selected date/time as query parameters to the API.
### 2. Admin Bookings Page — Tab Structure

**File:** `src/app/admin/bookings/page.tsx` (137 lines)

**Structure:**
- Two-tab layout: `"list"` | `"floor-plan"` (type `Tab`)
- Tab bar uses `border-b-2` active indicator with `#C8892A` (amber) for active tab
- List tab fetches `/api/admin/bookings` and `/api/admin/bookings/email-jobs` — shows bookings with resend-email button
- Floor plan tab simply renders `<FloorPlan />` — no props, no date/time context
- Error/success banners with auto-dismiss (4s timer via `flashSuccess`)
- Loading state: dark card with "Loading bookings..."

**What must change:**
- `<FloorPlan />` tag → replace with new `<InteractiveFloorPlan />` component
- New component will manage its own date/time state — no props needed from page.tsx (keeps tab clean)
- List tab must remain untouched — page renders conditionally by tab, easy to preserve

**Risk:** None significant. The parent page is a simple tab router — replacement is a one-line swap.

### 3. Booking API Routes — Current State and Gaps

**File:** `src/app/api/admin/bookings/route.ts`

| Method | What It Does | Returns | Gaps |
|--------|-------------|---------|------|
| `GET` | Fetches all bookings with `booking_resources(name)` and `booking_email_jobs(status,kind,attempts,last_error)` joins, ordered by `starts_at` desc | `{ data: Booking[] }` | **No query parameter filtering.** Must add `?date=YYYY-MM-DD&from=HH:MM&to=HH:MM` support |
| `DELETE` | Sets `status = 'cancelled'` (soft delete), inserts audit event `booking.cancelled` | `{ success: true }` | Fully adequate. No changes needed |

**Missing endpoints (must be created in this same route file):**
- `PATCH` — Update booking fields (customer_name, party_size, starts_at, ends_at, resource_id)
- `POST` — Admin-create booking (bypasses hold flow, generates confirmation code)

**Auth pattern (reused by all endpoints):**
```
const auth = await requireAdminUser();
if (auth.response) return auth.response;  // 401 if unauthenticated
```

**Dev-mode fallback pattern (reused by all endpoints):**
```
if (!bookingDbConfigured()) return NextResponse.json({ data: devBookingStore.bookings });
```

**Database access pattern:**
```
const supabase = createSupabaseAdminClient();  // service_role key, bypasses RLS
```

**Audit pattern (observed in DELETE and blocks PATCH):**
```
await supabase.from("booking_audit_events").insert({
  actor_id: auth.user.id,
  action: "booking.cancelled",
  entity_type: "booking",
  entity_id: id
});
```

### 4. booking_resources Table — Current State and Migration Plan

**Current rows** (from migrations `004_native_booking_system.sql` and `005_large_booking_table.sql`):

| Name | Area | Capacity | sort_order |
|------|------|----------|------------|
| Table 2 | Dining Room | 1–2 | 10 |
| Table 4 | Dining Room | 2–4 | 20 |
| Booth 6 | Window | 4–6 | 30 |
| Large Table | Dining Room | 6–8 | 40 |

**Constraints on the table:**
- `capacity_min SMALLINT NOT NULL DEFAULT 1 CHECK (capacity_min > 0)`
- `capacity_max SMALLINT NOT NULL CHECK (capacity_max >= capacity_min)`
- `is_active BOOLEAN NOT NULL DEFAULT true`
- Referenced by `bookings.resource_id` with `ON DELETE RESTRICT` — **cannot delete resources with existing bookings**
- Referenced by `booking_holds.resource_id` with `ON DELETE RESTRICT`
- Referenced by `booking_blocked_periods.resource_id` with `ON DELETE CASCADE`

**Migration must add 31+ rows:**
- Tables 1, 3, 5–35: all with `capacity_min = 1`, `capacity_max = 1`
- **Existing non-matching rows** (Booth 6, Large Table) should be **kept** but marked `is_active = false` to preserve referential integrity for historical bookings
- Table 2 and Table 4 are valid; keep as-is or update capacity to 1 (min=1, max=1)
- Sort order should match table numbers approximately (Table 1 = 1, Table 2 = 2, etc.)

**Risk:** The existing Table 2 and Table 4 have capacity 1-2 and 2-4. Changing to 1-1 would invalidate existing bookings with party_size > 1 on those tables. However, the constraint says "All 35 tables: capacity 1." The Planner must decide: either (a) keep existing capacities and add new tables at 1, or (b) update all to 1 and verify no existing bookings have party_size > 1. The `booking_resources` `capacity_min`/`capacity_max` are used by `resourceFits()` in availability.ts — reducing capacity could break future booking flow but won't retroactively affect existing confirmed bookings (DB doesn't re-validate on read).
### 5. calculateAvailability() — Time-Range Analysis

**File:** `src/lib/booking/availability.ts` (83 lines)

**How it works:**
- Takes `AvailabilityInput` (partySize, date, resourcePreference, now) + `AvailabilityData`
- Uses `makeSlots()` to generate time slots at `slotMinutes` intervals across lunch/dinner windows
- For each slot, calls `isResourceFree()` which checks:
  1. Blocked periods — overlap check
  2. Confirmed bookings — overlap check (only `status === 'confirmed'`)
  3. Active holds — overlap check (only `status === 'active'` and not expired)
- Also checks `resourceFits()` — capacity min/max check against party size

**Can it support time-range filtering for the floor plan?**
- **Yes, core logic is reusable.** `isResourceFree()` already does exactly what the floor plan needs: for a given resource and time range, check if it overlaps any booking, hold, or blocked period.
- **`makeSlots()` is NOT needed** for floor plan — that generates bookable slots; the floor plan just needs a single range check per resource.
- **Key function to extract/reuse:** `isResourceFree(resourceId, startsAt, endsAt, data, now)` — this is the engine. For floor plan status: call it for each of the 35 resources with the selected date/time range.
- The Planner can either call `calculateAvailability` with extended logic or create a simpler `getResourceStatuses(date, from, to, data)` function that reuses `isResourceFree()`.

**Party size consideration:** With all tables capacity 1, `resourceFits()` will reject partySize > 1. For floor plan, capacity is moot (all tables fit party 1). But the function still needs a partySize input — use 1 as floor-plan default.

**Key helper in `time.ts`:**
- `overlaps(aStart, aEnd, bStart, bEnd)` — `as < be && bs < ae` — standard half-open interval overlap. Used by `isResourceFree()`.

### 6. booking_audit_events — Current Structure

**Table schema** (from migration 004):
```sql
CREATE TABLE booking_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS:** Read-only for authenticated users (no insert/update/delete via client — inserts are server-side via admin client).

**Existing actions observed in codebase:**
| Action | Entity Type | Where Used |
|--------|------------|------------|
| `booking.cancelled` | `booking` | DELETE bookings route |
| `booking.confirmed` | `booking` | Public confirm route, RPC function |
| `hold.created` | `booking_hold` | Public holds route, RPC function |
| `resource.updated` | `booking_resource` | PATCH resources route |
| `resource.deleted` | `booking_resource` | DELETE resources route |
| `rules.updated` | `booking_default_rules` | PATCH rules route |
| `rules.deleted` | `booking_default_rules` | DELETE rules route |
| `peak_rules.updated` | `booking_peak_rule` | PATCH peak-rules route |
| `peak_rule.deleted` | `booking_peak_rule` | DELETE peak-rules route |
| `email.resend_requested` | `booking_email_job` | POST email-jobs route |
| `block.created` | `booking_blocked_period` | POST blocks route |
| `block.updated` | `booking_blocked_period` | PATCH blocks route |
| `block.deleted` | `booking_blocked_period` | DELETE blocks route |

**New actions needed for floor plan:**
- `booking.updated` — entity_type: `booking` — when admin PATCHes booking fields
- `booking.moved` — entity_type: `booking` — when admin moves booking to new table/date (distinct from update for auditing clarity)
- `booking.admin_created` — entity_type: `booking` — when admin creates booking directly

**Important:** The public confirmation flow uses `booking.confirmed` — admin creates should use a different action to distinguish customer vs admin origins.

**Helper function available:** `auditEvent()` in `src/lib/booking/audit.ts` — returns an object with `actor_id, action, entity_type, entity_id, metadata`. Not currently used by route handlers (they build objects inline), but available.

### 7. package.json — Dependencies

**File:** `C:/Users/doner/ramen-don/package.json`

**Existing runtime dependencies:**
- `next`: `16.2.3` (App Router)
- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `@supabase/ssr`: `^0.10.2`
- `@supabase/supabase-js`: `^2.103.0`
- `resend`: `^6.12.3`

**Missing for this feature:**
- `@dnd-kit/core` — **NOT installed, must be added** (drag-and-drop requirement per INTAKE)
- `@dnd-kit/sortable` — **NOT installed** (likely needed for drag-and-drop presets)
- `@dnd-kit/utilities` — **NOT installed** (CSS transform helpers)

**No date picker library is installed.** Options:
- Build custom with native `<input type="date">` and `<select>` for time ranges (simpler, zero dependency, matches admin dark theme)
- Install `react-day-picker` or similar
- Recommendation: start with native inputs + custom styling; add library only if UX demands calendar widget

**No UI library installed** (Tailwind CSS 4 only, no shadcn/ui, no Radix). All components are custom-built.

**Testing:** `vitest` for unit, `@playwright/test` for browser — no Cypress or Jest.
### 8. table3.html — Design Asset Verified

**File:** `assets for booking system/table3.html` (246 lines)

**Confirmed:** All 35 tables present with exact percentage positions matching the spec file's position map.

**CSS Design Tokens (must be preserved):**
```css
--cream: #fff7eb;
--paper: #f6ead7;
--paper-deep: #ead7bd;
--charcoal: #171717;
--charcoal-soft: #252525;
--ink: #1c1712;
--orange: #e87422;
--orange-deep: #c95713;
--orange-light: #ffb36b;
--line: rgba(28, 23, 18, 0.22);
--shadow: rgba(31, 19, 8, 0.18);
```

**Table size classes:**
- `.standard`: width 5.8%, height 7.8% (tables 1-27)
- `.small`: width 4%, height 5.2% (tables 28-35)

**Fixed layout areas** (5 non-interactive elements):
- DOOR (40.4%, 1.3%, 12.7% x 7.7%)
- ENTRANCE (23.4%, 12.6%, 38.7% x 23.6%)
- BAF (20.9%, 36.7%, 34.4% x 14.4%)
- B. KITCHEN (20.9%, 52.8%, 16.2% x 37.9%)
- F. KITCHEN (41.0%, 52.8%, 14.5% x 37.9%)

**Table button styling to replicate:**
- Default: `linear-gradient(145deg, #ff9a3d, var(--orange))`, border `2px solid var(--orange-deep)`
- Hover: scale(1.04), lighter gradient, glow ring `0 0 0 4px rgba(232, 116, 34, 0.2)`
- Selected: charcoal background, cream text, orange-light border

**Floor plan container backdrop:**
- `radial-gradient` + `linear-gradient(145deg, #fff4e5, #f0d8b8)` — warm paper background
- `border-radius: 20px`, inset white highlight

**Image:** Uses CSS gradients only — no image reference. Our implementation overlays tables on the existing `/images/floor-plan.png` image. **Risk:** Image may not perfectly align with HTML percentage positions. The INTAKE warns about this — positions may need minor adjustment during implementation.

### 9. Booking Types — Complete Inventory

**File:** `src/lib/booking/types.ts` (96 lines)

All relevant types defined and consistent:

| Type | Key Fields | Notes |
|------|-----------|-------|
| `BookingResource` | id, name, area, capacityMin, capacityMax, isActive | Maps to `booking_resources` table |
| `BookingDefaultRules` | slotMinutes, defaultDurationMinutes, turnoverBufferMinutes, holdTtlMinutes, minPartySize, maxPartySize, phoneRequired, advanceBookingDays, peakModeEnabled | Single-row table |
| `BookingPeakRule` | id, name, dayOfWeek, startTime, endTime, isEnabled, durationMinutes?, bufferMinutes?, minPartySize?, maxCapacityWaste?, tableSelectionAllowed? | Per-day rules |
| `BlockedPeriod` | id, resourceId (nullable), startsAt, endsAt, reason? | Null resourceId = all tables |
| `BookingHold` | id, resourceId, partySize, startsAt, endsAt, expiresAt, status | Status: active/confirmed/expired/released |
| `Booking` | id, resourceId, holdId, customerName, customerEmail, customerPhone, partySize, startsAt, endsAt, status, confirmationCode, idempotencyKey | Status: confirmed/cancelled/no_show |
| `OpeningWindow` | dayOfWeek, isClosed, lunchOpen?, lunchClose?, dinnerOpen?, dinnerClose? | 7 rows |
| `AvailabilityInput` | partySize, date, resourcePreference?, now? | Input to calculateAvailability |
| `AvailabilityData` | resources, rules, peakRules, openingHours, blockedPeriods, holds, bookings | Aggregated data pool |
| `AvailabilitySlot` | startsAt, endsAt, durationMinutes, bufferMinutes, resources[], tableSelectionAllowed, isPeak | Output from calculateAvailability |
| `ConfirmedBookingSummary` | confirmationCode, customerName, customerEmail, customerPhone, partySize, startsAt, endsAt, resourceName, emailStatus | Public-facing summary |

**Gap:** No type exists for "table status in a time range" — the Planner will need a new type like:
```ts
type ResourceStatus = {
  resource: BookingResource;
  status: 'available' | 'booked' | 'held';
  bookings: Booking[];  // bookings overlapping the selected range
  holds: BookingHold[]; // holds overlapping the selected range
};
```

### 10. PATCH Route Patterns — Verified

**Existing PATCH routes found:**

| Route File | Pattern |
|-----------|---------|
| `src/app/api/admin/bookings/blocks/route.ts` | Extract `{ id, ...updates }` from body, `.update(updates).eq("id", id)`, audit |
| `src/app/api/admin/bookings/rules/route.ts` | `.upsert(body.rules)` on single-row config table |
| `src/app/api/admin/bookings/peak-rules/route.ts` | `.upsert(body.rules || [])` on array |
| `src/app/api/admin/bookings/resources/route.ts` | `.upsert(body.resources || [])` on array |
| `src/app/api/admin/venue/route.ts` | `.upsert(body)` on single-row settings |

**Best PATCH template for booking update** is the blocks route pattern:

```typescript
export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;
  if (!bookingDbConfigured()) return NextResponse.json({ success: true, audit: "booking.updated" });
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  // PRE-CHECK: if resource_id, starts_at, or ends_at changed, check overlap
  const { data, error } = await supabase.from("bookings").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("booking_audit_events").insert({ 
    actor_id: auth.user.id, 
    action: updates.resource_id ? "booking.moved" : "booking.updated", 
    entity_type: "booking", 
    entity_id: id, 
    metadata: updates 
  });
  return NextResponse.json({ data });
}
```

**Important note on overlap checking:** The DB has exclusion constraints (`bookings_no_confirmed_overlap`) that will reject overlapping bookings at the database level. However, the API should pre-check and return a user-friendly error rather than relying on the DB to throw. The Planner should use a simple overlap query to pre-validate rather than relying on raw Postgres error messages.
## Constraints Identified

### Hard Constraints (beyond INTAKE invariants)

1. **Exclusion constraint at DB level:** `bookings_no_confirmed_overlap` uses GiST index on `(resource_id, tstzrange(starts_at, ends_at, '[)'))` WHERE `status = 'confirmed'`. Any PATCH/POST that creates overlapping confirmed bookings will fail with a Postgres error. The API MUST pre-validate to return user-friendly errors.

2. **ON DELETE RESTRICT on bookings.resource_id:** Cannot delete `booking_resources` rows that have existing bookings. Migration must preserve existing resource IDs — mark inactive, don't delete.

3. **ON DELETE RESTRICT on booking_holds.resource_id:** Same constraint on holds table.

4. **Existing `DELETE` booking is a soft delete:** Sets `status = 'cancelled'`, does not remove the row. Cancelled bookings don't trigger the exclusion constraint (it only applies to `status = 'confirmed'`). This is correct behavior.

5. **Booking confirmation codes use pattern `RD-XXXXXX-XXXX`** (from `createConfirmationCode()` in `src/lib/booking/confirmation-code.ts`). Admin-created bookings must use same pattern.

6. **booking_email_jobs has `ON DELETE CASCADE` on booking_id:** Deleting a booking cascades to email jobs. But since DELETE is soft (status change), this won't trigger.

7. **The public booking flow is in `src/app/api/booking/*`** — completely separate from `src/app/api/admin/bookings/*`. No risk of accidental modification, but the Executor must verify.

8. **`booking_audit_events` RLS is SELECT-only for authenticated users.** Inserts are done via admin client (service role, bypasses RLS). This pattern is correct and must be followed.

9. **`requireAdminUser()` returns `{ user: { id: string } }`** — the user ID is available for audit `actor_id`. All admin routes use this.

10. **All admin routes use `createSupabaseAdminClient()`** which uses `SUPABASE_SERVICE_ROLE_KEY` env var. Must be set in `.env.local` for the feature to work.

### Design Constraints

11. **Floor plan image is at `/images/floor-plan.png`** (not `/public/images/` — Next.js serves from `public/` at root). The current code uses `/images/floor-plan.png` which is correct for Next.js.

12. **Warm theme must be scoped.** The admin panel uses dark theme (`#1A1714`, `#2C231D`, `#3D3229`, etc.). The floor plan area must use the warm cream/orange/charcoal palette from table3.html but confined to a CSS container to avoid leaking dark admin styles.

13. **Table sizes differ.** Tables 1-27 use `standard` size (5.8% x 7.8%), tables 28-35 use `small` size (4% x 5.2%). The position map in `specs/floor-plan-intake-spec.md` includes a `Size Class` column.

### Data Constraints

14. **The spec position map may have a discrepancy vs table3.html:** In the HTML, tables 28-35 are in a specific non-sequential order: 28, 29, 32, 34 in top row; 30, 31, 33, 35 in bottom row. The spec position map lists them as sequential 28-35. The Planner should use the **HTML positions** as source of truth since those are the actual rendered positions.

15. **Demo mode fallback:** All API routes check `bookingDbConfigured()` and fall back to `devBookingStore` / demo data. The new PATCH/POST routes must also handle demo mode gracefully.

## Existing Patterns

### API Route Pattern (canonical)

Every admin API route follows this exact structure:
```
1. requireAdminUser() guard -> return 401 if unauthenticated
2. bookingDbConfigured() check -> return dev/demo data if no Supabase
3. Parse request body (for mutations)
4. Validate required fields -> return 400 if missing
5. createSupabaseAdminClient() -> perform DB operation
6. Insert booking_audit_events row
7. Return NextResponse.json({ data }) or { success: true }
8. Catch errors -> return 500 with error.message
```

### Component Pattern

- Client components use `"use client"` directive
- State management via `useState` + `useCallback` + `useEffect`
- Fetch via native `fetch()` to API routes (no Supabase client in browser)
- Error/success messages displayed as banner toasts
- Data re-fetched after mutations via `refresh()` callback

### File Naming Convention

- API routes: `src/app/api/admin/{resource}/route.ts` — Next.js App Router convention
- Components: `src/components/admin/{ComponentName}.tsx`
- Lib utilities: `src/lib/booking/{purpose}.ts`
- All TypeScript, strict mode

### Code Quality Patterns

- Snake_case in API responses (from Supabase), camelCase in TypeScript types
- `rn()` helper normalizes between snake and camel in existing component
- No ORM — direct Supabase client calls
- No ORM migrations — raw SQL in `supabase/migrations/`
## Recommendations

### 1. Migration Strategy
Create `006_floor_plan_tables.sql` that:
- INSERTS 31 new rows (Tables 1, 3, 5-35) with capacity 1/1
- UPDATES existing Table 2 and Table 4 to capacity 1/1
- UPDATES Booth 6 and Large Table to `is_active = false`
- Uses `ON CONFLICT DO NOTHING` or `WHERE NOT EXISTS` guards for idempotency

### 2. API Design
Add to `src/app/api/admin/bookings/route.ts`:
- Extend `GET` to accept `?date=YYYY-MM-DD&from=HH:MM&to=HH:MM` query params
- Add `PATCH` for update/move (distinguish by whether `resource_id` changed)
- Add `POST` for admin create booking (generates confirmation code via `createConfirmationCode()`, no hold flow, no email job)

### 3. Availability Engine Extension
Don't rewrite `calculateAvailability()`. Instead, create a new function in `availability.ts`:
```ts
export function getResourceStatuses(
  date: string, fromTime: string, toTime: string, data: AvailabilityData
): Map<string, ResourceStatus>
```
That reuses `isResourceFree()` from the existing module for overlap checking per resource.

### 4. Component Architecture
Create `src/components/admin/InteractiveFloorPlan.tsx`:
- Date picker (native `<input type="date">`) + start/end time selects
- Fetches filtered bookings/holds when date/time changes
- 35 table buttons with table3.html styling, positioned via static map
- Detail panel modal with 4 actions: Cancel, Update, Move, Create
- Drag-and-drop via `@dnd-kit/core` for move (desktop only)
- Click-based move modal fallback (for tablets)
- Warm theme scoped via CSS class `fp-warm` on floor plan container

### 5. Drag-and-Drop Priority
Start with click-based move modal (simpler, works everywhere). Add `@dnd-kit` drag-and-drop as enhancement. This aligns with the "MVP only" principle from the INTAKE.

### 6. Pre-validation for Overlap
Before PATCH update with changed resource_id/starts_at/ends_at, query for conflicting bookings:
```sql
SELECT 1 FROM bookings 
WHERE resource_id = $new_resource_id 
AND status = 'confirmed' 
AND id != $booking_id
AND tstzrange(starts_at, ends_at, '[)') && tstzrange($new_starts_at, $new_ends_at, '[)')
```
If row exists, return 409 with clear message naming the conflicting booking.

## Unknowns Remaining

1. **Floor plan image alignment:** The `/images/floor-plan.png` may not perfectly match the percentage positions from table3.html. The Executor must verify alignment early and adjust positions if needed.

2. **Timezone handling:** All dates/times in the DB are `TIMESTAMPTZ`. The current code uses UTC dates (`dateOnly()`, `setDateTime()`, `dayOfWeekUtc()`). The floor plan must use the same UTC-based approach. What timezone does the restaurant operate in? If non-UTC, the date picker may need timezone offset handling.

3. **opening_hours table:** Has `day_name` column (human-readable) in addition to `day_of_week`. The `getAvailabilityData()` function maps `day_of_week` -> `dayOfWeek` but doesn't include `day_name`. Confirm this doesn't affect floor plan logic.

4. **Table 2 and Table 4 existing bookings:** If there are confirmed bookings with party_size > 1 on Table 2 or Table 4, changing capacity to 1 would create inconsistency between `party_size` and `capacity_max`. The migration should query for this before updating.

5. **Peak rules and capacity 1 tables:** During peak hours, `minPartySize` may be 2 (from existing peak rules). With all tables having capacity 1, peak rules with minPartySize=2 would block all bookings. The Planner should either disable peak rules for the floor plan view or update peak rules to accommodate capacity-1 tables.

6. **The `booking_resources` table has RLS policy `booking_resources_admin_all`** allowing ALL operations for authenticated users. The admin client (service role) bypasses RLS, but if any client-side code directly queries `booking_resources`, it would need auth. Currently only server-side code queries it — safe.

7. **Email sending on admin mutations:** The INTAKE explicitly requires no emails for admin mutations. The Executor must ensure the new POST (admin create) and PATCH routes do NOT insert into `booking_email_jobs` or call `sendBookingConfirmation()`. The existing DELETE route correctly omits email — use it as template.

8. **Concurrent mutations:** With 1-2 staff users, race conditions are unlikely but possible. The DB exclusion constraint acts as the final guard. However, if two admins update the same booking simultaneously, the last write wins. Consider optimistic locking via `updated_at` column check — low priority per INTAKE scope.