---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-005544
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~4%"
---

# Intake — STARS Forced Alignment Integration for Karaoke Lyric Timing

## Task Summary

Integrate the STARS singing forced alignment system (or fallback MERT+DTW pipeline)
into the existing moss_audio karaoke project to replace the current MOSS Audio forced
alignment approach. MOSS Audio produced pathologically compressed word timings (median
~0.06s) on singing voice. STARS is purpose-built for singing phoneme-audio alignment
and should produce physically plausible word durations (0.15–2.0s).

## Task Type

Integration of open-source singing forced alignment into existing karaoke pipeline.
Includes: setup, testing on Starman vocal stem, adapter script to produce existing
timing.json format, and quality gate validation. Skip formal verification phase —
the user trusts execution artifacts as proof.

## User Intent

Replace the unreliable MOSS Audio forced alignment with a system designed for singing voice.
The lyric text comes from a static `.txt` file (not from MOSS transcription). MOSS was
never used as a transcriber — it was used solely as a forced aligner and performed poorly.
We need a dedicated alignment engine that takes: (1) vocal stem WAV, (2) known lyrics text
→ produces word-level timestamps in the existing `timing.json` format consumed by
`karaoke_player/karaoke.html`.

## Goal Attractor

A working alignment pipeline in `C:/Users/doner/moss_audio` where:
- A new alignment module (STARS or MERT+DTW) produces timestamps for the Starman vocal stem
- Word durations are physically plausible (median ≥ 0.15s, < 10% of words ≤ 0.08s)
- Output is written to `karaoke_player/timing.json` in the existing format
- The karaoke player renders correct word highlighting
- A 30-second test clip can be aligned in minutes (not hours) for rapid iteration
- Quality diagnostic scripts confirm alignment quality before replacing production timing.json

## Current Known Context

- Project path: `C:/Users/doner/moss_audio`
- Existing pipeline: `convert_mp3_to_wav.py` → MOSS forced alignment → `timing.json` → `karaoke_player/karaoke.html`
- Vocal stem: `moss_audio test/starman` area, output WAV at 16kHz mono
- Lyric file: static `.txt` file with Starman lyrics (read-only)
- Player: `karaoke_player/karaoke.html` — renders word/syllable highlighting from `timing.json`
- Current timing: `karaoke_player/timing.json` — pathologically compressed (median ~0.06s)
- Quality gates in `transcribe_full_v2.py`: median word duration threshold, word duration distribution, segment coverage, opening-stanza detection
- Research produced (2026-05-06): `research_alignment/CONSERVATIVE_RESEARCH.md`, `research_alignment/SPECULATIVE_RESEARCH.md`, `research_alignment/ALIGNMENT_ROADMAP.md`
- STARS repo: https://github.com/gwx314/STARS (79 stars, Jul 2025 paper)
- MERT model: `m-a-p/MERT-v1-330M` on HuggingFace
- DTW library: `dtaidistance` (pip installable)

## Constraints

- Open-source tools only — no proprietary or paid software.
- Lyric text file is read-only (`moss_audio test/starman`).
- Source audio files are read-only.
- Existing karaoke player must remain functional and consume `timing.json` unchanged.
- STARS or MERT+DTW must be installable via pip/git clone (no system-level package managers that require admin).
- No verification phase in this NenFlow run — execution artifacts and test outputs serve as evidence.
- Testing must precede full-song alignment. Start with 30-60 second test clips.
- Current `timing.json` must be backed up before any overwrite.

## Invariants

- `moss_audio test/starman` lyric file → read-only.
- Source audio files → read-only.
- `karaoke_player/karaoke.html` → functional, consumes existing `timing.json` schema.
- `karaoke_player/timing.json` schema → must not break. New alignment must output compatible JSON.
- Quality gates from `transcribe_full_v2.py` must be ported or adapted to new alignment output.
- Existing MOSS pipeline code must not be deleted — keep it available for comparison.
- All new code goes in a dedicated alignment module (e.g., `alignment_engine/` directory).

## Success Criteria

1. STARS repo is cloned to `C:/Users/doner/moss_audio/alignment_engine/STARS/` and dependencies installed.
2. MERT+DTW fallback dependencies are installed (`pip install torch transformers dtaidistance`).
3. A 30-second test clip is extracted from the Starman vocal stem (`alignment_engine/test_clip_30s.wav`).
4. STARS produces timestamped alignment output on the test clip with known lyrics.
5. An adapter script (`alignment_engine/convert_to_timing.py`) converts alignment output to `timing.json` format.
6. Test alignment output passes quality gates: median word duration ≥ 0.15s, < 10% ≤ 0.08s, monotonic timestamps.
7. A diagnostic script (`alignment_engine/diagnose_alignment.py`) validates alignment output independently.
8. Full Starman vocal stem can be aligned (segmented or full) via a single run command.
9. A test report (`alignment_engine/TEST_REPORT.md`) documents the initial test results and comparison against MOSS output.
10. `karaoke_player/karaoke.html` renders word highlighting correctly from new alignment output.

## Ambiguities

The following will be resolved by the Planner and Executor during implementation:
1. Does STARS provide usable model weights, or is it code-only requiring training?
2. What is STARS' exact output format? Phoneme-level? Word-level? Both?
3. Can STARS align a full 4-minute song in one pass, or does it need segmentation?
4. What is STARS' memory/GPU requirement? Can it run on CPU?
5. If STARS doesn't work, does the MERT+DTW fallback produce acceptable results?
6. How do we map STARS phoneme timestamps to lyric words from the .txt file?
7. Does STARS need the lyrics in a specific format (phoneme sequence, grapheme, etc.)?

## Routing Decision

**Flow**: INTAKE → PLAN → EXECUTE (skip RESEARCH and VERIFY).

Research is already done (see `research_alignment/` directory). The Planner should read
`research_alignment/ALIGNMENT_ROADMAP.md`, `CONSERVATIVE_RESEARCH.md`, and
`SPECULATIVE_RESEARCH.md` as inputs.

Verification is skipped per user request — execution artifacts and test outputs serve as
evidence of completion.

## Planned Subagent Flow

1. **PLANNER** (`pev-planner`): Read intake + existing research/roadmap → produce concrete implementation plan with exact file paths, commands, and test steps.
2. **EXECUTOR** (`pev-executor`): Read intake + plan → clone repos, install deps, extract test clips, run alignment, build adapter, run diagnostics, produce test report.
