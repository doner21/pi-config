---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260507-160800
status: READY_FOR_EXECUTION
context_saturation_estimate: ~65%
preliminary_experiments: 3
date: 2026-05-07
---

# PLAN: CTC+STARS Refinement Pipeline

## 1. Task Statement

Build a pipeline module (`alignment_engine/ctc_stars_refine.py`) that:

1. **Accepts** a CTC coarse-alignment candidate + vocal WAV (24kHz) + lyrics
2. **Partitions** the song into short windows (8-20s audio, <=24 real words each) using CTC word boundaries and temporal-density heuristics, with 6-word overlap between windows
3. **Runs STARS** locally on each window using run_stars_segment() + words_to_phonemes() from run_stars_stanza
4. **Quality-gates** each STARS window output using assess_local_compression(); rejects failing windows, falls back to CTC
5. **Merges** surviving STARS durations with CTC durations using center-confidence arbitration pattern
6. **Produces** timing_ctc_stars_refined.json in karaoke-player schema

**Constraint**: STARS never reorders, drops, or adds words relative to CTC. Word count must remain 367 for Starman.

## 2. Invariants (Validation Gates)

| # | Invariant | Enforcement Mechanism |
|---|-----------|----------------------|
| I1 | Word count = 367 before/after refinement | Count check after merge; abort if mismatch |
| I2 | Word order monotonic; no reordering | Verify words[i].start <= words[i+1].start post-merge |
| I3 | No word silently dropped/duplicated | Compare word identity sequence against CTC reference |
| I4 | All timestamps in [0, 257.3] | Range check on start/end after merge |
| I5 | STARS never makes a word worse | Per-word: if STARS single-frame (<=0.017s), zero (<=0.001s), or < 40% of CTC, fall back to CTC |
| I6 | CTC diagnostics pass after refinement | Run assess_local_compression() + monotonicity on final output |
| I7 | No structural modification to stanza boundaries | Stanza index/label/word membership preserved; only durations may change |

## 3. Success Criteria

| # | Criterion | How Verified |
|---|-----------|-------------|
| SC1 | Module ctc_stars_refine.py exists and importable | python -c "import ctc_stars_refine" |
| SC2 | Window builder respects MAX_WORDS=24, MAX_SECS=20, MIN_SECS=4 | Unit test with synthetic CTC fixture |
| SC3 | STARS runs only on short windows (no full-song inference) | Verify each call has end_sec - start_sec <= 20s |
| SC4 | Per-window quality gate rejects compression bursts | Test with known-bad STARS fixture |
| SC5 | Edge words (first/last ~3) fall back to CTC when STARS single-frame | Test: synthetic STARS with edge words <=0.017s |
| SC6 | Merged output passes all CTC diagnostics | Run full diagnostic suite on output |
| SC7 | Pure tests pass without model inference | Synthetic fixtures + mock STARS output |
| SC8 | La-la-la outro durations improve | Outro stanzas median duration >= 0.12s (vs 0.08s) |
| SC9 | Held-vowel words have longer durations than CTC | Per-word comparison; held-vowel >= CTC durations |

## 4. Architecture: Pipeline Stages

