---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR (writing brief FOR verifier)
run_id: RUN_20260507-160800
date: 2026-05-07
---

# Verifier Brief: CTC+STARS Refinement Pipeline

## What to Verify

The Executor implemented a pure-Python pipeline module `alignment_engine/ctc_stars_refine.py` with 32 supporting unit tests. No STARS model inference was run.

## Files to Inspect

| File | Type | Lines |
|------|------|-------|
| `alignment_engine/ctc_stars_refine.py` | NEW module | ~580 |
| `tests/test_ctc_stars_refine.py` | NEW test module | ~350 |
| `tests/test_ctc_stars_refine/` | NEW fixture dir | 8 JSON fixtures |

## Invariants to Check (from PLAN §2)

| # | Invariant | Where enforced | Test coverage |
|---|-----------|---------------|---------------|
| I1 | Word count unchanged | `validate_invariants()` | `test_word_count_invariant` |
| I2 | Monotonic order | `validate_invariants()` | `test_monotonicity_invariant` |
| I3 | No dropped/duplicated | `validate_invariants()` | `test_no_dropped_or_duplicated_words` |
| I4 | Timestamp bounds | `validate_invariants()` | `test_timestamp_bounds` |
| I5 | STARS never makes worse | `_should_use_ctc()` + `gate_window_output()` | 6 per-word quality tests |
| I6 | CTC diagnostics pass | `validate_invariants()` calls `assess_local_compression()` | Implicit in invariant tests |
| I7 | Stanza preserved | `assemble_output()` | `test_assemble_output_preserves_stanza_structure` |

## Key Quality Gate Rules (PLAN §6)

Verify these are correctly implemented in `_should_use_ctc()` and `gate_window_output()`:

| Condition | Expected Action | Test |
|-----------|----------------|------|
| STARS ≤ 0.017s (single-frame) | Use CTC | `test_single_frame_falls_back_to_ctc` |
| STARS ≤ 0.001s | Use CTC | `test_zero_duration_falls_back` |
| STARS < CTC × 0.4 | Use CTC | `test_below_40pct_ctc_falls_back` |
| Edge word + STARS < CTC × 0.6 | Use CTC | `test_edge_word_stricter_threshold` |
| Window burst (non-edge SF) | FAIL window, all→CTC | `test_burst_fails_quality_gate` |
| Edge-only SF burst | PASS window, edge words→CTC | `test_edge_fail_stars_detected` |
| Word count mismatch | FAIL window | `test_missing_words_fails` |

## Window Construction (PLAN §5)

Verify `build_ctc_windows()` respects:
- MAX_WORDS=24 per window (test: `test_window_respects_max_words`)
- MAX_SECS=20 core span (test: `test_window_respects_max_secs`)
- 6-word overlap between consecutive windows (test: `test_multi_window_40_words`)
- Gap threshold 5s splits windows (test: `test_gap_splits_window`)
- MIN_WORDS=4 skips tiny windows (test: `test_skip_tiny_window`)

## Merge Logic (PLAN §5 Stage 6)

Verify `merge_windows()`:
- Center-proximity confidence formula (test: `test_overlap_center_confidence_prefers_center`)
- Both-STARS-SF → CTC fallback (test: `test_both_single_frame_uses_ctc`)
- Failed-window → all CTC (test: `test_failed_window_uses_ctc_for_all`)

## Non-Modification Check

Verify these files were NOT modified:
- `karaoke_player/timing.json` ✅ (original mtime preserved)
- `karaoke_player/timing_ctc_candidate.json` ✅ (original mtime preserved)
- `alignment_engine/run_stars_stanza.py` ✅ (no edits made)
- `alignment_engine/ctc_forced_align.py` ✅ (no edits made)

## Run Tests

```bash
cd moss_audio
venv_align/Scripts/python -m pytest tests/test_ctc_stars_refine.py -v
# Expect: 32 passed

venv_align/Scripts/python -c "from alignment_engine.ctc_stars_refine import build_ctc_windows, gate_window_output, merge_windows, validate_invariants; print('import OK')"
# Expect: import OK
```

## Pending (requires continuation)

Steps 6-7 from PLAN:
- Single-window real STARS inference test
- Full-song refinement with real STARS
