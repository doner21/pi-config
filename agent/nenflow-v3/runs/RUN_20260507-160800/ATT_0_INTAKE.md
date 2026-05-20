---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-160800
clarification_needed: true
recommended_next_step: RESEARCH
context_saturation_estimate: "~8%"
---

# Task Summary

Combine CTC coarse alignment with STARS local refinement. CTC provides reliable full-song word boundaries but produces speech-typical short durations for function words and doesn't model singing-specific elongation. STARS is trained on singing data and better captures vocal timing nuances, but fails catastrophically when asked to align full songs (drift, segment-boundary compression). The architecture should use CTC's word boundaries to partition the song into short windows, then run STARS locally within each window for refinement, merging only results that pass quality checks.

# Task Type

Architecture design + implementation + test-driven validation.

# User Intent

The user observed that the CTC candidate for Starman is "pretty good" but wants to test whether STARS can improve it. The core insight: CTC solves the scaffolding problem (where each word goes), STARS solves the local precision problem (how long each word really lasts in singing). The user explicitly wants an experimental, hypothesis-testing approach — the planner should be allowed to run small experiments before committing to a full plan.

# Goal Attractor

A pipeline where:

1. CTC coarse alignment provides full-song word boundaries (already done)
2. Short windows (8–20s) are carved from the audio using CTC word boundaries
3. STARS runs locally on each window with only the words assigned to that window
4. STARS local timing is merged back only when it passes per-window quality checks
5. The merged result is at least as good as CTC-only and demonstrably better on singing-specific elongation

The ultimate output is an improved `timing_ctc_candidate.json` or a new `timing_ctc_stars_refined.json` that can be loaded by the karaoke player for visual/audio review.

# Current Evidence

**CTC candidate quality** (from previous run):
- 367/367 words, 0 non-monotonic, 0 local compression bursts
- Median duration 0.18s, 19.9% short-word ratio (≤0.08s)
- All 12 zero-duration words (function words like "a", "I") repaired automatically
- 10 musical gaps flagged (5 between-stanza, 5 same-stanza) — all real instrumental pauses
- Candidate ready at `karaoke_player/timing_ctc_candidate.json`

**STARS segment API** (studied from `run_stars_stanza.py`):
- `run_stars_segment(wav_24k, segment, seg_idx, start_sec, end_sec)` — extracts audio slice, writes metadata with words/phonemes/ph2words, runs STARS subprocess, returns `{word_list, word_durs, ph_durs, ...}`
- STARS output includes `<SP>` (silence) and `<AP>` (aspiration) markers between words
- Known failure mode: segment-boundary tail compression — words near segment ends collapse to single-frame durations (0.01–0.02s)
- STARS requires `g2p_en` for phoneme conversion and expects 24kHz audio

**Relevant files:**
- `alignment_engine/ctc_forced_align.py` — CTC pipeline with lyric loading, word mapping, diagnostics, repair
- `alignment_engine/run_stars_stanza.py` — STARS stanza-level alignment with segment building, pass-1/pass-2, local compression detection
- `alignment_engine/convert_to_timing.py` — lyric parsing, karaoke schema construction
- `alignment_engine/diagnose_boundary_compression.py` — STARS-specific compression analysis

# Constraints

- CTC coarse timing must remain the primary source of truth for word ordering and stanza assignment
- STARS may only refine local durations within its window; it must not reorder, drop, or add words
- STARS refinement must never be allowed to make a word's timing worse — if STARS produces single-frame durations, zero durations, or non-monotonic output, the CTC timing must be kept for that word
- Windows should be 8–20s (handoff suggests max 20s) with overlap to avoid edge effects
- STARS output edge words (first/last ~3 words per window) should be treated as unreliable and fall back to CTC
- `karaoke_player/timing.json` must not be overwritten by default
- The planner should be allowed to run small, fast experiments (synthetic data, single-window tests, quality-check unit tests) before producing a final plan

# Invariants

- Word count must remain 367 (Starman) before and after refinement
- Word order must remain monotonic and preserve global lyric order
- No word may be silently dropped, duplicated, or reordered by the refinement process
- Timestamps must remain non-negative and bounded by vocal audio duration (~257.3s)
- CTC timing is the fallback for any word where STARS refinement fails quality checks
- All diagnostics from the CTC pipeline (coverage, monotonicity, local compression, gaps) must continue to pass after refinement

# Success Criteria

1. A new module or function exists that takes CTC word boundaries + vocal WAV + lyrics and produces STARS-refined timing
2. STARS is only run on short windows (≤20s) derived from CTC boundaries, not on the full song
3. Per-window quality gates reject STARS output that has local compression bursts, zero durations, or non-monotonic timing
4. Edge words in each STARS window fall back to CTC timing (first/last ~3 words)
5. The merged output passes the same CTC diagnostics (monotonic, no compression bursts, expected word count)
6. Tests validate: window construction from CTC boundaries, STARS output quality gating, edge-word fallback, merge monotonicity, and the invariant that STARS never makes timing worse on synthetic bad-STARS fixtures
7. Real STARS inference may be run as an acceptance test but pure tests must pass without model inference

# Ambiguities / Clarification Questions

1. **Window sizing:** CTC boundaries may cluster words tightly (e.g., rapid singing) or spread them far apart (instrumental gaps). Should windows be fixed-size (e.g., 15s) or adaptive based on CTC word density? Fixed-size is simpler; density-adaptive would avoid splitting a fast phrase across two windows.

2. **Overlap handling:** The handoff suggests 8–12s windows with overlap. Should overlapping windows run STARS independently, then merge by preferring the window where the word is closest to the center? Or should we use non-overlapping windows with edge-word fallback?

3. **STARS dependency:** `run_stars_segment` requires `g2p_en`, `librosa`, the STARS checkpoint, and a subprocess call. Should the new module duplicate this logic or import from `run_stars_stanza`? Importing is cleaner but couples the modules.

4. **Quality gate for STARS:** What local quality thresholds should reject STARS output for a window? The handoff suggests preferring CTC unless STARS passes. Should we use the same `assess_local_compression` from `run_stars_stanza` or define stricter gates?

5. **Phoneme alignment:** STARS needs phoneme input. The CTC pipeline currently doesn't produce phonemes. Should we add `g2p_en` phoneme conversion to the CTC pipeline, or have STARS produce its own phonemes from the assigned lyric words?

# Routing Decision

Proceed with RESEARCH first. The researcher should:
- Compare CTC candidate timing against STARS's known failure patterns at the same song positions
- Identify exactly which words CTC gets "wrong" in a singing sense (likely long-vowel words)
- Survey the STARS segment API call shape and dependencies
- Identify the simplest possible integration experiment

Then a PLANNER with hypothesis-testing access should design a minimal experiment (e.g., one STARS window on the "hazy cosmic jive" line) before committing to a full pipeline plan.
