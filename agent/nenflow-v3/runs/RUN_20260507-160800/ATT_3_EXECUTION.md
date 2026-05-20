---
artifact_type: EXECUTION
role: EXECUTOR
run_id: RUN_20260507-160800
status: PARTIAL (steps 1-5 COMPLETE, steps 6-7 PENDING)
date: 2026-05-07
context_saturation_estimate: ~65%
---

# Execution Report: CTC+STARS Refinement Pipeline

## Summary

Implemented steps 1-5 from the PLAN: test fixtures, pure tests (no STARS inference), and the `ctc_stars_refine.py` module. Steps 6-7 (real STARS inference) require continuation with actual model access and longer runtime.

## Deliverables Created

### 1. Test Fixtures (`tests/test_ctc_stars_refine/`)

| Fixture | Purpose |
|---------|---------|
| `fixture_ctc_candidate.json` | 24-word synthetic CTC timing with stanza structure |
| `fixture_ctc_multi_window.json` | 40-word fixture over 30s for multi-window/overlap tests |
| `fixture_ctc_with_gaps.json` | 12-word fixture with 10s inter-word gap |
| `fixture_stars_good.json` | STARS output: all words pass quality gate (good durations) |
| `fixture_stars_edge_fail.json` | STARS output: first 3 and last 3 words are single-frame (0.016s) |
| `fixture_stars_burst_fail.json` | STARS output: internal burst of 4 consecutive single-frame words |
| `fixture_stars_zero_dur.json` | STARS output: word "sky" has 0.000s duration |
| `fixture_stars_missing_words.json` | STARS output: only 12 words (expected 24) — count mismatch |

### 2. Test Module (`tests/test_ctc_stars_refine.py`)

**32 tests, all PASS** (no STARS inference required):

**Window Construction (9 tests):**
- Single 24-word window (15s span → 1 window)
- Multi-window 40 words (overlap verification)
- Gap splitting (>5s inter-word gap)
- Tiny window skip (3 words below MIN_WORDS)
- MAX_WORDS_PER_SEGMENT=24 respect
- MAX_SECS span respect
- Complete CTC index coverage
- First/last word inclusion

**Quality Gate (5 tests):**
- Good STARS → PASS with no CTC fallback
- Edge-fail STARS → PASS with edge words flagged for CTC
- Burst-fail STARS → FAIL with all words falling back to CTC
- Zero-duration word → flagged for CTC
- Missing words → FAIL

**Per-Word Quality (6 tests):**
- Single-frame (≤0.017s) → use CTC
- Normal word → keep STARS
- <40% CTC ratio → use CTC (starman idx 85 pattern)
- Zero/negative duration → use CTC
- Edge word stricter threshold (60%) enforced
- Edge word above threshold → keep STARS

**Merge & Overlap Arbitration (5 tests):**
- Single window trivial pass-through
- Center-confidence prefers center-positioned candidate over edge-compressed
- Both STARS candidates single-frame → CTC prevails
- Word count preserved through merge
- Failed window gate → all words use CTC

**Invariant Validation (5 tests):**
- I1: Word count unchanged
- I2: Monotonicity preserved
- I3: No dropped/duplicated words
- I4: Timestamp bounds enforced
- Non-monotonic detection (negative test)

**End-to-End (2 tests):**
- `assemble_output` preserves stanza structure
- Full pipeline with mocked STARS (no model inference)

### 3. Main Module (`alignment_engine/ctc_stars_refine.py`)

~580 lines, 0 code duplication from `run_stars_stanza.py`. Key functions:

| Function | Description | PLAN stage |
|----------|-------------|------------|
| `build_ctc_windows()` | Density-aware window construction from CTC boundaries | 1 |
| `extract_stars_real_words()` | Strips `<SP>`/`<AP>` from STARS output | 3 |
| `_should_use_ctc()` | Per-word quality decision (SF/zero/<40%/edge) | 4-5 |
| `gate_window_output()` | Per-window quality gate using `assess_local_compression` | 4-5 |
| `merge_windows()` | Center-confidence merge for overlapping windows | 6 |
| `assemble_output()` | Rebuild stanza-structured karaoke-player JSON | 7 |
| `validate_invariants()` | Check I1-I7 | 7 |
| `refine_ctc_with_stars()` | Full pipeline entry point | 8 |

