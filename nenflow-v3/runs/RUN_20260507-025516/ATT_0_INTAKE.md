---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-025516
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~5%"
---

# Intake — STARS Segment-Boundary Compression Bug Investigation

## Task Summary

STARS forced alignment on the full Starman vocal stem produces accurate highlighting for
the first ~10 seconds of playback, then timing collapses into pathological 0.016s word
durations at segment boundaries. The current pipeline splits the 257s vocal into 9×30s
segments and distributes lyrics evenly (46 words per segment) without regard to musical
phrase boundaries. This causes STARS to compress all remaining words into the final
frames of each audio segment. The fix requires stanza-aware segmentation and boundary
handling. An investigator subagent should confirm the hypothesis, build tests, and
hand findings to an executor.

## Task Type

Evidence-driven debugging of the STARS segmentation and alignment pipeline. Includes:
hypothesis confirmation via test artifacts, root cause isolation, and fix implementation.

## User Intent

The user has seen that STARS alignment has genuine potential — the first ~10 seconds of
highlighting are very accurate ("Hey now, now / Goodbye, love" at correct timings).
After that, highlighting goes "really bad." The user wants an investigator to determine
why, build tests to confirm theories, and then hand a fix to an executor. The end goal
is a full-song timing.json where all stanzas highlight correctly.

## Goal Attractor

A working `timing.json` where:
- Every stanza highlights at the correct time in the playback
- No word has a duration shorter than 0.05s (single-frame artifacts removed)
- Segment boundaries do not cause compression or garbling
- The karaoke player renders clean, musically-phrased highlighting from start to finish

## Current Known Context

### Pipeline Architecture

```
Lyrics (starman.txt)  ──┐
                         ├── run_stars_full.py ──→ karaoke_player/timing.json
Vocal (starman_vocal_16k.wav) ──┘
```

`run_stars_full.py` does:
1. Cleans lyrics (expand contractions, remove punctuation)
2. Converts to ARPABET phonemes via g2p_en
3. Resamples vocal to 24kHz (STARS requirement)
4. Splits into 9 × 30s audio segments
5. Splits 412 words evenly: ~46 words per segment
6. Runs STARS inference on each segment (~4-5s each)
7. Merges results into timing.json (stanzas format)

### The Bug — Confirmed with Data

At the end of every 30-second audio segment, STARS produces pathologically compressed
word durations (0.016s = 1 frame at 128 hop / 24000 Hz). This is visible in the current
timing.json:

**Segment 0 boundary (28.6s-30.0s, words 22-46):**
```
[22] 28.69-28.71 (0.016s) some     <<< 1 frame
[23] 28.71-28.73 (0.016s) cat      <<< 1 frame
[24] 28.73-28.74 (0.016s) was      <<< 1 frame
[25] 28.74-28.76 (0.021s) laying
...13 more words at 0.005-0.053s...
```

These words belong to the lyric line:
*"Some cat was layin' down some rock 'n' roll, 'Lotta soul,' he said"*

STARS is trying to align ~24 words into the last 1.3 seconds of a 30-second audio clip.
The segment ends at 30.0s but the lyrics for this line extend past that boundary.

### Why the First ~10 Seconds Work

The first stanza ("Hey now, now / Goodbye, love") fits entirely within the first ~7
seconds of vocals (10.7s-17.1s), well before the segment 0 boundary at 30s. STARS has
ample context and produces good durations (0.13-1.20s). The problem only manifests
when lyrics are split mid-phrase at segment boundaries.

### Key Artifact Paths

| Artifact | Path |
|----------|------|
| Vocal stem (16kHz) | `moss_audio test/starman_vocal_16k.wav` |
| Vocal stem (24kHz, generated) | `alignment_engine/stars_full_work/starman_vocal_24k.wav` |
| Lyrics | `moss_audio test/starman` |
| Current timing.json | `karaoke_player/timing.json` |
| STARS inference wrapper | `alignment_engine/run_stars_full.py` |
| STARS single-segment test | `alignment_engine/run_stars_align.py` |
| STARS repo | `alignment_engine/STARS/` |
| STARS model | `alignment_engine/STARS/checkpoints/stars_chinese_english_bilingual/` |
| Working test clip output | `alignment_engine/stars_work/` |
| Full run work dir | `alignment_engine/stars_full_work/` |

