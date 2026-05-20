---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260519-025710
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~3%"
context_handoff_threshold_percent: 40
context_handoff_threshold_source: user_prompt
---

# ATT_0_INTAKE — Floor Plan Missing Tables Fix

## Task Summary
Only Table 2 renders on the interactive floor plan. No other tables are visible — just the dark area blocks and "Table 2" button. The floor plan should show all 35 tables. Root cause is likely that the Supabase `booking_resources` table hasn't been seeded with the 35 tables from the migration.

## Task Type
Bug fix — data layer issue (missing resources + potentially a rendering/position lookup issue).

## User Intent
Staff must see all 35 tables on the floor plan to manage bookings visually. Currently only Table 2 appears.

## Goal Attractor
All 35 tables visible on the floor plan, each at their correct position, with correct status colors.

## Constraints
- Must work both with Supabase connected AND in dev-store mode
- Table positions from `table-positions.ts` are correct — 35 entries confirmed
- `booking_resources` must have 35 rows with names "Table 1" through "Table 35"
- The component renders tables from `activeResources` filtered by `isActive`

## Invariants
1. No existing bookings broken
2. Table positions unchanged
3. Warm theme preserved
4. Build passes

## Success Criteria
1. All 35 tables visible when Supabase has 35 resources OR dev store is used
2. Each table at correct position matching table-positions.ts
3. Status colors correct for each table
4. Tables are clickable

## Ambiguities
- Is Supabase connected or is dev store being used?
- Was the migration (006_floor_plan_tables.sql) applied to Supabase?
- If Supabase is connected and has the old 4 resources, we need to apply the migration

## Routing Decision
RESEARCH → PLAN → EXECUTE → VERIFY
