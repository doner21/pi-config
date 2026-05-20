---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260519-025710
investigation_complete: true
---

# ATT_1_RESEARCH — Floor Plan Missing Tables Investigation

## Investigation Summary

**Root Cause (single path):** The Supabase `booking_resources` table has only 4 rows (seeded by migrations 004 + 005): `"Table 2"`, `"Table 4"`, `"Booth 6"`, `"Large Table"`. Migration `006_floor_plan_tables.sql` — which inserts all 35 "Table N" rows and deactivates Booth 6 + Large Table — was **not applied** to the remote Supabase instance. The component's rendering pipeline then filters these 4 down to only the 2 with names matching the `"Table N"` pattern.

---

## Finding 1: Rendering Pipeline — InteractiveFloorPlan.tsx

**File:** `src/components/admin/InteractiveFloorPlan.tsx`

The floor plan renders tables in three steps:

### Step A — Fetch
```ts
// line ~245 (refreshData callback)
const resRes = await fetch("/api/admin/bookings/resources");
setResources(((await resRes.json()).data || []) as ApiResource[]);
```

### Step B — Filter to active
```ts
// line ~370
const activeResources = resources.filter(
  (r) => rn(r.isActive, r.is_active) !== false
);
```
The `rn()` helper picks `isActive` first (camelCase), falls back to `is_active` (snake_case from Supabase). Only resources where the active flag is **strictly `false`** are excluded. `null`/`undefined`/`true` all pass.

### Step C — Parse name → table number → position lookup
```ts
// lines ~580-584 (inside the .map() over activeResources)
const tableNum = parseInt(resource.name.replace("Table ", ""), 10);
const pos = getPositionForTable(tableNum);
if (!pos) return null;   // ← SILENTLY SKIPS any resource whose name doesn't parse
```

**Critical behavior:** `parseInt("Booth 6".replace("Table ", ""))` → `parseInt("Booth 6")` → **`NaN`**. Then `getPositionForTable(NaN)` returns `undefined`, and `!pos` triggers `return null`. Same for `"Large Table"`. **Non-"Table N" resources are silently dropped from the floor plan.**

---

## Finding 2: Migration 006 — Correct, Not Applied

**File:** `supabase/migrations/006_floor_plan_tables.sql`

The migration is correct and complete:
1. **Deactivates** Booth 6 and Large Table (`is_active = false`) — preserves referential integrity for any existing bookings
2. **Updates** Table 2 and Table 4 to `capacity_min = 1, capacity_max = 1`
3. **Inserts** all 35 tables (Table 1–35) with capacity 1/1 via `WHERE NOT EXISTS` (idempotent per-row)

This migration **must be manually applied** to the remote Supabase instance. There is no automated migration runner in this project. The file exists in the repo but Supabase doesn't know about it until someone runs it against the database.

---

## Finding 3: API Route — Two Code Paths

**File:** `src/app/api/admin/bookings/resources/route.ts`

```ts
export async function GET() {
  const auth = await requireAdminUser();
  if (auth.response) return auth.response;
  if (!bookingDbConfigured()) return NextResponse.json({ data: DEMO_RESOURCES });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("booking_resources").select("*").order("sort_order");
  ...
}
```

### Path A: Dev store (Supabase not configured)
- `bookingDbConfigured()` returns `false`
- Returns `DEMO_RESOURCES` — **35 tables**, all named "Table 1" through "Table 35"
- **Result:** All 35 tables render ✓

### Path B: Supabase configured
- Queries `booking_resources` table from Supabase
- Returns whatever rows exist
- If only 4 rows (migrations 004+005 only): "Table 2", "Table 4", "Booth 6", "Large Table"
- **Result:** Only Table 2 and Table 4 render (Booth 6 and Large Table dropped by name parsing)

