---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260519-025710
for_role: VERIFIER
status: READY_FOR_VERIFICATION
---

# ATT_3_VERIFIER_BRIEF — Migration 006 Applied to Supabase

## What Was Implemented

Applied migration `006_floor_plan_tables.sql` to the Supabase project `usponfmwsloozdccugmb` by programmatically executing the equivalent operations via the Supabase REST API (admin client with service role key).

## Verification Instructions

### Primary Check: Supabase Data (direct evidence)

Run this one-liner against Supabase:

```bash
cd C:\Users\doner\ramen-don && node -e "
import('@supabase/supabase-js').then(async ({createClient}) => {
  const s = createClient('https://usponfmwsloozdccugmb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcG9uZm13c2xvb3pkY2N1Z21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODI4MSwiZXhwIjoyMDkxNjU0MjgxfQ.-t3SK1G4oVDiS0oVr4SEvqT3EujN6hQClswZUiyOAJU', {auth:{persistSession:false,autoRefreshToken:false}});
  const {data, error} = await s.from('booking_resources').select('name,is_active,sort_order').order('sort_order');
  if (error) { console.error('FAIL:', error.message); process.exit(1); }
  const active = data.filter(r => r.is_active);
  const tableN = active.filter(r => /^Table \d+\$/.test(r.name));
  console.log('Total:', data.length, '| Active:', active.length, '| Table-N:', tableN.length);
  const allCorrect = tableN.length === 35 && [...Array(35)].every((_,i) => { const t = active.find(r => r.name==='Table '+(i+1)); return t && t.sort_order===i+1; });
  console.log(allCorrect ? 'PASS: All 35 tables 1-35, sorted, active' : 'FAIL');
  process.exit(allCorrect ? 0 : 1);
});
"
```

**Expected:** `PASS: All 35 tables 1-35, sorted, active`

### Secondary Check: Browser (if admin session available)

1. Go to `http://localhost:3000/admin/bookings`
2. Click the **"Floor Plan"** tab
3. **Count the table buttons** — should be 35 (Table 1 through Table 35)
4. Verify each table shows correct status color (green for available)
5. Click any table — detail panel should open with correct table name

### Success Criteria Mapped to Verifier Actions

| # | Criteria | How to Verify | Expected |
|---|----------|---------------|----------|
| 1 | 35 rows with is_active=true, "Table N" pattern | Supabase query above | count = 35 |
| 2 | Tables sorted 1-35 | Check sort_order in query | 1,2,3,...,35 |
| 3 | Tables render on floor plan | Browser: count visible buttons | 35 buttons |
| 4 | Status colors correct | Browser: check colors | green (available) |
| 5 | Tables clickable | Browser: click any table | detail panel opens |
| 6 | Dev store fallback | Check `DEMO_RESOURCES` in rules.ts | unchanged (35 entries) |

### Evidence Sources

- **Direct evidence**: Supabase `booking_resources` table query (primary)
- **Supporting evidence**: Migration file at `supabase/migrations/006_floor_plan_tables.sql`
- **No code changes**: All files in `src/` are untouched

### Known Caveats

- "Large Table" row was not found in Supabase (may have been deleted). The migration's UPDATE for `IN ('Booth 6', 'Large Table')` only affected 1 row (Booth 6). Not a problem — if Large Table didn't exist, there's nothing to deactivate.
- Playwright headless browser cannot verify rendering because admin authentication (cookies) is not available. Browser verification requires a real login session.
