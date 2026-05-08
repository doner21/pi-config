---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260507-202643
context_saturation_estimate: ~85%
---

# PLAN: Stanza-Boundary Windowing for CTC+STARS Duration-Only Enhancement

## Task Statement

Replace the mechanical build_ctc_windows() in alignment_engine/ctc_stars_refine.py
with a stanza-boundary-aware window builder that uses the CTC candidate own stanza
structure as musical phrase boundaries. Remove the la-la-la outro (stanza 9, words
297-366) before STARS inference. Anchor every word to its exact CTC start time
and use STARS only for duration enhancement, never for absolute positioning.
Output karaoke_player/timing_ctc_stars_refined_v2.json. Never overwrite timing.json
or timing_ctc_candidate.json. All 32 existing tests must pass or be updated.

Root cause being fixed: build_ctc_windows() built mechanical sliding windows
that crossed instrumental gaps (4.12s between Verse 1 and Chorus 1). STARS
Viterbi decoder compressed all sung content when it encountered gap silence,
causing Chorus 1 key held-note words (starman, waitin, sky, blow, minds) to get
zero STARS benefit. Stanza boundaries ARE the instrumental gaps; using them
as window boundaries naturally avoids gap-induced compression.


## Invariants

### Core invariants (from INTAKE)

1. Start-anchor (S-ANCHOR): every word start time equals its CTC start time exactly (mean shift = 0.000s)
2. Duration-extension (D-EXTEND): refined duration >= CTC duration for every word; STARS may only lengthen, never shorten
3. Word-count (W-COUNT): output has 297 words (367 CTC minus 70 la-la-la)
4. Monotonicity (M-TIME): word start times are strictly non-decreasing
5. Identity (W-ID): word text matches source lyrics (post-la-la-la removal)
6. Stanza structure (S-STRUCT): 9 stanzas preserved, same labels/indices as CTC candidate stanzas 0-8
7. No-overlap (NO-OVL): word end <= next word start + 0.005s epsilon
8. No-overwrite (NO-OW): never write to timing.json or timing_ctc_candidate.json
9. Test-pass (T-PASS): 32 existing tests pass (or updated with documented justification)

### Window invariants (structural)

10. No-gap-in-window (W-GAP): no STARS window contains an instrumental gap >= 2.0s
11. Stanza-locked (W-STANZA): every window word range is entirely within one stanza boundaries
12. Max-words (W-WORDS): no window has more than 24 core words (MAX_WORDS_PER_SEGMENT)
13. Max-span (W-SPAN): no window core span (without padding) exceeds 20.0s
14. Overlap (W-OVL): adjacent windows within the same stanza overlap by exactly 6 words for center-confidence merge


## Success Criteria

### SC1: Output file produced
- File: karaoke_player/timing_ctc_stars_refined_v2.json
- Valid JSON, karaoke-player-compatible schema, 9 stanzas, 297 words

### SC2: La-la-la fully removed
- 0 words in output containing la at outro indices (297-366)
- Stanza 9 not present in output
- The la in Lotta soul (Verse 1) and rock n roll (Verse 2) remains

### SC3: Start-anchor invariant holds
- abs(word[i].start - ctc_words[i].start) <= 0.001s for all i

### SC4: Duration improvement metrics
- Median duration >= 0.30s (CTC: 0.18s)
- At least 20 words with duration increase >= 0.3s over CTC
- 0 words with duration decrease >= 0.01s from CTC
- Chorus 1 starman (global idx 64) duration >= 2.5s (CTC: 2.42s)

### SC5: Chorus 1 hold-note words all improved
- starman (idx 64), waitin (idx 66), sky (idx 68), blow (idx 77), minds (idx 82)
- All must use STARS durations (source starts with stars_), not CTC fallback
- None of these in use_ctc_for from quality gate

### SC6: Window quality
- 0 windows fail due to internal burst compression (gap-induced)
- At most 1 window fails for any reason (vs 3/24 in previous run)
- All windows core spans are within a single stanza

### SC7: All invariants pass
- validate_invariants() returns all_pass = true

### SC8: 32+ tests pass
- pytest tests/test_ctc_stars_refine.py exits 0


## Implementation Steps

### Step 1: Add la-la-la filtering utilities

File: alignment_engine/ctc_stars_refine.py

Add remove_lalala_from_ctc() and remove_lalala_from_lyrics() functions:

- remove_lalala_from_ctc(): deep-copy input, pop stanzas with index=9,
  update metadata.total_words to 297, add preprocessing note
- remove_lalala_from_lyrics(): filter lines 54-65 (12 la-la-la lines)
  by matching lines where all comma-stripped tokens start with la or La
- Use copy.deepcopy() to avoid mutating the original CTC candidate
- Only stanza index 9 is removed; stanzas 0-8 remain with indices intact
- The la in Lotta soul (stanza 1) and rock n roll (stanza 4) is NOT removed

