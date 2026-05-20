---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260519-011017
context_saturation_estimate: "~36%"
context_handoff_threshold_percent: 40
threshold_source: user_prompt
---

[PLANNER CONTEXT — START]
self_estimate: ~36%
context_handoff_threshold_percent: 40
threshold_source: user_prompt
health: HEALTHY
[PLANNER CONTEXT — END]

# ATT_2_PLAN — Interactive Floor Plan Implementation

## Task Statement

Replace the static FloorPlan.tsx component on `/admin/bookings` (floor-plan tab) with a date-and-time-range-aware interactive floor plan displaying all 35 tables as styled buttons overlaid on the existing floor-plan image. Staff select a date and time range, see tables color-coded by availability (available/booked/held), click tables for a detail panel offering Cancel/Update/Move/Create operations. All mutations are audited via `booking_audit_events`, all silent (no customer emails), all preserving existing DB constraints and the public booking flow.


---

## Invariants

Carried forward from INTAKE plus codebase inspection:

1. **DB overlap constraints must not be violated** — `bookings_no_confirmed_overlap` GiST exclusion on `(resource_id, tstzrange(starts_at, ends_at, '[)'))` WHERE `status = 'confirmed'` is the final guard. API must pre-check and return user-friendly 409 before hitting the DB error.
2. **Existing bookings must not be silently altered or lost** — All mutations log to `booking_audit_events`. PATCH is atomic update, not cancel+create.
3. **Public booking flow must remain unchanged** — Do not touch `src/app/(public)/reservations/*` or `src/app/api/booking/*`.
4. **Admin list tab must remain functional** — The existing `tab === "list"` branch in `src/app/admin/bookings/page.tsx` must work identically.
5. **All mutations must be audited** — Every cancel, update, move, create produces a `booking_audit_events` row.
6. **Cancel/update/move/create must not trigger customer emails** — Do NOT insert into `booking_email_jobs`.
7. **Floor plan visual state must accurately reflect DB state** — Re-fetch after every mutation and on date/time change.
8. **Party size must not exceed table capacity** — All 35 tables have capacity 1. Party size > 1 must be rejected with 400.
9. **ON DELETE RESTRICT on bookings.resource_id** — Migration must not delete resource rows with existing bookings. Mark mismatched rows is_active = false.
10. **Existing DELETE is a soft delete** — Sets status = cancelled, does not remove rows. Must preserve this behavior.

---

## Success Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | Floor plan displays all 35 tables with correct status for selected date/time range | Seed known bookings, load floor plan, confirm color coding matches DB |
| 2 | Date picker and time range selectors update floor plan correctly | Change date/time; confirm statuses update and network request fires with query params |
| 3 | Cancel booking from detail panel succeeds, table turns available | Click amber table, Cancel; verify DB status=cancelled, audit row, UI turns green |
| 4 | Update booking fields persist; invalid party size (>1) rejected | Update name, verify; attempt party_size=2, confirm 400 error |
| 5 | Drag-and-drop move to different table succeeds | Drag to green table; verify resource_id changes in DB, audit row action=booking.moved |
| 6 | Drag-and-drop move to occupied table blocked with clear error | Drag to amber table; confirm rejection toast with conflict info |
| 7 | Create booking from available table succeeds with confirmation code | Click green table, fill form; verify RD-XXXXXX-XXXX code, audit row, no email job |
| 8 | All admin mutations produce booking_audit_events rows | Query booking_audit_events after each operation type |
| 9 | No booking_email_jobs rows created for admin mutations | Query booking_email_jobs after admin create/update/move |
| 10 | Public booking flow unaffected | Run full hold->confirm->email flow end-to-end |


---

## Implementation Steps

### Step 1: Database Migration — 35 Table Resources

**1a. Create migration file `supabase/migrations/006_floor_plan_tables.sql`:**