### Known Constraints from Prior Work

- STARS model has `max_frames: 6000` in config, which at 24kHz/hop=128 = ~32s max
  audio per inference item. This enforces segmentation.
- STARS inserts `<SP>` tokens for silence regions. These must be filtered from output.
- STARS expects ARPABET phonemes via g2p_en. Contractions must be expanded first.
- The karaoke player expects `{stanzas: [{words: [{start, end, duration, word}]}]}` format.
- The player disables highlighting when `quality_status != "pass"`, requiring a checkbox.
- CPU inference on the 678MB bilingual model takes ~4-5s per 30s segment.
- Audio must be 24kHz mono for STARS.

## Constraints

- All code changes go in `alignment_engine/` directory.
- Existing MOSS pipeline and karaoke player code must not be modified unless necessary.
- Source audio and lyrics files are read-only.
- STARS model files are read-only (already patched for CPU, don't touch).
- The karaoke player must continue to consume `timing.json` in its existing format.
- Tests must be built and run before any fix is applied to the full pipeline.
- The investigator must build concrete test artifacts (Python scripts, JSON outputs)
  that the executor can reference.
- Fix must work on CPU (no GPU required).

## Invariants

- `moss_audio test/starman` — read-only lyrics.
- `moss_audio test/starman_vocal_16k.wav` — read-only audio.
- `karaoke_player/karaoke.html` — functional, consumes existing `timing.json` schema.
- `alignment_engine/STARS/` — already patched, do not modify STARS source further.
- `karaoke_player/timing.json` schema: `{stanzas: [{words: [{start, end, duration, word}]}]}`.
- All new test scripts go in `alignment_engine/`.
- Existing backup of timing.json in `karaoke_player/backups/` must be preserved.

## Success Criteria

1. Investigator produces a RESEARCH artifact confirming root cause and proposing fix strategy.
2. Investigator builds at least ONE diagnostic test script that demonstrates the segment-boundary
   compression on a known snippet (e.g., a 30s clip containing a stanza boundary).
3. Investigator identifies the correct segmentation strategy (stanza-based, overlapping, etc.).
4. Executor receives a PLAN with exact steps to fix `run_stars_full.py` or build a replacement.
5. Fixed pipeline produces `timing.json` with zero single-frame (0.016s) words.
6. Median word duration ≥ 0.15s, short-word ratio (≤0.08s) ≤ 25%.
7. All major gaps between words are during instrumental sections, not mid-stanza.
8. Karaoke player renders correct highlighting from start to finish.

## Ambiguities

The following should be investigated experimentally — no user clarification needed:

1. Does STARS use the full audio segment or does it stop at the last aligned phoneme?
   (Answer determines whether we need overlap, padding, or just better lyric splitting.)
2. What is the actual `max_frames` limit in practice? Can we exceed the configured 6000?
   (Answer determines maximum segment size and whether we can use fewer, larger segments.)
3. Can we align the full vocal as one item by setting max_frames higher, or does STARS
   crash / OOM / produce garbage past ~6000 frames?
4. What happens with overlapping segments (e.g., 30s segments with 5s overlap)?
   Does STARS produce consistent results in the overlap region?
5. Does stanza-based splitting (aligning each blank-line-separated stanza to its
   approximate audio region) produce clean boundaries?
6. Should we split audio by silence detection (librosa.effects.split) rather than fixed
   30s windows, so segments naturally align to vocal phrases?

## Routing Decision

**Flow**: INTAKE → RESEARCH → PLAN → EXECUTE

No verification phase — the user tests the karaoke player directly.

## Planned Subagent Flow

1. **RESEARCHER** (`pev-researcher`): Read intake, inspect current timing.json for
   boundary compression patterns, build diagnostic test(s) that isolate the bug,
   determine the correct segmentation strategy, produce RESEARCH artifact.

2. **PLANNER** (`pev-planner`): Read intake + research, produce concrete PLAN with
   exact file paths, code changes, and test commands.

3. **EXECUTOR** (`pev-executor`): Implement the plan, fix the pipeline, produce
   corrected timing.json, validate with diagnostic script.
