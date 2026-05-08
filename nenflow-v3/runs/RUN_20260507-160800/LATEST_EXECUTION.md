---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260507-160800
status: COMPLETE
date: 2026-05-07
---

# Latest Execution: CTC+STARS Refinement — Full Song

**Pipeline**: Real STARS refinement on 367-word Starman song
**Output**: `karaoke_player/timing_ctc_stars_refined.json`
**Status**: All 7 invariants PASS, 32/32 tests PASS

## Quick Stats

| Metric | CTC | Refined | Change |
|--------|-----|---------|--------|
| Median duration | 0.180s | 0.421s | +134% |
| Mean duration | 0.284s | 0.620s | +118% |
| Outro median | 0.100s | 0.717s | +617% |
| Words using STARS | 0 | 286 (78%) | — |
| Words using CTC | 367 | 81 (22%) | — |

## Key Changes

1. **Bug fix**: Gap guard prevents orphaned final word (word 366 "la-la" with 11.14s gap)
2. **Pipeline run**: 24 windows, 21 passed, 3 failed, 153s elapsed
3. **Output**: Valid karaoke-player JSON at `karaoke_player/timing_ctc_stars_refined.json`
4. **timing.json**: NOT modified (verified by file timestamps)

See `ATT_4_EXECUTION.md` for full details.