```
+-------------------------------------------------------------+
|                  CTC+STARS Refinement Pipeline                |
+-------------------------------------------------------------+
|                                                              |
|  STAGE 0: Validate Inputs                                    |
|  +-- Load timing_ctc_candidate.json (367 words verified)      |
|  +-- Load vocal WAV (24kHz, validated existence)              |
|  +-- Load lyrics                                              |
|  +-- Verify word count, monotonicity, coverage                |
|                                                              |
|  STAGE 1: Window Construction                                |
|  +-- Build density-aware windows from CTC word boundaries     |
|  +-- Parameters: MAX_WORDS=24, MAX_SECS=20, MIN_SECS=4        |
|  +-- Overlap: 6 words between consecutive windows             |
|  +-- Gap threshold: skip spans >5s internal silence           |
|  +-- Minimum words per window: 4 (skip trivially small)       |
|  +-- Output: List[{idx_range, start_sec, end_sec, words}]     |
|                                                              |
|  STAGE 2: Phoneme Conversion                                 |
|  +-- For each window: words_to_phonemes() from run_stars_stanza|
|  +-- Uses g2p_en.G2p + phone_lookup                           |
|  +-- Produces {words, phones, ph2words} per window            |
|                                                              |
|  STAGE 3: STARS Local Inference                              |
|  +-- For each window: run_stars_segment(wav, segment, ...)    |
|  +-- CPU-only subprocess, ~1-5 min/segment                    |
|  +-- Track progress, log failures                             |
|  +-- Collect {word_list, word_durs, ph_durs} per window       |
|                                                              |
|  STAGE 4: Per-Window Quality Gate                            |
|  +-- Run assess_local_compression() on each window output     |
|  +-- Gate criteria:                                           |
|  |   +-- No localized compression burst (PASS from assess)    |
|  |   +-- No word with duration <= 0.001s (zero-duration)       |
|  |   +-- Word count matches input window word count           |
|  |   +-- All real-word durations > 0                          |
|  +-- Window FAIL -> fall back to CTC for all words in window   |
|  +-- Window PASS -> proceed to merge                           |
|                                                              |
|  STAGE 5: Edge-Word Fallback                                 |
|  +-- For each passed window, identify edge words:             |
|  |   +-- First 3 real words (left edge)                       |
|  |   +-- Last 3 real words (right edge)                       |
|  +-- Edge word STARS <= SINGLE_FRAME or < 40% CTC -> fall back|
|  +-- Non-edge words: keep STARS if duration > 0 and not SF    |
|                                                              |
|  STAGE 6: Center-Confidence Merge (Overlap Resolution)       |
|  +-- For overlapping windows: each word appears in >=2 windows |
|  +-- confidence = 1.0 - |word_pos - window_center| / half_dur|
|  |   x padding_penalty (quadratic near edges)                |
|  |   x 0.3 if STARS duration <= SINGLE_FRAME                  |
|  +-- Choose candidate with highest confidence                 |
|  +-- If all STARS candidates are single-frame -> use CTC       |
|                                                              |
|  STAGE 7: Assembly & Validation                              |
|  +-- Build final word list preserving CTC stanza structure    |
|  +-- Replace durations with merged STARS/CTC values           |
|  +-- Verify invariants I1-I7                                  |
|  +-- Run full CTC diagnostic suite                            |
|  +-- Write timing_ctc_stars_refined.json                      |
|                                                              |
|  STAGE 8: Quality Report                                     |
|  +-- Window-level stats: PASS/FAIL, word count, coverage      |
|  +-- Per-word change summary: CTC->STARS delta                 |
|  +-- Held-vowel improvement report                            |
|  +-- La-la-la outro improvement report                        |
|  +-- Overall: CTC median vs Refined median duration           |
+-------------------------------------------------------------+
```

## 5. Window Construction Algorithm (Density-Aware)

```
build_ctc_windows(ctc_words, max_words=24, max_secs=20, overlap=6):
    windows = []
    i = 0
    while i < len(ctc_words):
        win_start = i
        win_end = i
        for j in range(i, min(i + max_words, len(ctc_words))):
            if j > i and ctc_words[j].start - ctc_words[j-1].end > 5.0:
                break  # gap >5s: start new window
            span = ctc_words[j].end - ctc_words[i].start
            if span > max_secs:
                break
            win_end = j + 1

        n_words = win_end - win_start
        span = ctc_words[win_end-1].end - ctc_words[win_start].start

        if n_words >= 4 and span >= 4.0:
            windows.append({
                word_range: (win_start, win_end - 1),
                start_sec: ctc_words[win_start].start - padding,
                end_sec: ctc_words[win_end-1].end + padding,
                words: [w.word for w in ctc_words[win_start:win_end]],
                ctc_indices: list(range(win_start, win_end)),
            })

        next_start = max(win_end - overlap, i + 1)
        if next_start >= len(ctc_words) or next_start <= i:
            break
        i = next_start
    return windows
```

**Padding**: 3.5s on each side for STARS conv layer warmup (same as run_stars_stanza.PADDING_SECONDS).

## 6. Per-Word Quality Gate Rules

For each STARS word in a PASS-ed window:

| Condition | Action | Rationale |
|-----------|--------|-----------|
| STARS duration <= 0.017s (SINGLE_FRAME) | Use CTC | STARS collapsed to one mel frame -- garbage |
| STARS duration <= 0.001s | Use CTC | Zero/negative duration -- invalid |
| STARS duration < CTC x 0.4 | Use CTC | STARS severely compressed relative to CTC |
| Word in edge zone (first/last 3) AND STARS < CTC x 0.6 | Use CTC | Edge compression is systematic; stricter threshold |
| STARS duration > 0 AND not single-frame | Use STARS | STARS passes quality; singing-aware duration preferred |
| Window FAILED quality gate | Use CTC for ALL words | Catastrophic failure documented in full run (59% compression) |

