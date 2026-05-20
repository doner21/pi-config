---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260519-011017
---

# ATT_3_VERIFIER_BRIEF — Interactive Floor Plan

## What Was Built

Replaced static FloorPlan.tsx with date/time-range-aware InteractiveFloorPlan.tsx on `/admin/bookings` (floor-plan tab). 35 tables displayed as styled buttons overlaid on floor plan image, color-coded by availability, with cancel/update/move/create operations. All silent (no emails), all audited.

## Files to Verify

| File | Type | What to Check |
|------|------|---------------|
| `supabase/migrations/006_floor_plan_tables.sql` | NEW | All 35 tables, idempotent INSERT, capacity 1 |
| `src/lib/floor-plan/table-positions.ts` | NEW | All 35 table positions + size classes |
| `src/components/admin/InteractiveFloorPlan.tsx` | NEW | 1514-line component with dnd-kit |
| `src/lib/booking/rules.ts` | MODIFIED | DEMO_RESOURCES (35), minPartySize (1) |
| `src/lib/booking/dev-store.ts` | MODIFIED | updateBooking + createBooking methods |
| `src/app/api/admin/bookings/route.ts` | MODIFIED | GET params, PATCH, POST |
| `src/app/api/admin/bookings/holds/route.ts` | MODIFIED | GET params |
| `src/app/admin/bookings/page.tsx` | MODIFIED | Import + tag swap |

## Independent Verification Commands

### 1. Build Integrity
```bash
cd C:/Users/doner/ramen-don && npx tsc --noEmit
# Expected: 0 errors

npx next build
# Expected: ✓ Compiled successfully
```

### 2. API Route Methods Exist
```bash
grep "export async function" src/app/api/admin/bookings/route.ts
# Expected: GET, DELETE, PATCH, POST (4 functions)
```

### 3. Migration SQL Coverage
```bash
python -c "
import re
sql = open('supabase/migrations/006_floor_plan_tables.sql','r').read()
tables = sorted(set(int(t) for t in re.findall(r'Table (\d+)', sql)))
print('Tables:', tables)
print('Count:', len(tables))
# Expected: [1,2,...,35], 35
"
```

### 4. DEMO_RESOURCES Updated
```bash
grep -c "demo-table-" src/lib/booking/rules.ts
# Expected: 35 (one per table)
```

### 5. Peak Rules minPartySize
```bash
grep "minPartySize" src/lib/booking/rules.ts
# Expected: both = 1
```

### 6. dnd-kit Installed
```bash
npm ls @dnd-kit/core
# Expected: @dnd-kit/core@6.3.1
```

### 7. Component Has DnD Integration
```bash
grep -c "useDraggable\|useDroppable\|DndContext" src/components/admin/InteractiveFloorPlan.tsx
# Expected: >0 (at least one reference to each)
```

### 8. No Public Booking Files Touched
```bash
git diff --name-only HEAD | grep -E "src/app/\(public\)/reservations|src/app/api/booking"
# Expected: (no output)
```

### 9. Migration Pre-Check (BEFORE applying migration)
Run against Supabase:
```sql
SELECT b.id, b.party_size, b.customer_name, r.name 
FROM bookings b JOIN booking_resources r ON b.resource_id = r.id 
WHERE r.name IN ('Table 2','Table 4') AND b.party_size > 1 AND b.status = 'confirmed';
```
If rows returned: ESCALATE — data inconsistency risk.

### 10. Browser Tests (requires running app + admin auth)
Navigate to http://localhost:3000/admin/bookings → Floor Plan tab:
- Verify 35 table buttons visible overlaid on floor plan image
- Verify date picker and time range selects present
- Verify legend with green/amber/grey dots
- Click a table → detail panel opens
- Verify Cancel/Update/Move/Create buttons present

## Claims to Independently Verify

1. **"Build passes with 0 errors"** — Run `npx tsc --noEmit` and `npx next build` yourself
2. **"All 4 HTTP methods present"** — grep the route file yourself
3. **"35 tables in migration"** — Parse the SQL yourself
4. **"DEMO_RESOURCES has 35 entries"** — Count them yourself
5. **"Public booking files untouched"** — git diff yourself
6. **"dnd-kit installed"** — npm ls yourself

## What the Executor DID NOT Verify

- Actual Supabase migration execution (requires live DB + admin credentials)
- Browser-based visual testing (requires logged-in admin session)
- Actual API calls (require admin auth cookie)
- End-to-end booking flow
- Booking audit event insertion (requires actual mutations)
- No booking_email_jobs insertion (requires actual admin creates)

These require a running Supabase instance with admin authentication and should be verified by the Verifier against a live environment.
