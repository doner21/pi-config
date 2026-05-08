---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-124756
clarification_needed: true
recommended_next_step: RESEARCH
context_saturation_estimate: "~8%"
---

# Task Summary

Investigate the current STARS forced-alignment engine for Starman. The observed failure is that alignment is usable from the first verse through “wave of phase”, then timing collapses/breaks at/after “phase”. The suspected cause is lyric compression caused by word/lyric processing and segmentation logic.

# Task Type

Debugging + test-driven hypothesis validation + potential alignment architecture refactor.

# User Intent

Preserve STARS as the preferred/audio-promising alignment engine, but fix engineering around lyric preprocessing, segmentation, boundary handling, and timing merge so word timings remain musically plausible across the full song.

# Goal Attractor

A reliable STARS alignment pipeline that:

- does not compress lyric tails into segment ends;
- preserves raw lyric word order and one-to-one word timing coverage;
- uses musically/textually meaningful segments rather than brittle even word splits;
- emits `karaoke_player/timing.json` only when quality gates pass or writes a candidate/debug output otherwise;
- has regression tests that reproduce the “phase” break/compression failure without requiring a full STARS model run.

# Current Evidence

- `graphify-out/GRAPH_REPORT.md` identifies `alignment_engine/run_stars_stanza.py`, `alignment_engine/run_stars_full.py`, `alignment_engine/convert_to_timing.py`, and `alignment_engine/diagnose_boundary_compression.py` as alignment-engine core files.
- Existing `karaoke_player/timing.json` has plausible timing through `phase` at word index 52, then several words (`no`, `DJ,`, `that`, `was`, `hazy`, `cosmic`, `jive`) get durations in the 0.011–0.032s range around 45.80–45.94s.
- Existing `alignment_engine/stars_stanza_work/out_segment_0/output.json` shows the same segment-tail collapse after `phase`: words 63–71 are compressed into tiny durations.
- `alignment_engine/run_stars_stanza.py` builds stanza segments from pass-1 timing estimates and may reuse an existing `timing.json` as pass-1 input when word count matches, which can feed a bad alignment back into segmentation.
- `alignment_engine/run_stars_stanza.py` can clamp an overlong padded segment to `MAX_SEGMENT_DURATION`, potentially cutting the real lyric span while still passing all words to STARS.

# Constraints

- Do not assume the STARS model itself is wrong until engineering hypotheses are tested.
- Prefer fast deterministic tests over full model inference when proving segmentation/merge/preprocessing bugs.
- Do not run expensive model inference unless necessary and explicitly useful.
- Keep outputs inspectable: debug metadata, segment word ranges, segment audio windows, quality metrics.
- Avoid destroying known outputs without backups/candidate output paths.

# Invariants

- Lyric words used for STARS metadata must map exactly back to global lyric indices.
- Segment audio windows must fully contain the estimated vocal span for the words assigned to that segment, plus padding, unless explicitly marked unsafe.
- No segment builder should silently include words whose estimated time range lies outside the audio clip sent to STARS.
- Merge output must remain monotonic and preserve global lyric order unless there is explicit evidence of reordered song structure.
- Timing quality gates must catch high short-word/single-frame ratios, especially localized at segment tails.

# Success Criteria

1. Add tests that reproduce at least one credible compression mechanism near `phase` or a synthetic equivalent.
2. Identify and document root-cause hypotheses with direct code/output evidence.
3. Implement a safer segmentation/merge architecture or targeted fixes that make the failing tests pass.
4. Add diagnostics/quality gates that localize compression by segment/window, not just global median stats.
5. Keep or improve existing importability and basic test suite behavior.

# Ambiguities

- The exact expected timestamp for `phase` and following words is not supplied.
- It is unclear whether the user wants the fix applied only to Starman or generalized for arbitrary songs.
- It is unclear whether full STARS inference can be run in this environment during this session; the current plan assumes deterministic tests first.
- It is unclear whether replacing two-pass stanza segmentation with line-level, VAD/music-beat-aware, or external coarse-anchor segmentation is acceptable if tests prove necessary.

# Clarification Questions

1. Do you have a reference/expected timing for the line “Came back like a slow voice on a wave of phase / That weren’t no DJ…” or should we infer correctness from anti-compression quality gates?
2. Should the fix optimize specifically for Starman first, or should it be generalized immediately for arbitrary lyric/audio inputs?
3. Is it acceptable to replace the current two-pass stanza architecture if tests show pass-1 feedback/clipping is the root cause?
4. May the executor run a full STARS alignment if deterministic tests pass but end-to-end validation needs confirmation?

# Routing Decision

Proceed with RESEARCH first because the failure has multiple plausible causes: pass-1 feedback reuse, overlong segment clipping, raw-vs-clean lyric token mapping, per-segment tail compression, and merge arbitration. Clarifications are useful but not blocking for the first investigation/test-design phase.