```sql
-- 006_floor_plan_tables: Populate all 35 tables (capacity 1), deactivate non-matching resources.

-- 1. Deactivate Booth 6 and Large Table (preserve referential integrity)
UPDATE booking_resources SET is_active = false, updated_at = now()
WHERE name IN ('Booth 6', 'Large Table');

-- 2. Update Table 2 and Table 4 to capacity 1/1
UPDATE booking_resources SET capacity_min = 1, capacity_max = 1, updated_at = now()
WHERE name IN ('Table 2', 'Table 4');

-- 3. Insert all 35 tables with capacity 1/1, sorted by table number.
-- Uses WHERE NOT EXISTS on name for idempotency.
INSERT INTO booking_resources (name, area, capacity_min, capacity_max, sort_order, is_active)
SELECT v.name, 'Dining Room', 1, 1, v.sort_order, true
FROM (VALUES
  ('Table 1',  1),  ('Table 2',  2),  ('Table 3',  3),  ('Table 4',  4),
  ('Table 5',  5),  ('Table 6',  6),  ('Table 7',  7),  ('Table 8',  8),
  ('Table 9',  9),  ('Table 10', 10), ('Table 11', 11), ('Table 12', 12),
  ('Table 13', 13), ('Table 14', 14), ('Table 15', 15), ('Table 16', 16),
  ('Table 17', 17), ('Table 18', 18), ('Table 19', 19), ('Table 20', 20),
  ('Table 21', 21), ('Table 22', 22), ('Table 23', 23), ('Table 24', 24),
  ('Table 25', 25), ('Table 26', 26), ('Table 27', 27), ('Table 28', 28),
  ('Table 29', 29), ('Table 30', 30), ('Table 31', 31), ('Table 32', 32),
  ('Table 33', 33), ('Table 34', 34), ('Table 35', 35)
) AS v(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM booking_resources WHERE name = v.name);
```

**1b. Apply migration:** `npx supabase migration up` (or run SQL directly in Supabase dashboard).

**1c. Verify:**
```sql
SELECT name, capacity_min, capacity_max, is_active, sort_order 
FROM booking_resources ORDER BY sort_order;
```
Expected: 37 rows total — 35 active Tables 1-35 (all capacity_min=1, capacity_max=1), + inactive Booth 6 and Large Table.

**1d. Pre-check for data conflicts (run BEFORE applying capacity change on Table 2/4):**
```sql
SELECT b.id, b.party_size, b.customer_name, r.name 
FROM bookings b JOIN booking_resources r ON b.resource_id = r.id 
WHERE r.name IN ('Table 2','Table 4') AND b.party_size > 1 AND b.status = 'confirmed';
```
If rows exist, escalate — this is a data inconsistency risk.

**1e. Update `src/lib/booking/rules.ts` — replace DEMO_RESOURCES:**
```typescript
export const DEMO_RESOURCES = Array.from({ length: 35 }, (_, i) => ({
  id: `demo-table-${i + 1}`,
  name: `Table ${i + 1}`,
  area: "Dining Room",
  capacityMin: 1,
  capacityMax: 1,
  isActive: true,
}));
```

**1f. Update `src/lib/booking/rules.ts` — in DEMO_PEAK_RULES, change `minPartySize: 2` to `minPartySize: 1` in both peak rules.** This prevents public booking flow from blocking all capacity-1 tables during peak hours.

---

### Step 2: API Routes — Extend GET, Add PATCH, Add POST

All changes in **`src/app/api/admin/bookings/route.ts`**.

**2a. Add imports at top of file (after existing imports):**
```typescript
import { overlaps } from "@/lib/booking/time";
import { createConfirmationCode } from "@/lib/booking/confirmation-code";
```

**2b. Replace the `GET()` function to accept optional query params:**

