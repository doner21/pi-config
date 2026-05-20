---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260507-025516
context_saturation_estimate: "~12%"
---

# Plan — Fix STARS Segment-Boundary Compression

## Task Statement

Replace the even-split 46-words-per-30s-segment strategy in `run_stars_full.py` with a
two-pass stanza-aware segmentation pipeline. Pass 1 obtains approximate word timings
via an even-split run (reusing existing `timing.json` if current). Pass 2 runs STARS on
segments aligned to lyric stanzas with 2.5s padding, then merges results preferring
segment-center timings to eliminate single-frame boundary compression.

## Invariants

- `moss_audio test/starman` — read-only lyrics.
- `moss_audio test/starman_vocal_16k.wav` — read-only audio.
- `karaoke_player/karaoke.html` — unmodified, consumes existing `timing.json` schema.
- `alignment_engine/STARS/` — already patched, do not modify STARS source further.
- `karaoke_player/timing.json` schema: `{stanzas: [{words: [{start, end, duration, word}]}]}`.
- All new code goes in `alignment_engine/` directory.