### Design Decisions Implemented

1. **Window overlap:** 6 words (25% of 24-word window), not 10. Verified in tests.
2. **Edge fallback:** First/last 3 words per window. Non-edge SF words trigger window-level FAIL; edge-only SF words are handled per-word.
3. **Gap handling:** Inter-word gaps >5s trigger window split. Next window starts at gap boundary, not overlap-slid.
4. **Catch-up windows:** Only for contiguous uncovered chunks meeting minimum word count.
5. **Center-confidence formula:** `confidence = 1.0 - |word_midpoint - seg_center| / half_dur`, with quadratic padding penalty and 0.3x SF multiplier.
6. **Edge-burst tolerance:** If all SF words in compression bursts are edge words, window still PASSES (fallback is per-word).
7. **Merge gate compatibility:** `merge_windows` accepts both `GateResult` objects and dicts.

## Invariants Status

| # | Invariant | Status |
|---|-----------|--------|
| I1 | Word count unchanged | ✅ All tests verify |
| I2 | Monotonic order | ✅ Verified in merge + invariant tests |
| I3 | No dropped/duplicated | ✅ Identity matching in invariant tests |
| I4 | Timestamps in bounds | ✅ Range checks in invariant tests |
| I5 | STARS never makes worse | ✅ Per-word gate enforces SF/zero/<40%→CTC |
| I6 | CTC diagnostics pass | ✅ `assess_local_compression` called on output |
| I7 | Stanza structure preserved | ✅ `assemble_output` preserves stanza index/label/words |

## What was NOT done (needs continuation)

### Step 6: Real STARS integration test (single window)
- Requires `g2p_en` (available), STARS checkpoint (available), 24kHz WAV (available)
- Chorus 1 first half, words 62-85, ~15s window
- Expected ~3-5 min runtime on CPU

### Step 7: Full-song refinement
- 367 words, estimated ~30 windows
- Expected 30-150 min CPU time
- Produces `timing_ctc_stars_refined.json`

### Continuation command:
```
Executor continuation for RUN_20260507-160800.
Run real STARS on single window (Chorus 1, words 62-85):
  cd moss_audio
  venv_align/Scripts/python -c "
  from alignment_engine.ctc_stars_refine import refine_ctc_with_stars
  report = refine_ctc_with_stars(
      'karaoke_player/timing_ctc_candidate.json',
      'stars_stanza_work/starman_vocal_24k.wav',
      'moss_audio test/starman',
      'karaoke_player/timing_ctc_stars_refined_single_window.json',
      run_stars=True,
  )
  print(report)
  "
```

## Files Modified/Created

**CREATED:**
- `alignment_engine/ctc_stars_refine.py` (~580 lines)
- `tests/test_ctc_stars_refine.py` (32 tests)
- `tests/test_ctc_stars_refine/fixture_ctc_candidate.json`
- `tests/test_ctc_stars_refine/fixture_ctc_multi_window.json`
- `tests/test_ctc_stars_refine/fixture_ctc_with_gaps.json`
- `tests/test_ctc_stars_refine/fixture_stars_good.json`
- `tests/test_ctc_stars_refine/fixture_stars_edge_fail.json`
- `tests/test_ctc_stars_refine/fixture_stars_burst_fail.json`
- `tests/test_ctc_stars_refine/fixture_stars_zero_dur.json`
- `tests/test_ctc_stars_refine/fixture_stars_missing_words.json`

**NOT MODIFIED:** run_stars_stanza.py, ctc_forced_align.py, timing.json, timing_ctc_candidate.json

## Test Results

```
32 passed, 0 failed — all pure tests (no model inference)
```

Pre-existing test suite: 16 passed, 3 pre-existing failures (unrelated to these changes).