Replace the existing `export async function GET()` with:
```typescript
export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!bookingDbConfigured()) {
    let filtered = devBookingStore.bookings;
    if (date && from && to) {
      const startsAt = `${date}T${from}:00.000Z`;
      const endsAt = `${date}T${to}:00.000Z`;
      filtered = devBookingStore.bookings.filter(
        (b) => overlaps(startsAt, endsAt, b.startsAt, b.endsAt)
      );
    }
    return NextResponse.json({ data: filtered });
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("bookings")
    .select("*,booking_resources(name),booking_email_jobs(status,kind,attempts,last_error)")
    .order("starts_at", { ascending: false });

  if (date && from && to) {
    const rangeStart = `${date}T${from}:00.000Z`;
    const rangeEnd = `${date}T${to}:00.000Z`;
    query = query
      .eq("status", "confirmed")
      .gte("starts_at", rangeStart)
      .lte("starts_at", rangeEnd);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

**IMPORTANT:** The existing unfiltered GET (no query params, used by admin list tab) must still work identically. Verify by calling `GET /api/admin/bookings` (no params) and confirming same response shape as before.


**2c. Add PATCH handler (update/move booking):**

Add this export after the DELETE handler in `src/app/api/admin/bookings/route.ts`:

```typescript
export async function PATCH(request: Request) {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;

  if (!bookingDbConfigured()) {
    const body = await request.json();
    const { id, ...updates } = body;
    devBookingStore.updateBooking(id, updates);
    return NextResponse.json({ success: true });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Validate party_size against capacity if provided
  if (updates.party_size !== undefined) {
    const supabase = createSupabaseAdminClient();
    const { data: currentBooking } = await supabase
      .from("bookings").select("resource_id").eq("id", id).single();
    const resourceId = updates.resource_id || currentBooking?.resource_id;
    if (resourceId) {
      const { data: resource } = await supabase
        .from("booking_resources").select("capacity_max").eq("id", resourceId).single();
      if (resource && updates.party_size > resource.capacity_max) {
        return NextResponse.json({
          error: `Party size ${updates.party_size} exceeds table capacity ${resource.capacity_max}`
        }, { status: 400 });
      }
    }
  }

  // Pre-check overlap if resource_id, starts_at, or ends_at changed
  if (updates.resource_id || updates.starts_at || updates.ends_at) {
    const supabase = createSupabaseAdminClient();
    const { data: current } = await supabase
      .from("bookings").select("resource_id,starts_at,ends_at").eq("id", id).single();
    if (current) {
      const newResourceId = updates.resource_id || current.resource_id;
      const newStartsAt = updates.starts_at || current.starts_at;
      const newEndsAt = updates.ends_at || current.ends_at;
      const { data: conflicts, error: conflictError } = await supabase
        .from("bookings")
        .select("id,customer_name,confirmation_code")
        .eq("resource_id", newResourceId)
        .eq("status", "confirmed")
        .neq("id", id)
        .lte("starts_at", newEndsAt)
        .gte("ends_at", newStartsAt);
      if (conflictError) {
        return NextResponse.json({ error: conflictError.message }, { status: 500 });
      }
      if (conflicts && conflicts.length > 0) {
        const names = conflicts
          .map((c: any) => `${c.customer_name} (${c.confirmation_code})`)
          .join(", ");
        return NextResponse.json({
          error: `Time conflict with existing booking(s): ${names}`
        }, { status: 409 });
      }
    }
  }

  // Perform update
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit: distinguish move from update by whether resource_id changed
  const action = updates.resource_id ? "booking.moved" : "booking.updated";
  await supabase.from("booking_audit_events").insert({
    actor_id: auth.user.id,
    action,
    entity_type: "booking",
    entity_id: id,
    metadata: updates,
  });

  return NextResponse.json({ data });
}
```

**2d. Add POST handler (admin create booking):**

Add this export after the PATCH handler:

```typescript
export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;

  if (!bookingDbConfigured()) {
    const body = await request.json();
    const booking = devBookingStore.createBooking({
      ...body,
      confirmationCode: createConfirmationCode(),
    });
    return NextResponse.json({ data: booking }, { status: 201 });
  }

  const body = await request.json();
  const { resource_id, customer_name, customer_email, customer_phone,
          party_size, starts_at, ends_at } = body;

  // Validate required fields
  if (!resource_id || !customer_name || !customer_email ||
      !starts_at || !ends_at || party_size == null) {
    return NextResponse.json({
      error: "Missing required fields: resource_id, customer_name, customer_email, starts_at, ends_at, party_size"
    }, { status: 400 });
  }

  // Validate party_size against table capacity
  const supabase = createSupabaseAdminClient();
  const { data: resource } = await supabase
    .from("booking_resources").select("capacity_max").eq("id", resource_id).single();
  if (!resource) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }
  if (party_size > resource.capacity_max) {
    return NextResponse.json({
      error: `Party size ${party_size} exceeds table capacity ${resource.capacity_max}`
    }, { status: 400 });
  }

  // Pre-check overlap
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("id,customer_name")
    .eq("resource_id", resource_id)
    .eq("status", "confirmed")
    .lte("starts_at", ends_at)
    .gte("ends_at", starts_at);
  if (conflictError) {
    return NextResponse.json({ error: conflictError.message }, { status: 500 });
  }
  if (conflicts && conflicts.length > 0) {
    const names = conflicts.map((c: any) => c.customer_name).join(", ");
    return NextResponse.json({
      error: `Time conflict with existing booking(s): ${names}`
    }, { status: 409 });
  }

  // Generate codes and insert
  const confirmationCode = createConfirmationCode();
  const idempotencyKey = crypto.randomUUID();

  const { data, error } = await supabase.from("bookings").insert({
    resource_id,
    customer_name,
    customer_email,
    customer_phone: customer_phone || null,
    party_size,
    starts_at,
    ends_at,
    status: "confirmed",
    confirmation_code: confirmationCode,
    idempotency_key: idempotencyKey,
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit only — NO email job (silent admin mutation)
  await supabase.from("booking_audit_events").insert({
    actor_id: auth.user.id,
    action: "booking.admin_created",
    entity_type: "booking",
    entity_id: data.id,
    metadata: {
      confirmation_code: confirmationCode,
      resource_id,
      party_size,
    },
  });

  return NextResponse.json({ data }, { status: 201 });
}
```


**2e. Update dev-store in `src/lib/booking/dev-store.ts`:**

Add two methods to the `devBookingStore` object:

```typescript
updateBooking(id: string, updates: Partial<Booking>) {
  const idx = this.bookings.findIndex((b) => b.id === id);
  if (idx !== -1) Object.assign(this.bookings[idx], updates);
},
createBooking(input: {
  resourceId: string; customerName: string; customerEmail: string;
  customerPhone?: string | null; partySize: number; startsAt: string;
  endsAt: string; confirmationCode: string;
}) {
  const booking: Booking = {
    id: crypto.randomUUID(),
    status: "confirmed" as const,
    idempotencyKey: crypto.randomUUID(),
    holdId: null,
    resourceId: input.resourceId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone || null,
    partySize: input.partySize,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    confirmationCode: input.confirmationCode,
  };
  this.bookings.push(booking);
  return booking;
},
```

**2f. Extend holds GET in `src/app/api/admin/bookings/holds/route.ts`:**

Replace the `GET()` function to accept `?date=...&from=...&to=...` query params:

```typescript
import { overlaps } from "@/lib/booking/time";  // add this import

export async function GET(request: Request) {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!bookingDbConfigured()) {
    let filtered = devBookingStore.holds;
    if (date && from && to) {
      const startsAt = `${date}T${from}:00.000Z`;
      const endsAt = `${date}T${to}:00.000Z`;
      const now = new Date();
      filtered = devBookingStore.holds.filter((h) => {
        if (h.status !== "active") return false;
        if (new Date(h.expiresAt).getTime() <= now.getTime()) return false;
        return overlaps(startsAt, endsAt, h.startsAt, h.endsAt);
      });
    }
    return NextResponse.json({ data: filtered });
  }

  const supabase = createSupabaseAdminClient();
  if (date && from && to) {
    const rangeStart = `${date}T${from}:00.000Z`;
    const rangeEnd = `${date}T${to}:00.000Z`;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("booking_holds")
      .select("*")
      .eq("status", "active")
      .gt("expires_at", now)
      .lte("starts_at", rangeEnd)
      .gte("ends_at", rangeStart)
      .order("starts_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // Unfiltered fallback (existing behavior)
  const { data, error } = await supabase
    .from("booking_holds")
    .select("*")
    .eq("status", "active")
    .order("starts_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

---

### Step 3: Table Position Data Module

Create **`src/lib/floor-plan/table-positions.ts`**:

```typescript
export interface TablePosition {
  tableNumber: number;
  leftPercent: number;
  topPercent: number;
  sizeClass: "standard" | "small";
}

export const TABLE_POSITIONS: TablePosition[] = [
  { tableNumber: 1,  leftPercent: 14.7, topPercent: 22.3, sizeClass: "standard" },
  { tableNumber: 2,  leftPercent: 14.7, topPercent: 13.6, sizeClass: "standard" },
  { tableNumber: 3,  leftPercent: 26.0, topPercent: 1.3,  sizeClass: "standard" },
  { tableNumber: 4,  leftPercent: 32.4, topPercent: 1.3,  sizeClass: "standard" },
  { tableNumber: 5,  leftPercent: 65.4, topPercent: 1.3,  sizeClass: "standard" },
  { tableNumber: 6,  leftPercent: 72.0, topPercent: 1.3,  sizeClass: "standard" },
  { tableNumber: 7,  leftPercent: 65.4, topPercent: 9.5,  sizeClass: "standard" },
  { tableNumber: 8,  leftPercent: 72.0, topPercent: 9.5,  sizeClass: "standard" },
  { tableNumber: 9,  leftPercent: 65.4, topPercent: 17.4, sizeClass: "standard" },
  { tableNumber: 10, leftPercent: 72.0, topPercent: 17.4, sizeClass: "standard" },
  { tableNumber: 11, leftPercent: 65.4, topPercent: 25.1, sizeClass: "standard" },
  { tableNumber: 12, leftPercent: 72.0, topPercent: 25.1, sizeClass: "standard" },
  { tableNumber: 13, leftPercent: 85.7, topPercent: 14.4, sizeClass: "standard" },
  { tableNumber: 14, leftPercent: 85.7, topPercent: 22.3, sizeClass: "standard" },
  { tableNumber: 15, leftPercent: 85.7, topPercent: 30.3, sizeClass: "standard" },
  { tableNumber: 16, leftPercent: 85.7, topPercent: 38.2, sizeClass: "standard" },
  { tableNumber: 17, leftPercent: 55.9, topPercent: 36.7, sizeClass: "standard" },
  { tableNumber: 18, leftPercent: 55.9, topPercent: 44.6, sizeClass: "standard" },
  { tableNumber: 19, leftPercent: 55.9, topPercent: 52.6, sizeClass: "standard" },
  { tableNumber: 20, leftPercent: 55.9, topPercent: 60.5, sizeClass: "standard" },
  { tableNumber: 21, leftPercent: 55.9, topPercent: 68.5, sizeClass: "standard" },
  { tableNumber: 22, leftPercent: 55.9, topPercent: 76.4, sizeClass: "standard" },
  { tableNumber: 23, leftPercent: 55.9, topPercent: 84.4, sizeClass: "standard" },
  { tableNumber: 24, leftPercent: 85.7, topPercent: 49.2, sizeClass: "standard" },
  { tableNumber: 25, leftPercent: 85.7, topPercent: 57.2, sizeClass: "standard" },
  { tableNumber: 26, leftPercent: 85.7, topPercent: 65.1, sizeClass: "standard" },
  { tableNumber: 27, leftPercent: 85.7, topPercent: 73.1, sizeClass: "standard" },
  { tableNumber: 28, leftPercent: 25.0, topPercent: 26.2, sizeClass: "small" },
  { tableNumber: 29, leftPercent: 29.5, topPercent: 26.2, sizeClass: "small" },
  { tableNumber: 30, leftPercent: 25.0, topPercent: 31.5, sizeClass: "small" },
  { tableNumber: 31, leftPercent: 29.5, topPercent: 31.5, sizeClass: "small" },
  { tableNumber: 32, leftPercent: 34.2, topPercent: 26.2, sizeClass: "small" },
  { tableNumber: 33, leftPercent: 34.2, topPercent: 31.5, sizeClass: "small" },
  { tableNumber: 34, leftPercent: 38.9, topPercent: 26.2, sizeClass: "small" },
  { tableNumber: 35, leftPercent: 38.9, topPercent: 31.5, sizeClass: "small" },
];

export function getPositionForTable(tableNumber: number): TablePosition | undefined {
  return TABLE_POSITIONS.find((t) => t.tableNumber === tableNumber);
}
```

Create the directory first:
```bash
mkdir -p src/lib/floor-plan
```


---

### Step 4: New InteractiveFloorPlan Component

Create **`src/components/admin/InteractiveFloorPlan.tsx`**. This is the largest file. The Executor must build the following architecture:

**File structure (all inside one `"use client"` file):**

```
"use client"
Imports
Warm theme CSS constant (WARM_THEME object)
Time slot constant (TIME_SLOTS array)
Type definitions (ApiResource, ApiBooking, ApiHold — matching FloorPlan.tsx patterns)
rn() helper (same as existing FloorPlan.tsx)
formatTime() helper (same as existing FloorPlan.tsx)
computeStatusForResource() — derives available/booked/held from overlap logic
DraggableBooking (useDraggable hook wrapper) — Step 5
DroppableTable (useDroppable hook wrapper) — Step 5
InteractiveFloorPlan() — main default export
  State:
    selectedDate: string (today's date in YYYY-MM-DD)
    fromTime: string (default "17:00")
    toTime: string (default "18:00")
    resources: ApiResource[]
    bookings: ApiBooking[]
    holds: ApiHold[]
    loading: boolean
    message: string (toast)
    selectedResource: ApiResource | null
    detailMode: "view" | "edit" | "create" | "move"
    editingBooking: ApiBooking | null
    editForm: { customerName, customerEmail, customerPhone, partySize, date, fromTime, toTime }
    moveSourceBooking: ApiBooking | null

  refreshData(): fetches GET /api/admin/bookings/resources (always all),
    GET /api/admin/bookings?date=...&from=...&to=...,
    GET /api/admin/bookings/holds?date=...&from=...&to=...

  Handlers:
    handleDateChange(e), handleFromTimeChange(e), handleToTimeChange(e)
    handleTableClick(resource)
    handleCancel(bookingId)
    handleUpdateSubmit() — PATCH
    handleCreateSubmit() — POST
    handleMoveToTable(targetResourceId) — PATCH with resource_id change
    handleDragEnd(event: DragEndEvent) — Step 5

  Sub-renders (returned inline or as local components):
    <DatePickerBar> — date input + from/to time selects + legend
      - Styled with warm theme (cream bg, charcoal text, orange accents)
      - <input type="date"> with value={selectedDate}
      - Two <select> dropdowns from TIME_SLOTS
      - Legend: green/amber/grey dots with labels

    <FloorPlanContainer> — the main visual area
      - Wrapped in <DndContext onDragEnd={handleDragEnd}> (Step 5)
      - Outer div: position relative, warm radial+linear gradient bg,
        border-radius: 20px, border 2px solid WARM_THEME.orangeDeep
      - Inner div: position relative, aspectRatio "16/9", maxHeight "65vh"
      - <img> of /images/floor-plan.png, position absolute, object-contain
      - 35 <TableButton> elements overlaid at percentage positions
      - Fixed layout area labels (DOOR, ENTRANCE, BAF, B.KITCHEN, F.KITCHEN)
        as non-interactive text divs

    <TableButton> per table:
      - Position: absolute, left from TABLE_POSITIONS, top from TABLE_POSITIONS
      - Size: standard tables 5.8% x 7.8%, small tables 4% x 5.2%
      - Styling: orange gradient bg (linear-gradient(145deg, #ff9a3d, orange)),
        border 2px solid orangeDeep, border-radius 6px
      - Hover: scale(1.04), box-shadow glow ring
      - When selected: charcoal bg, cream text, orangeLight border
      - Status overlay: 3px border-left colored by status (green/amber/grey)
      - Text: table number in bold, centered
      - onClick: handleTableClick
      - Wrapped in <DroppableTable> (Step 5)

    <DetailPanel> — modal overlay:
      - Fixed inset-0 bg-black/60 backdrop
      - Centered panel with warm theme styling (cream bg, charcoal text)
      - Header: table name + close button
      - For each booking on this table in range:
        Booking card showing: customer name, party size, time range, confirmation code
        Action buttons: Cancel, Update, Move
        Cancel: confirmation prompt, then DELETE call
        Update: switches detailMode to "edit", loads booking into editForm
        Move: activates move mode (click-based table selector OR drag prompt)
        Booking card wrapped in <DraggableBooking> (Step 5)
      - For each active hold: hold card with party size, time, expires info
      - If table is "available" (no bookings/holds): "Create Booking" button
        switches detailMode to "create"
      - Close button at bottom

    <EditForm> — shown when detailMode === "edit":
      - Fields: customer name (text), party size (number, max 1, readonly),
        date (date input), from time (select), to time (select)
      - Note: table assignment NOT editable here (use Move for that)
      - Save button: calls PATCH /api/admin/bookings
      - Cancel button: returns to view mode

    <CreateForm> — shown when detailMode === "create":
      - Fields: customer name (text), customer email (text), 
        customer phone (text, optional), party size (1, readonly)
      - Date/time pre-filled from selected range
      - Save button: calls POST /api/admin/bookings
      - Cancel button: returns to view mode

    <MoveMode> — shown when detailMode === "move" (click-based fallback):
      - Instruction text: "Click a table to move this booking to"
      - "Or drag the booking card to a table" hint
      - All 35 tables rendered as selectable targets
      - Available (green) tables are clickable
      - Occupied tables are greyed out
      - Cancel button to abort move
```

**Warm theme CSS constant (top of file):**
```typescript
const WARM_THEME = {
  cream: "#fff7eb", paper: "#f6ead7", paperDeep: "#ead7bd",
  charcoal: "#171717", charcoalSoft: "#252525", ink: "#1c1712",
  orange: "#e87422", orangeDeep: "#c95713", orangeLight: "#ffb36b",
  line: "rgba(28, 23, 18, 0.22)", shadow: "rgba(31, 19, 8, 0.18)",
} as const;
```

**Time slots constant:**
```typescript
const TIME_SLOTS = [
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00","21:30","22:00","22:30"
];
```

**Status colors:**
```typescript
const STATUS_COLORS = {
  available: "#4CAF50",
  booked: "#C8892A",
  held: "#A09488",
} as const;
```

**computeStatusForResource() function:**
```typescript
function computeStatusForResource(
  resourceId: string,
  selectedDate: string,
  fromTime: string,
  toTime: string,
  bookings: ApiBooking[],
  holds: ApiHold[]
): "available" | "booked" | "held" {
  const rangeStart = `${selectedDate}T${fromTime}:00.000Z`;
  const rangeEnd = `${selectedDate}T${toTime}:00.000Z`;
  const now = new Date();

  const hasBooking = bookings.some((b) => {
    const rid = rn(b.resource_id, b.resourceId);
    const status = b.status;
    if (status !== "confirmed") return false;
    return rid === resourceId && overlaps(
      rangeStart, rangeEnd,
      rn(b.starts_at, b.startsAt)!,
      rn(b.ends_at, b.endsAt)!
    );
  });
  if (hasBooking) return "booked";

  const hasHold = holds.some((h) => {
    const hid = rn(h.resource_id, h.resourceId);
    if (hid !== resourceId) return false;
    if (rn(h.status, undefined) !== "active") return false;
    const expiresAt = new Date(rn(h.expires_at, h.expiresAt)!);
    if (expiresAt.getTime() <= now.getTime()) return false;
    return overlaps(
      rangeStart, rangeEnd,
      rn(h.starts_at, h.startsAt)!,
      rn(h.ends_at, h.endsAt)!
    );
  });
  if (hasHold) return "held";
  return "available";
}
```

**The `overlaps` function must be imported at the top of the file:**
```typescript
import { overlaps } from "@/lib/booking/time";
```

---

### Step 5: Drag-and-Drop Move Integration

**5a. Install:** cd C:/Users/doner/ramen-don && npm install @dnd-kit/core
Use --legacy-peer-deps if React 19 peer dep warnings.

**5b. Import in InteractiveFloorPlan.tsx:**
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";

**5c. DraggableBooking component** (inside same file):
Wraps a booking card with useDraggable({ id: "booking-" + booking.id, data: { booking } }).
On drag: CSS translate3d transform, 0.5 opacity, grab cursor.
Spreads attributes/listeners/setNodeRef onto wrapper div.
Usage: wrap each booking card in DetailPanel with <DraggableBooking booking={b}>.

**5d. DroppableTable component** (inside same file):
Wraps a TableButton with useDroppable({ id: "table-" + resourceId, data: { resourceId } }).
Shows 3px solid green outline when a draggable is over this zone.
Usage: wrap each <TableButton> in <DroppableTable resourceId={resource.id}>.

**5e. DndContext wrapper:** Wrap the floor plan container in <DndContext onDragEnd={handleDragEnd}>.

**5f. handleDragEnd:** Extract booking from active.data.current.booking and targetResourceId from over.data.current.resourceId. Check: not same table, target is available. Call PATCH /api/admin/bookings with {id, resource_id}. On success: toast, close panel, refreshData(). On error: display json.error.

**5g. Click-based move fallback:** Move button sets detailMode="move", renders table selector grid. Available tables clickable -> handleMoveToTable(targetResourceId) -> same PATCH call without DnD ceremony.

---

### Step 6: Wire Into Admin Bookings Page

In **src/app/admin/bookings/page.tsx**:

6a. Change import: replace FloorPlan with InteractiveFloorPlan
6b. Change tag: replace <FloorPlan /> with <InteractiveFloorPlan />
6c. No other changes. List tab, data fetching, resend-email all untouched.

---

### Step 7: Install Dependencies

cd C:/Users/doner/ramen-don && npm install @dnd-kit/core
Verify: npm ls @dnd-kit/core

---

### Step 8: Verification and Testing

**8a. Migration:** SELECT name, capacity_min, capacity_max, is_active FROM booking_resources ORDER BY sort_order; Expect 37 rows (35 active + 2 inactive).

**8b. API tests** (browser console on /admin/bookings):
- GET filtered: fetch("/api/admin/bookings?date=2026-05-19&from=17:00&to=18:00").then(r=>r.json())
- PATCH update: fetch with method PATCH, body {id, customer_name}
- POST create: fetch with method POST, body {resource_id, customer_name, customer_email, party_size:1, starts_at, ends_at}
- Rejection: party_size=2 should return 400

**8c. Visual:** npm run dev -> /admin/bookings -> Floor Plan tab. Verify: 35 tables, date picker, time selects, color coding, cancel/update/move/create, drag-and-drop.

**8d. Audit:** SELECT action, entity_type FROM booking_audit_events ORDER BY created_at DESC LIMIT 10;

**8e. No emails:** SELECT kind FROM booking_email_jobs ORDER BY created_at DESC LIMIT 10;

**8f. Public flow regression:** /reservations -> hold -> confirm -> verify email job -> verify on floor plan.

**8g. Edge cases:** Drag to same table (blocked), drag to occupied (blocked), create party>1 (rejected), empty day (all green), booking at range edge (half-open exclusion), network failure (error state).

---

## Handoff Notes

### Key Decisions

1. **Move = PATCH, not cancel+create.** Preserves confirmation_code and idempotency_key. Audit action is booking.moved when resource_id changes, booking.updated otherwise.
2. **Status computation is client-side** using overlaps() from src/lib/booking/time.ts. No dedicated status endpoint.
3. **Booth 6 / Large Table:** Marked is_active=false, not deleted. Floor plan filters these out.
4. **Peak rules:** Updated DEMO_PEAK_RULES minPartySize to 1. Live DB peak rules may need same update via admin UI.
5. **Warm theme scoping:** Inline styles with WARM_THEME constant; no Tailwind leakage.
6. **Date/time format:** ISO YYYY-MM-DD + HH:MM. DB stores TIMESTAMPTZ. API uses UTC.
7. **Overlap pre-check:** API uses .lte(starts_at, end).gte(ends_at, start). DB exclusion constraint is final guard. Returns 409 with conflict info.

### Risks from Research

1. **Image alignment:** /images/floor-plan.png may not match table3.html percentage positions. Verify on first render. Small tables (28-35) may need adjustment.
2. **Party_size > 1 on Table 2/4:** Run Step 1d pre-check. Escalate if found.
3. **dnd-kit React 19:** Use --legacy-peer-deps if needed. Click-based move fallback must work independently.
4. **Timezone:** All code uses UTC. Verify times match known bookings for the restaurant timezone.
5. **Unfiltered GET backward compat:** fetch(/api/admin/bookings) without params must still work for admin list tab.

### Files NOT to Modify

src/app/(public)/reservations/*, src/app/api/booking/*, src/lib/booking/availability.ts, src/lib/booking/time.ts, src/lib/supabase-admin.ts, src/lib/supabase-server.ts, src/lib/booking/admin-auth.ts

### Files Modified/Created

NEW: supabase/migrations/006_floor_plan_tables.sql, src/lib/floor-plan/table-positions.ts, src/components/admin/InteractiveFloorPlan.tsx
MODIFIED: src/lib/booking/rules.ts, src/lib/booking/dev-store.ts, src/app/api/admin/bookings/route.ts, src/app/api/admin/bookings/holds/route.ts, src/app/admin/bookings/page.tsx, package.json

### Execution Order

Migration (Step 1) -> API routes (Step 2) -> Position data (Step 3) -> Component (Step 4) -> Drag-and-drop (Step 5) -> Wiring (Step 6) -> Dependencies (Step 7) -> Verification (Step 8)

Each step builds on verified prior work. Nothing breaks between steps.

---

[PLANNER CONTEXT -- END]
self_estimate: ~36%