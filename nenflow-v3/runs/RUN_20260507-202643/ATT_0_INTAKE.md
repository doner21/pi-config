---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-202643
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~8%"
---

# INTAKE: Final CTC+STARS Singing-Aware Timing Refinement

## Task Summary

Refine CTC forced-alignment word timings for Starman using the singing-trained STARS model as a **duration-only enhancer** — keeping CTC word start times as anchors and replacing CTC durations with STARS singing-aware durations. Delete the la-la-la outro from the source lyrics. One final attempt before shipping.

## Task Type

Hybrid alignment refinement: CTC (coarse, full-song, conversational acoustic model) + STARS (singing-trained, duration-aware, sparse/segmented).

## User Intent

The user wants karaoke timing that feels musical — held notes ("starman", "low", "tonight", "radio") should display longer than conversational speech models predict. CTC gets word start times correct but underestimates singing durations by 3-8x. STARS captures singing durations well but can't handle full-song alignment on its own. The user wants STARS to **lengthen** CTC durations where the singer holds notes, without breaking CTC's overall word positioning.

Previous attempt (RUN_20260507-160800) failed because:
- STARS whole-segment durations were applied per-word without proper anchoring, causing drift
- Duration capping (151 of 367 words) neutered most STARS improvements
- The la-la-la outro (words 300-366) was a distraction

## Goal Attractor

A `timing_ctc_stars_v2.json` file where:
1. Every word's **start time** matches CTC exactly (0.000s mean shift)
2. Words with held notes have **durations ≥ CTC** (never shorter)
3. 30+ words show ≥ 0.3s duration increase over CTC
4. La-la-la outro is gone from the source lyrics and timing
5. The refined output sounds more musical in the karaoke player than CTC-only
6. All invariants pass

## Constraints

1. **CTC start times are anchors** — must not change. We believe CTC's MMS-300M model gives correct word-level segmentation for this song.
2. **STARS is singing-aware** — it was trained on singing, produces longer durations for held notes. Use it only for durations, not absolute positioning.
3. **No la-la-la** — delete lines 54-65 from `moss_audio test/starman` before running any pipeline. The outro is not necessary karaoke content and it introduces measurement noise.
4. **Never overwrite `timing.json`** — output to a new file.
5. **32 existing tests must pass** — the test suite in `tests/test_ctc_stars_refine.py` must continue to pass (or be updated to reflect the new strategy).
6. **Pure Python + existing venv** — use `venv_align/Scripts/python`, no new dependency installs.
7. **Windows command execution** — all subprocess calls must work on Windows (no `bash -c`, no `/dev/null`, etc.)

## Invariants

1. **Word count invariant**: output has exactly the same words as input (minus la-la-la)
2. **Monotonicity invariant**: word start times are non-decreasing
3. **Identity invariant**: word text matches the source lyrics
4. **Start-anchor invariant**: each word's `start` time equals its CTC `start` time exactly
5. **Duration-extension invariant**: refined duration ≥ CTC duration for every word (STARS may only lengthen, never shorten)
6. **Stanza structure invariant**: stanza groupings preserved (same number of stanzas: 10 → 9 after removing la-la-la)
7. **No-overlap invariant**: word `end` ≤ next word's `start` + small epsilon

## Success Criteria

1. First word ("Hey") starts at ~10.72s (matches CTC)
2. Last word (before la-la-la) ends at ~192s
3. Median duration ≥ 0.30s (CTC: 0.18s)
4. ≥ 20 words with duration increase ≥ 0.3s over CTC
5. 0 words with duration decrease ≥ 0.01s from CTC
6. All 7 invariants pass in validation
7. 32 existing tests pass (or updated to reflect new strategy)
8. La-la-la words not present in output

## Ambiguities

1. **Best STARS invocation strategy** — should we run STARS per-stanza (as in `run_stars_stanza.py`), per-window (as in `ctc_stars_refine.py`), or some other segmentation?
2. **Duration extraction precision** — STARS outputs phoneme durations, which are aggregated to word durations. How reliable is this aggregation? Are edge phonemes (first/last in segment) less reliable?
3. **Padding strategy** — previous approach used 3.5s padding around CTC windows. Is this appropriate for duration-only refinement?
4. **Overlap handling** — when STARS segments overlap, how do we pick the best duration for a word?
5. **Quality gating** — what thresholds should determine whether a STARS duration is trusted vs. falling back to CTC?
6. **Why did previous attempt fail?** — was it the merge strategy (accumulating durations caused drift), the per-word quality gates being too restrictive, or something fundamental about how STARS was invoked?

## Routing Decision

Route B (RESEARCH → PLAN → EXECUTE → VERIFY).

Research is critical because the previous approach failed and we need to understand *why* before attempting again. The Researcher should:
- Study how STARS produces its word durations internally (phoneme aggregation, edge effects)
- Study the CTC forced-aligner's word boundary quality (are start times truly trustworthy?)
- Search forums/docs for hybrid CTC+STARS alignment patterns
- Analyze the previous failure mode rigorously
- Recommend specific strategies the Planner can test

## Clarification Questions

None — the user was explicit about all constraints. Proceed.
