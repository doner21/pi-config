---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260505-230000
clarification_needed: false
recommended_next_step: PLAN
user_clarifications_received:
  Q1_model_setup: "Include model download and full environment setup in the plan"
  Q2_force_transcription: "Sung-vocal lyric transcription + word-level forced alignment. Provide known lyrics; force the timing model to align text to vocal performance. Strategy B confirmed."
  Q3_player_tech: "Single self-contained HTML file is acceptable"
  Q4_stanza_structure: "Not explicitly answered — planner to decide; likely preserve stanza structure"

new_constraint_from_user:
  - "Syllable-level word timing highlighting on the karaoke player output. Words must show syllable-level progress during highlight rendering."
context_saturation_estimate: "~8%"
---

## Task Summary
Build a prototype karaoke verification system using MOSS Audio's timestamp ASR (referred to by the user as "force transcription"). The system takes a vocal stem MP3 and known lyrics, runs MOSS Audio to obtain word-by-word timings, then presents the result in an interactive web-based karaoke player where the user can play/pause, adjust band/vocal volume, seek, and see word-level highlight synced to audio.

## Task Type
Prototype build: Python transcription pipeline (MOSS Audio timestamp ASR) + Web-based karaoke verification player.

## User Intent
The user wants to test MOSS Audio's ability to provide post-transcription word-level timestamps that can power a karaoke rendering. They have a David Bowie "Starman" test set: `(Vocal).mp3`, `(Band).mp3`, and a plain-text lyric file. The deliverable is a small karaoke player that lets them **verify** the correctness of the timings produced by MOSS Audio — the player is a verification tool, not a production karaoke app.

## Goal Attractor
A working local prototype where:
1. MOSS Audio transcribes the vocal stem and produces word-level timestamps
2. Those timestamps are parsed into a structured format (JSON)
3. An HTML/JS karaoke player loads the timing JSON and both audio stems
4. The user presses play and sees words highlighted in sync with vocal audio
5. Volume sliders independently control band and vocal stems
6. A seek bar allows scrubbing through the song
7. The user can visually and audibly confirm whether timings are correct

## Constraints
- Run in `C:/Users/doner/moss_audio` working directory
- Use MOSS Audio from `https://github.com/OpenMOSS/MOSS-Audio` (Apache 2.0 license)
- The vocal and band MP3 files are already present in `C:/Users/doner/moss_audio/moss_audio test/`
- The lyrics are in plain text file `starman` (no extension)
- Must work locally — no cloud services
- MOSS Audio requires Python 3.12, PyTorch with CUDA or MPS, and ~4-8GB model download
- User's machine runs Windows (doner user, likely has NVIDIA GPU)
- Do NOT delete or modify the source audio files
- The karaoke player should be self-contained (single HTML file preferred) with no build step

## Invariants
- Source audio files (Vocal.mp3, Band.mp3) must not be modified or deleted
- The lyrics file must not be modified
- MOSS Audio model must be accessed via its documented API (`MossAudioModel`, `MossAudioProcessor`)
- `enable_time_marker=True` must be used in the processor to get timestamp information
- Timings must come from the model output, not be fabricated
- The web player must use actual audio element synchronization, not simulated playback

## Success Criteria
1. MOSS Audio inference successfully produces a timestamped transcription of the vocal stem
2. A JSON timing file is generated mapping each word/phrase to its start and end time in seconds
3. An HTML karaoke player loads and displays lyrics with word-by-word timing
4. Pressing play starts both audio stems in sync; word highlight follows the timings
5. Independent volume sliders for band and vocal stems work correctly
6. Seek bar accurately jumps to any position in the song
7. User can play through the song and visually verify timing accuracy

## Ambiguities (Resolved)
All ambiguities have been resolved through user clarification:

1. **"Force transcription properties"**: CONFIRMED as Strategy B — provide known lyrics, force the timing model to align text to vocal performance. Sung-vocal lyric transcription + word-level forced alignment.

2. **"Morse Audio"**: Confirmed typo for MOSS Audio.

3. **MOSS Audio timestamp output format**: RESOLVED by research — bracket format `[xx.xx]text[yy.yy]` with centisecond precision.

4. **Model download/availability**: CONFIRMED — include full model setup and download in plan.

5. **Timing file format**: RESOLVED by research — JSON stanza-preserving format with word arrays.

6. **Karaoke player technology**: CONFIRMED — single self-contained HTML file.

7. **Timing granularity**: RESOLVED — word-level from model, with syllable-level highlighting in the player (new user constraint).

8. **Directory with space in name**: Noted for PLAN — use careful quoting.

## New User Constraint
**Syllable-level highlighting**: The karaoke player must show syllable-level progress within each word during highlight rendering. This means:
- MOSS Audio provides word-level timestamps (start/end per word)
- The player must split each word into syllables and interpolate timing within word boundaries
- The visual highlight fills word by syllable, not just whole-word toggle
- This affects both the JSON schema (add syllables array per word) and the player rendering logic

## Routing Decision
**PLAN next.** Research is complete. All key unknowns are resolved. Proceed directly to PLANNER subagent.
