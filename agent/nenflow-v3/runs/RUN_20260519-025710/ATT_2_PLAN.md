---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260519-025710
context_saturation_estimate: "~18%"
---

# ATT_2_PLAN — Apply Migration 006 + Verify 35 Tables Render

[PLANNER CONTEXT — START]
self_estimate: ~18%
context_handoff_threshold_percent: 40
threshold_source: user_prompt
health: HEALTHY
[PLANNER CONTEXT — END]

---

## Task Statement

Apply Supabase migration 006_floor_plan_tables.sql to the remote Supabase instance (usponfmwsloozdccugmb). This seeds the booking_resources table with 35 "Table N" rows (all is_active = true, capacity 1/1) and deactivates Booth 6 + Large Table. Without this migration, the floor plan renders only 2-4 tables due to the name-parsing filter in InteractiveFloorPlan.tsx that silently drops any resource whose name does not match the "Table N" pattern.

---

## Invariants

1. Existing bookings must not be broken. The migration uses UPDATE (not DELETE) for Booth 6 and Large Table, and WHERE NOT EXISTS for inserts — idempotent.
2. Table positions must not change. No changes to src/lib/floor-plan/table-positions.ts.
3. Warm theme must be preserved. No changes to styling in InteractiveFloorPlan.tsx.
4. Build must pass. No code changes — this is a pure data layer fix.
5. Dev-store mode still works. DEMO_RESOURCES in src/lib/booking/rules.ts is unchanged (35 tables).
6. API route unchanged. No code modifications — only database rows change.

---

## Success Criteria

1. booking_resources table contains exactly 35 rows with is_active = true AND name matching pattern "Table N" (n=1..35). Booth 6 and Large Table have is_active = false.
2. The floor plan renders all 35 table buttons at their correct positions.
3. Each table shows correct status color (green=available, amber=booked, grey=held).
4. Tables are clickable; clicking opens the detail panel.
5. "Selected" counter in the header panel updates correctly.
6. Edge case: Dev store still returns all 35 DEMO_RESOURCES when Supabase is disconnected.

---

## Implementation Steps

### Step 1: Apply migration 006 to Supabase

Prerequisite check: No Supabase CLI installed and no supabase/config.toml exists.

**Primary approach — Supabase Dashboard SQL Editor (recommended):**

1. Open: https://supabase.com/dashboard/project/usponfmwsloozdccugmb/sql/new
2. Copy-paste the entire contents of the migration file (shown at end of this plan) into the SQL editor.
3. Click Run (or Ctrl+Enter).
4. Expected result: "Success" or row counts for affected rows.

**Fallback approach — Supabase CLI (if dashboard is not accessible):**

```bash
npm install -g supabase
supabase login
supabase link --project-ref usponfmwsloozdccugmb
supabase db push
```



---

### Step 2: Verify migration applied correctly

Via SQL Editor (recommended):

```sql
SELECT COUNT(*) AS active_table_count FROM booking_resources WHERE is_active = true;
-- Expected: 35

SELECT name, is_active FROM booking_resources ORDER BY sort_order;
-- Expected: Table 1..35 all is_active=true; Booth 6 + Large Table is_active=false
```



Via Node.js script (create scripts/verify-migration-006.mjs, run, then delete):

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://usponfmwsloozdccugmb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('booking_resources')
  .select('name, is_active, sort_order')
  .order('sort_order');

if (error) { console.error('Query failed:', error.message); process.exit(1); }

const active = data.filter(r => r.is_active === true);
const inactive = data.filter(r => r.is_active === false);

console.log('Total rows:', data.length);
console.log('Active rows:', active.length);
console.log('Inactive rows:', inactive.length, inactive.map(r => r.name));

if (active.length === 35 && inactive.length === 2) {
  console.log('PASS: Migration 006 applied correctly.');
} else {
  console.log('FAIL: Unexpected row counts.');
  process.exit(1);
}
```



---

### Step 3: Verify floor plan renders all 35 tables

**Method A — Browser verification (preferred):**

1. Start dev server: npm run dev (in C:\Users\doner
ramen-don)
2. Navigate to the admin floor plan page at http://localhost:3000/admin
3. Visual checklist:
   - Count the table buttons — should be exactly 35
   - All table numbers 1-35 appear
   - Hover: tooltip shows "Table N — available/booked/held"
   - Click: detail panel opens with correct table name
   - "Selected" panel updates to clicked table name
   - Status colors: green (available), amber (booked), grey (held)
4. Small-table check: Tables 28-35 render smaller (sizeClass: "small")
5. Drag test: If bookings exist, drag one between tables

**Method B — API verification:**

```bash
curl -s http://localhost:3000/api/admin/bookings/resources | node -e "const c=[];process.stdin.on('data',d=>c.push(d));process.stdin.on('end',()=>{const j=JSON.parse(Buffer.concat(c).toString());const t=(j.data||[]).filter(r=>/^Table \d+$/.test(r.name)&&(r.isActive??r.is_active)!==false);console.log('Active Table N resources:',t.length);console.log(t.length===35?'PASS':'FAIL - got '+t.length+' expected 35');})"
```



---

## Handoff Notes

### Root cause confirmed
- booking_resources has only 4 rows (Table 2, Table 4, Booth 6, Large Table) from migrations 004+005
- Migration 006 was never applied to the remote Supabase instance
- InteractiveFloorPlan.tsx name-parsing step (line ~580) silently drops Booth 6 and Large Table (NaN => no position => return null)
- Net visible: at most 2 tables (Table 2, Table 4)

### Migration is safe
- Idempotent: WHERE NOT EXISTS for inserts, UPDATE (not DELETE) for Booth 6/Large Table
- No existing booking data is touched
- Running it twice causes no harm

### No Supabase CLI installed
- where supabase returned empty; no supabase/config.toml
- @supabase/supabase-js v2.103.0 is installed; pg is not

### Key paths
| Path | Role |
|---|---|
| supabase/migrations/006_floor_plan_tables.sql | The migration to apply |
| src/components/admin/InteractiveFloorPlan.tsx | Rendering component (lines ~580-584: name-parse gate) |
| src/app/api/admin/bookings/resources/route.ts | API route (Supabase vs DEMO_RESOURCES paths) |
| src/lib/booking/rules.ts | DEMO_RESOURCES (35 entries, correct) |
| src/lib/floor-plan/table-positions.ts | TABLE_POSITIONS (35 entries, correct) |
| .env.local | Supabase credentials (URL, anon key, service role key) |

### Environment
- Supabase project ref: usponfmwsloozdccugmb
- URL: https://usponfmwsloozdccugmb.supabase.co
- Service role key: available in .env.local
- Node.js: v24.14.0

### Risks
- Low: If Supabase credentials changed, verification scripts fail — fall back to dashboard
- None: No existing bookings affected (migration only touches booking_resources)
- None: No double-inserts possible (WHERE NOT EXISTS per-row guard)

### Not in scope
- No code changes to InteractiveFloorPlan.tsx or any other component
- No changes to table positions or booking system

---

## Migration SQL (copy-paste ready)

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