**Experiment validation**: Word 84 "a" (STARS=0.005s single-frame -> CTC=0.020s), Word 85 "starman" (STARS=0.176s vs CTC=2.280s, 7.7% ratio -> CTC). Both correctly caught by this gate.

## 7. Implementation Steps

### Step 1: Create test fixtures (`tests/test_ctc_stars_refine/`)

Build synthetic test data that exercises all quality gates without requiring STARS inference:

- `fixture_ctc_candidate.json` -- 24-word synthetic CTC timing
- `fixture_stars_good.json` -- STARS output: all words pass quality gate
- `fixture_stars_edge_fail.json` -- STARS output: edge words are single-frame (0.005-0.017s)
- `fixture_stars_burst_fail.json` -- STARS output: internal burst of 4 consecutive single-frame words
- `fixture_stars_zero_dur.json` -- STARS output: one word has 0.000s duration
- `fixture_stars_missing_words.json` -- STARS output: word count mismatch

### Step 2: Window builder unit tests

- Test: 24 words, 15s span -> 1 window
- Test: 50 words, 40s span -> 2+ windows with correct overlap
- Test: words with 10s inter-word gap -> split into separate windows
- Test: 3 words in 2s span -> window skipped (below MIN_WORDS)
- Test: edge cases (first/last word of song)

### Step 3: Quality gate unit tests

- Test: gate_window_output() with good STARS -> PASS
- Test: gate_window_output() with burst compression -> FAIL
- Test: gate_window_output() with single-frame edge words -> identifies correctly
- Test: apply_per_word_quality() with mixed good/bad -> correct CTC fallback

### Step 4: Merge unit tests

- Test: two overlapping windows, center-confidence chooses correct candidate
- Test: both STARS candidates single-frame -> CTC prevails
- Test: single window (no overlap) -> trivial pass-through
- Test: word count preservation through merge

### Step 5: Implement ctc_stars_refine.py module

Core functions (no duplication -- import from run_stars_stanza where possible):

```
ctc_stars_refine.py:
    from run_stars_stanza import (
        run_stars_segment,
        words_to_phonemes,
        load_phone_set,
        assess_local_compression,
        SINGLE_FRAME_DURATION,
        ...
    )

    def build_ctc_windows(ctc_words, ...) -> list[Window]
    def prepare_stars_input(window, g2p, phone_lookup) -> dict
    def gate_window_output(stars_result, ctc_words, window) -> GateResult
    def apply_edge_fallback(stars_durs, ctc_durs, window) -> list[float]
    def merge_windows(windows, stars_results, ctc_words) -> list[WordTiming]
    def assemble_output(merged_words, ctc_stanzas) -> dict
    def validate_invariants(output, ctc_candidate) -> ValidationReport
    def refine_ctc_with_stars(ctc_json_path, wav_24k_path, lyrics_path,
                               output_path, ...) -> RefinementReport
```

### Step 6: Integration test with real STARS (single window)

Run a single-window refinement on Chorus 1 first half (words 62-85) using real STARS inference. Verify:
- STARS output passes quality gate
- Edge-word fallback correctly handles idx 84-85
- Held-vowel words show improvement

### Step 7: Full-song refinement (optional acceptance test)

Run full 367-word refinement. Expected ~30 windows, ~30-150 min CPU time.
Produce timing_ctc_stars_refined.json.

### Step 8: Quality report

Generate report comparing CTC vs Refined:
- Overall median duration change
- Held-vowel word improvement breakdown
- La-la-la outro improvement
- Windows that failed quality gate
- Per-stanza timing changes

## 8. Dependency Map

```
ctc_stars_refine.py
+-- IMPORTS FROM run_stars_stanza.py:
|   +-- run_stars_segment() -- STARS subprocess invocation
|   +-- words_to_phonemes() -- g2p_en conversion
|   +-- load_phone_set() -- ARPABET->int mapping
|   +-- assess_local_compression() -- quality gate
|   +-- SINGLE_FRAME_DURATION (constant, 0.017s)
|   +-- PADDING_SECONDS (3.5s)
|   +-- MAX_WORDS_PER_SEGMENT (24)
|   +-- WORK_DIR (output directory)
|
+-- DEPENDS ON:
|   +-- g2p_en (already in venv_align)
|   +-- librosa, soundfile, numpy
|   +-- STARS checkpoint + config (existing)
|   +-- 24kHz vocal WAV (stars_stanza_work/starman_vocal_24k.wav)
|
+-- PRODUCES:
|   +-- karaoke_player/timing_ctc_stars_refined.json
|
+-- DOES NOT MODIFY:
    +-- timing_ctc_candidate.json (read-only)
    +-- timing.json (untouched)
```