### Step 2: Build build_stanza_ctc_windows()

File: alignment_engine/ctc_stars_refine.py

New function replacing build_ctc_windows() in the main pipeline path:

Algorithm:
1. Flatten CTC words from stanzas 0-8 (la-la-la already removed)
2. For each stanza:
   - If word count <= max_words (24): single window
   - If word count > max_words: split into ceil(N/24) sub-windows with 6-word overlap
3. Choruses split at musical repeat point (after minds)
4. Verses split evenly into 3 sub-windows each
5. Bridges and Intro: single window (all <= 18 words)
6. Apply 3.5s padding on each side of the core span
7. No window crosses a stanza boundary

Returns list of window dicts with same keys as build_ctc_windows():
ctc_indices, word_count, audio_start_sec, audio_end_sec,
ctc_start_sec, ctc_end_sec, words

Stanza split map (post-la-la-la removal, 297 words, 9 stanzas):

| Stanza | Label | Words | Span | Windows | Strategy |
|--------|-------|-------|------|---------|----------|
| 0 | Intro | 5 | 6.3s | 1 | trivial |
| 1 | Verse 1 | 57 | 30.8s | 3 | even 19/19/19 |
| 2 | Chorus 1 | 41 | 19.4s | 2 | split after minds (local 20) |
| 3 | Bridge 1 | 18 | 7.9s | 1 | trivial |
| 4 | Verse 2 | 60 | 30.2s | 3 | even 20/20/20 |
| 5 | Chorus 2 | 41 | 19.2s | 2 | split after minds (local 20) |
| 6 | Bridge 2 | 18 | 7.8s | 1 | trivial |
| 7 | Chorus 3 | 39 | 18.5s | 2 | split after minds (local 18) |
| 8 | Bridge 3 | 18 | 7.1s | 1 | trivial |

Total: 16 windows (vs 24 in previous run). Estimated CPU time: ~96s vs 153s.

Chorus split points (case-insensitive search for minds):
- Chorus 1 (stanza 2, 41 words): minds at local idx 20, split at 21
  Window A: local [0:27] (21 + 6 overlap). Window B: local [15:41] (6 + 20)
- Chorus 2 (stanza 5, 41 words): minds at local idx 20, split at 21 (same pattern)
- Chorus 3 (stanza 7, 39 words): minds at local idx 18, split at 19
  Window A: local [0:25] (19 + 6). Window B: local [13:39] (6 + 20)

Verse split (even 3-way with 6-word overlap):
- 57 words: window A [0:25], B [19:44], C [38:57]
- 60 words: window A [0:26], B [20:46], C [40:60]

Experiment privilege: Executor should run a diagnostic script before
implementing Step 2 to verify window boundaries:
1. No window crosses a stanza boundary
2. All 297 words are covered by at least one window
3. No window has more than 24 words or core span > 20.0s
4. Overlap words between adjacent windows within same stanza are correct


### Step 3: Wire into refine_ctc_with_stars()

File: alignment_engine/ctc_stars_refine.py

Modifications to refine_ctc_with_stars():

1. After loading CTC candidate: apply remove_lalala_from_ctc() to strip stanza 9
2. Replace build_ctc_windows() call with build_stanza_ctc_windows()
3. Update DEFAULT_OUTPUT constant to timing_ctc_stars_refined_v2.json
4. Update assemble_output() metadata:
   - source: ctc_stars_refined_v2
   - pipeline: CTC coarse + STARS stanza-boundary local refinement
   - preprocessing: removed stanza 9 (la-la-la outro, 70 words, indices 297-366)
5. validate_invariants() already uses len(ctc_flat) for I1, automatically expects 297

Do NOT modify these proven-correct functions:
- extract_stars_real_words()
- gate_window_output()
- merge_windows() -- overlap dedup handles stanza-split overlaps correctly
- _should_use_ctc()
- assemble_output() stanza-walking logic
- validate_invariants() logic
- Imports from run_stars_stanza

### Step 4: Lyrics handling for STARS

Words fed to STARS phonemization come from window[words], built from CTC words.
This was already working in the previous pipeline. No change needed.
The source lyrics file is used only for reference; all word identity comes
from the validated CTC candidate.

### Step 5: Update tests

File: tests/test_ctc_stars_refine.py

5a. Keep existing TestBuildCtcWindows (9 tests):
    Old build_ctc_windows() remains in codebase as utility. Tests unchanged.