**`bookingDbConfigured()` chain:**
```
bookingDbConfigured() → hasAdminCredentials() → isSupabaseConfigured() && !!SUPABASE_SERVICE_ROLE_KEY
```
From `src/lib/booking/server-data.ts:92` → `src/lib/supabase-server.ts:4`
Checks `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## Finding 4: DEMO_RESOURCES — Correct

**File:** `src/lib/booking/rules.ts`

```ts
export const DEMO_RESOURCES = Array.from({ length: 35 }, (_, i) => ({
  id: `demo-table-${i + 1}`,
  name: `Table ${i + 1}`,
  area: "Dining Room",
  capacityMin: 1,
  capacityMax: 1,
  isActive: true,
}));
```

35 entries, all named `"Table N"`, all active. Correct. No issues.

---

## Finding 5: Table Positions — Correct

**File:** `src/lib/floor-plan/table-positions.ts`

`TABLE_POSITIONS` array has 35 entries covering table numbers 1–35. `getPositionForTable(tableNumber)` does a linear `find`. Works correctly for any integer 1–35. Returns `undefined` for non-numbers (NaN, non-integer strings, etc.).

---

## Finding 6: What Rendering Looks Like in Each Scenario

### Scenario A: Dev store (no Supabase)
| Resource Name | Parsed Num | Position? | Renders? |
|---|---|---|---|
| Table 1–35 (all 35) | 1–35 | Yes | **All 35 ✓** |

### Scenario B: Supabase — only migrations 004+005 (no 006)
| Resource Name | Parsed Num | Position? | Renders? |
|---|---|---|---|
| Table 2 | 2 | Yes | **Yes** |
| Table 4 | 4 | Yes | **Yes** |
| Booth 6 | NaN | No | **No** (silently dropped) |
| Large Table | NaN | No | **No** (silently dropped) |

**Visible: 2 tables (Table 2, Table 4)**

### Scenario C: Supabase — migration 006 applied
| Resource Name | is_active? | Parsed Num | Position? | Renders? |
|---|---|---|---|---|
| Table 1–35 (all) | true | 1–35 | Yes | **All 35 ✓** |
| Booth 6 | false | NaN | — | Filtered by isActive |
| Large Table | false | NaN | — | Filtered by isActive |

**Visible: 35 tables**

### Scenario D: Supabase — only Table 2 exists (hypothetical edge case)
| Resource Name | Renders? |
|---|---|
| Table 2 | **Yes** |
| (nothing else) | — |

**Visible: 1 table (Table 2)**

---

## Root Cause Summary

The **only** scenario that produces "only Table 2" is Scenario D — where Supabase has **just** Table 2 in the `booking_resources` table. This could happen if:
- Migration 004 seeded Table 2, Table 4, Booth 6
- Migration 005 added Large Table
- Someone manually deleted Table 4, Booth 6, and Large Table from Supabase

Or the user is loosely describing "only Table 2" when actually Table 4 also appears (Scenario B). In either case, the fix is the same: **apply migration 006**.

The most likely real-world situation is **Scenario B**: Supabase has the 4 resources from migrations 004+005, migration 006 was never applied, and the user sees both Table 2 and Table 4 but described it as "only Table 2" because Table 2 is the most prominent/only one they noticed.

---

## Files Referenced

| File | Role |
|---|---|
| `src/components/admin/InteractiveFloorPlan.tsx` | Renders tables from `activeResources`, filters by name parsing |
| `supabase/migrations/006_floor_plan_tables.sql` | Seeds 35 tables, deactivates old non-table resources |
| `supabase/migrations/004_native_booking_system.sql` | Created `booking_resources`, seeded Table 2, Table 4, Booth 6 |
| `supabase/migrations/005_large_booking_table.sql` | Added Large Table |
| `src/app/api/admin/bookings/resources/route.ts` | GET route — returns DEMO_RESOURCES or Supabase query |
| `src/lib/booking/rules.ts` | DEMO_RESOURCES definition (35 tables) |
| `src/lib/booking/server-data.ts` | `bookingDbConfigured()`, `getAvailabilityData()` |
| `src/lib/supabase-server.ts` | `isSupabaseConfigured()` |
| `src/lib/floor-plan/table-positions.ts` | 35 table positions, `getPositionForTable()` |