## 9. Key Design Decisions

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| Windows <=24 words (not 46) | Full run: 17-59% compression at 46; stanza run: 0-32% at 19-27 | Even-split 46 words/seg (full run) |
| Density-aware, not fixed-size windows | CTC boundaries have sparse regions (musical gaps); fixed-size spans silence | Fixed 15s windows |
| 6-word overlap (not 10) | 24-word windows: 25% overlap sufficient for edge fallback | 10-word overlap (stanza run) |
| Edge fallback: first/last 3 words | Experiment confirmed: idx 84-85 edge-compressed, positions 4-20 clean | No edge fallback |
| Center-confidence merge | Padding-zone quadratic penalty + single-frame penalty correctly ranks candidates | Simple max-duration merge |
| Quality gate BEFORE confidence | Word 82 "minds" single-frame in Seg5 despite center position | Center-confidence alone |
| Import from run_stars_stanza | Avoids duplication, uses battle-tested code | Rewrite STARS invocation |
| Single pass (no two-pass) | CTC provides good boundaries; refinement only | Two-pass |
| La-la-la grouped by 4 | LALALA_GROUP_SIZE=4; rapid tokens benefit from small groups | Full-stanza windows (70 words) |
| Skip windows <4 words or <4s | MIN_SEGMENT_DURATION=2.0s for conv layers | Forcing STARS on tiny windows |

## 10. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| STARS inference time (30 x 3min = 90min) | High | Medium | Progress bar + resume; windows are independent |
| STARS OOM on dense 24-word window | Low | High | --max_tokens 50000; window sizing conservative |
| g2p_en fails on unusual word | Low | Low | Fall back to CTC for that window; log warning |
| STARS checkpoint licensing | Medium | Medium | Document; pipeline is processing tool, not redistributing checkpoint |
| Merged output has timestamp gaps | Low | Medium | Gap detection in validation; fall back to CTC for gapped regions |
| Word identity mismatch CTC vs STARS | Low | High | Word-level identity check before accepting STARS; abort window |

## 11. Handoff to Executor

### Files to modify:
- **CREATE**: `alignment_engine/ctc_stars_refine.py` (~400-600 lines)
- **CREATE**: `tests/test_ctc_stars_refine/` (test fixtures + test module, ~200 lines)
- **DO NOT MODIFY**: run_stars_stanza.py, ctc_forced_align.py, timing_ctc_candidate.json, timing.json

### Execution order:
1. Create test fixtures first
2. Write and pass window builder tests
3. Write and pass quality gate tests
4. Write and pass merge tests
5. Implement ctc_stars_refine.py
6. Run integration test (single window, real STARS)
7. Optionally run full-song refinement
8. Generate quality report

### Executor context note:
If context saturation >45% (current: ~65%), produce Execution Report and request continuation. Steps 1-5 can complete in one session. Steps 6-7 need continuation.

### Verifier should check:
- Invariants I1-I7 pass on test fixtures
- Quality gates correctly reject known-bad fixtures
- Edge-word fallback catches demonstrated failures (idx 84-85 pattern)
- Merge preserves word order and count
- No modification to CTC candidate or timing.json

## Appendix A: Experiment Results Summary

### Experiment 1: Chorus 1 CTC vs STARS Word-by-Word (words 62-85)

- **CTC total**: 9.680s | **STARS total**: 22.021s | **Merged total**: 24.329s
- **STARS better**: 19/24 words (79%) | **CTC better**: 4/24 (17%) | **TIE**: 1 (4%)
- **STARS single-frame words**: 1 (idx 84 "a" = 0.005s)
- **Key improvements**: starman +94%, waitin +629%, meet +169%, us +1888%
- **Edge failures correctly caught**: idx 84 (SF), idx 85 (compressed to 7.7% of CTC)

### Experiment 2: Overlap Analysis (Seg 4 vs Seg 5, words 76-85)

- Seg5 left-edge words (77-81): all compressed or single-frame -> center-confidence prefers Seg4
- Seg4 right-edge words (84-85): "a" single-frame, "starman" compressed -> Seg5 correctly preferred
- Verified: single-frame penalty + center-confidence produce correct arbitration

### Experiment 3: Density-Aware Window Estimation (full song)

- 30 windows covering 367 words (1.4x overlap factor)
- 23 windows with 13-24 words, good for STARS
- 7 sparse windows with 4-6 words (musical gaps in outro) -> need MIN_WORDS=4 threshold
- Word 366 "la-la" uncovered (final word at song boundary) -> handle as edge case
