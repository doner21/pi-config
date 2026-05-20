# ATT_1 Investigation + Tests: STARS `phase` Compression

## Scope

Investigated deterministic engineering failure modes around the observed collapse after `phase` without running STARS inference or modifying production code.

Focus files/artifacts read:
- `intake.md`
- `graphify-out/GRAPH_REPORT.md`
- `alignment_engine/run_stars_stanza.py`
- `alignment_engine/run_stars_full.py`
- `alignment_engine/diagnose_boundary_compression.py`
- `alignment_engine/stars_stanza_work/**/output.json` and `meta_segment_*.json`
- `karaoke_player/timing.json`

## Evidence-backed hypotheses

1. **Pass-1 feedback reuse can recycle bad timing into segmentation.**
   - `run_stars_stanza.pass1_even_split()` reuses `karaoke_player/timing.json` when word count matches only.
   - It does not validate word identity/order, source engine, quality status, or localized compression.
   - Synthetic test shows same-count stale words are returned directly and no fresh pass-1 estimate runs.

2. **Overlong stanza segments can be clipped while keeping all words assigned.**
   - `build_stanza_segments()` clamps windows longer than `MAX_SEGMENT_DURATION` by shifting `padded_start` later and `padded_end` earlier.
   - It still sends every word in the cluster to STARS, even when pass-1 estimated word spans fall outside the clipped audio.
   - Synthetic test shows a 0.0s-56.0s assigned word span becomes a 7.25s-52.25s audio window.

3. **Raw-vs-clean token cardinality can diverge in the full-song path.**
   - `run_stars_full.clean_lyrics()` expands contractions such as `weren't -> were not`.
   - Around `That weren't no DJ`, raw lyrics have 9 tokens while cleaned full-song lyrics have 10 tokens.
   - This is incompatible with one-to-one raw lyric timing coverage if full-path outputs are reused/compared as raw lyric timings.

4. **The observed `phase` failure is present in both merged timing and raw segment output.**
   - `karaoke_player/timing.json`: after `phase`, 9 following words sum to only 0.176s; 5 are single-frame by `diagnose_boundary_compression.SINGLE_FRAME`.
   - `alignment_engine/stars_stanza_work/out_segment_0/output.json`: same post-`phase` tail also sums to 0.176s with 5 single-frame words.
   - Segment 0 metadata contains 62 words and ends exactly with `That weren't no DJ, that was hazy cosmic jive`, so this is a per-segment tail compression fixture.

## Tests added

Created `tests/test_stars_alignment_engine_regressions.py` with pytest tests that avoid model inference:

1. `test_pass1_does_not_reuse_same_count_timing_json_when_words_do_not_match`
   - Uses a temp same-count stale `timing.json`.
   - Expects pass-1 to reject mismatch and run a fresh estimate.
   - Fails current code because count-only reuse returns stale timings.

2. `test_overlong_stanza_segment_does_not_silently_clip_assigned_word_span`
   - Builds a synthetic one-stanza segment whose assigned pass-1 word span exceeds `MAX_SEGMENT_DURATION`.
   - Expects the segment window to contain all assigned word timings.
   - Fails current code because clamping cuts off assigned words.

3. `test_full_song_cleaning_preserves_raw_word_cardinality_for_alignment_mapping`
   - Checks `That weren't no DJ, that was hazy cosmic jive` raw vs cleaned token count.
   - Fails current code because `weren't` expands to `were not`.

4. `test_existing_timing_json_has_no_single_frame_burst_after_phase`
   - Loads current `karaoke_player/timing.json` artifact.
   - Expects no localized single-frame burst after `phase` and >1s cumulative duration for the next 9 words.
   - Fails current artifact: 5 single-frame words, 0.176s total.

5. `test_existing_stars_segment_zero_tail_is_not_boundary_compressed`
   - Loads current `alignment_engine/stars_stanza_work/out_segment_0/output.json` artifact.
   - Expects no raw segment-tail compression after `phase`.
   - Fails current artifact: 5 single-frame words, 0.176s total.

The test file includes import stubs for `g2p_en`, `librosa`, `soundfile`, and `numpy` so pure logic tests remain runnable even when model/heavy dependencies are absent.

## Observed test/verification results

- `python -m py_compile tests/test_stars_alignment_engine_regressions.py` succeeded.
- `python -m pytest tests/test_stars_alignment_engine_regressions.py -q` could not run in this environment because pytest is not installed:
  - `No module named pytest`
- Manual execution of the same core assertions produced the expected current-code failures:
  - pass-1 stale cache: reused same-count stale `timing.json`; `run_stars_segment` calls = 0.
  - overlong clip: generated window `7.25s-52.25s` for assigned span `0.0s-56.0s`.
  - raw/clean cardinality: raw 9 tokens vs cleaned 10 tokens.
  - merged timing post-`phase`: 5 single-frame words, 0.176s cumulative duration.
  - raw `out_segment_0` post-`phase`: 5 single-frame words, 0.176s cumulative duration.

## Production changes

None. Production code was not modified.