5b. Add new TestBuildStanzaCtcWindows class (8-10 tests):
    1. test_intro_single_window -- 5-word Intro yields exactly 1 window
    2. test_bridge_single_window -- 18-word Bridge yields exactly 1 window
    3. test_verse_57_words_3_windows -- correct 3-way split
    4. test_verse_60_words_3_windows -- correct 3-way split
    5. test_chorus_41_words_2_windows -- split after minds
    6. test_chorus_39_words_2_windows -- split after minds (local 18)
    7. test_no_cross_stanza_windows -- windows within stanza boundaries
    8. test_all_words_covered -- all words in at least one window
    9. test_overlap_between_windows -- 6-word overlap correctly applied
    10. test_lalala_not_in_windows -- indices 297-366 absent

5c. New fixture: fixture_ctc_multistanza.json (3 stanzas with structure fields:
    index, label, words[] with lyric_global_index)

5d. Update test_full_pipeline_no_real_stars:
    Mock build_stanza_ctc_windows instead of build_ctc_windows

5e. Add la-la-la removal tests:
    - test_lalala_removed_from_ctc
    - test_lalala_removed_from_output

Expected total: ~44 tests, all must pass.


### Step 6: Run the pipeline

Pre-requisite: stars_stanza_work/starman_vocal_24k.wav must exist.
If missing, regenerate with librosa resampling from starman_vocal_16k.wav.

Run command (from C:/Users/doner/moss_audio):

  venv_align/Scripts/python -c from alignment_engine.ctc_stars_refine import refine_ctc_with_stars; report = refine_ctc_with_stars(ctc_json_path=..., wav_24k_path=..., lyrics_path=..., output_path=...)

The pipeline should produce:
- 16 windows total (vs 24 in previous run)
- Most windows passing quality gate (expect 15-16 pass, 0-1 fail)
- Chorus 1 words all using STARS durations (source starts with stars_)
- Median duration >= 0.30s
- Output written to karaoke_player/timing_ctc_stars_refined_v2.json

### Step 7: Validate output

The Executor must verify:

1. validate_invariants() on actual output returns all_pass = True
2. Chorus 1 key words (indices 64, 66, 68, 77, 82):
   ALL must have source starting with stars_ (not ctc).
   This is THE critical proof the stanza-boundary fix works.
3. Start-anchor: max(abs(w.start - ctc_start)) across all 297 words <= 0.001s
4. Duration-extension: 0 words with w.duration < ctc_duration - 0.01
5. La-la-la: exactly 297 words, 9 stanzas, no Outro stanza label
6. pytest tests/test_ctc_stars_refine.py -v exits 0
7. timing.json and timing_ctc_candidate.json modification times unchanged

## Handoff Notes

### For the Executor

1. Read ctc_stars_refine.py (1036 lines) and run_stars_stanza.py stanza sections
   before starting. Understand the merge/gate/invariant logic that MUST be preserved.
2. Implement in order: Step 1 -> Step 2 -> Step 3 -> Step 5 -> Step 6 -> Step 7.
3. Experiment before Step 2: run a diagnostic script computing the 16 windows
   and verify boundaries, coverage, and overlap.
4. Do NOT modify: extract_stars_real_words, gate_window_output, merge_windows,
   _should_use_ctc, assemble_output, validate_invariants.
5. Duration capping is expected: some words capped by next word CTC start.
   Capped words get _dur_capped in source field (already handled in merge_windows).
6. Output path: timing_ctc_stars_refined_v2.json. Never write to timing.json.
7. If STARS inference fails on a window, existing error handling falls back to CTC.

### For the Verifier

Key verification: Chorus 1 words must use STARS durations.
This is THE proof the stanza-boundary fix works. In the previous run,
Chorus 1 words got zero STARS benefit because mechanical windows crossed
the 4.12s instrumental gap. With stanza-boundary windowing, Chorus 1 is a
clean 41-word, 19.4s segment with no internal gaps.

Check indices 64, 66, 68, 77, 82 specifically. If any show ctc as source,
the fix DID NOT WORK.

File integrity checks:
- timing_ctc_stars_refined_v2.json exists and is valid JSON
- timing.json modification time unchanged from before run
- timing_ctc_candidate.json modification time unchanged

### Known Risks

1. Verse 2 has 60 words. Even 3x20 split fits 24-word max. No issue.
2. Bridge 3 padding extends to ~191.66s, still before la-la-la at 197.68s. Safe.
3. Chorus 3 starts with Starman (capitalized). Minds search must be case-insensitive.
4. g2p_en handles contractions natively (layin, waitin, didnt). No new edge cases.
5. STARS non-determinism: criteria use minimum thresholds, not exact prior values.
6. Old build_ctc_windows() remains in codebase, tests keep passing.

### CONTINUATION

Context saturation at ~85%. The core strategy (stanza-boundary windowing)
is clear from RESEARCH. The existing codebase provides both a reference
implementation (run_stars_stanza.py) and a well-tested merge/gate/invariant
layer (ctc_stars_refine.py). Only the window builder needs replacement.
The Executor has exact split points, test specifications, and validation
criteria. Proceed to EXECUTION.
