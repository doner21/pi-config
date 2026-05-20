---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260507-005544
context_saturation_estimate: "~35%"
---

# Plan — STARS Forced Alignment Integration for Karaoke Lyric Timing

## Task Statement

Integrate the STARS singing forced alignment system (primary) and MERT+DTW pipeline
(fallback) into the existing moss_audio karaoke project. Replace MOSS Audio forced
alignment — which produced pathologically compressed word timings (median ~0.06s) on
singing voice — with a system purpose-built or adapted for singing. The new module
takes a vocal stem WAV + known lyrics text and produces word-level timestamps in the
existing `karaoke_player/timing.json` format. Testing starts with 30-second clips;
full-song alignment happens only after quality gates pass on the test clip.

## Invariants

1. **Lyric file is read-only**: `C:/Users/doner/moss_audio/moss_audio test/starman`
   must never be modified by any script in this Plan.
2. **Source audio files are read-only**: `starman_vocal_16k.wav` and
   `starman_band_16k.wav` must never be modified.
3. **Existing karaoke player is functional and consumes the existing timing.json
   schema**: `C:/Users/doner/moss_audio/karaoke_player/karaoke.html` must not be
   altered. It reads `metadata.duration_s`, `metadata.quality_status`,
   `stanzas[].label`, `stanzas[].words[].word`, `.start`, `.end`, `.syllables`.
4. **Existing MOSS pipeline code must not be deleted**: `transcribe_full_v2.py`,
   `convert_mp3_to_wav.py`, `quick_transcribe.py`, `transcribe_full.py`,
   `transcribe_starman.py` remain in place for comparison/reference.
5. **Current timing.json must be backed up before any overwrite**: The file at
   `karaoke_player/timing.json` is the MOSS-generated baseline. Back it up first.
6. **All new alignment code lives in `alignment_engine/`**: A dedicated directory at
   `C:/Users/doner/moss_audio/alignment_engine/`. Do NOT put alignment code in
   `research_alignment/` (that directory is research artifacts only).
7. **Quality gates adapted from transcribe_full_v2.py**: Median word duration >= 0.15s,
   < 10% words <= 0.08s, monotonic timestamps, stanza coverage >= 85% of audio duration.
   These are stricter than the MOSS gates because singing alignment should produce
   physically plausible durations.
8. **Open-source only**: No proprietary or paid tools. STARS is presumed Apache-2.0/MIT
   (verify license before integration). MERT is Apache-2.0. dtaidistance is Apache-2.0.
9. **CPU-only operation supported**: The target environment may lack a CUDA-capable GPU.
   Both STARS and MERT should work on CPU (slower but functional). If GPU is available,
   scripts should auto-detect and use it.

## Success Criteria

1. **STARS repo cloned** to `C:/Users/doner/moss_audio/alignment_engine/STARS/` and
   Python dependencies installed (in a new `venv_align` venv).
2. **MERT+DTW fallback dependencies installed**: `torch`, `transformers`, `librosa`,
   `soundfile`, `dtaidistance` available in the alignment venv.
3. **30-second test clip extracted** from the Starman vocal stem at
   `alignment_engine/test_clip_30s.wav` (16kHz mono, 30.0s starting from 30.0s offset
   — captures verse 1 with clear singing).
4. **STARS produces timestamped alignment output** on the test clip, or a documented
   failure reason if weights are unavailable / inference crashes. The Executor logs
   exactly what happened.
5. **MERT+DTW produces timestamped alignment output** on the test clip, regardless of
   STARS outcome, as the guaranteed fallback.
6. **Adapter script** `alignment_engine/convert_to_timing.py` converts alignment output
   (from either STARS or MERT+DTW) to the exact `timing.json` schema consumed by
   `karaoke_player/karaoke.html`, including metadata, stanzas, word-level timestamps,
   and syllable entries.
7. **Test alignment output passes quality gates**:
   - Median word duration >= 0.15s (vs MOSS's 0.08s median)
   - < 10% of words <= 0.08s (vs MOSS's 72.6%)
   - All word timestamps strictly monotonic (start[i] <= start[i+1])
   - No negative or zero durations
   - Timestamp range covers >= 85% of the 30s test clip duration
8. **Diagnostic script** `alignment_engine/diagnose_alignment.py` independently
   validates any alignment JSON against the quality gates and prints a PASS/FAIL
   verdict with detailed metrics.
9. **Full Starman vocal stem can be aligned** via a single run command
   (`python alignment_engine/align_full.py`) that processes stanzas independently
   (to keep DTW bounded) and merges results.
10. **Test report** `alignment_engine/TEST_REPORT.md` documents test clip results,
    STARS status, MERT+DTW metrics, and comparison against MOSS baseline.
11. **Karaoke player renders word highlighting correctly** from new alignment output
    (verified by opening `karaoke_player/karaoke.html` in browser and confirming word
    highlighting advances with audio).

## Implementation Steps

### Phase 0 — Environment & Backup

**Step 0.1**: Back up existing timing.json and raw outputs.

```bash
cd C:/Users/doner/moss_audio
mkdir -p karaoke_player/backups/$(date +%Y%m%d_%H%M%S)_pre_alignment_engine
cp karaoke_player/timing.json karaoke_player/backups/*_pre_alignment_engine/
cp karaoke_player/raw_segment_*.txt karaoke_player/backups/*_pre_alignment_engine/ 2>/dev/null || true
cp karaoke_player/segment_diagnostics.json karaoke_player/backups/*_pre_alignment_engine/ 2>/dev/null || true
```

**Step 0.2**: Create the alignment engine directory and initialize a new Python venv
to avoid dependency conflicts with the MOSS venv.

```bash
cd C:/Users/doner/moss_audio
python -m venv venv_align
source venv_align/Scripts/activate   # Git Bash on Windows

# Upgrade pip
python -m pip install --upgrade pip setuptools wheel
```

**Step 0.3**: Create the module directory structure.

```bash
mkdir -p alignment_engine
```

Create `alignment_engine/__init__.py` (empty file).

### Phase 1 — Extract 30s Test Clip

**Step 1.1**: Extract a 30-second clip from the Starman vocal stem. The offset is
30.0s (skipping the intro "Hey now, now / Goodbye, love") to capture the first verse
("Didn't know what time it was..."), which provides clear, steady singing.

The project uses imageio-ffmpeg (already installed in venv_moss). Use Python for
extraction so we don't depend on system-level ffmpeg (which is not on PATH per the
environment check).

Create `alignment_engine/extract_test_clip.py`:

```python
#!/usr/bin/env python3
"""Extract a 30s test clip from the Starman vocal stem."""
import os, subprocess, sys
import imageio_ffmpeg
import soundfile as sf

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TEST_DIR = os.path.join(os.path.dirname(__file__), "..", "moss_audio test")
VOCAL_WAV = os.path.join(TEST_DIR, "starman_vocal_16k.wav")
OUT = os.path.join(os.path.dirname(__file__), "test_clip_30s.wav")

CLIP_START = 30.0   # skip intro, start at first verse
CLIP_DURATION = 30.0

cmd = [
    FFMPEG, "-y",
    "-i", VOCAL_WAV,
    "-ss", str(CLIP_START),
    "-t", str(CLIP_DURATION),
    "-ac", "1",
    "-ar", "16000",
    OUT,
]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    print(f"[ERROR] FFmpeg failed:\n{result.stderr[-500:]}")
    sys.exit(1)

data, sr = sf.read(OUT)
dur = len(data) / sr
print(f"Extracted {dur:.1f}s test clip ({len(data)} samples, {sr} Hz) -> {OUT}")
if dur < 29.0 or dur > 31.0:
    print(f"[WARN] Expected ~30s clip, got {dur:.1f}s")
if max(abs(data)) < 0.001:
    print("[WARN] Near-silent output — check offset")
sys.exit(0)
```

Run:

```bash
source venv_align/Scripts/activate
pip install imageio-ffmpeg soundfile
python alignment_engine/extract_test_clip.py
```

**Step 1.2**: Create a test lyrics file for the 30s clip (verse 1).
The lyrics for this clip segment correspond to approximately the second stanza in the
lyric file (after the "Hey now, now / Goodbye love" intro).

Create `alignment_engine/test_clip_lyrics.txt`:

```
Didn't know what time it was; the lights were low
I leaned back on my radio
Some cat was layin' down some rock 'n' roll, "Lotta soul," he said
Then the loud sound did seem to fade
Came back like a slow voice on a wave of phase
That weren't no DJ, that was hazy cosmic jive
```

### Phase 2 — STARS Integration (PRIMARY)

**Step 2.1**: Clone STARS into the alignment engine directory and inspect.

```bash
cd C:/Users/doner/moss_audio/alignment_engine
git clone https://github.com/gwx314/STARS.git
cd STARS
```

**Step 2.2**: Determine STARS structure and dependency format, then install.

```bash
# Check what dependency format STARS uses
ls -la
cat README.md | head -80

# Find requirements file
find . -name "requirements*.txt" -o -name "pyproject.toml" -o -name "setup.py" -o -name "setup.cfg" | head -5

# Install dependencies based on what's found:
# If requirements.txt exists:
pip install -r requirements.txt

# If setup.py / pyproject.toml:
pip install -e .

# If neither, check README for install instructions
```

**Step 2.3**: Locate the alignment-specific entry point and attempt inference on the
test clip.

The Executor should:

1. Search for alignment-related files:
   ```bash
   grep -r "alignment" --include="*.py" -l | head -10
   grep -r "align\|inference\|predict\|demo" --include="*.py" -l | head -10
   ```

2. Read the main entry point to understand expected arguments and output format:
   - Does STARS take (audio_path, lyrics_text) or (audio_path, lyrics_phonemes)?
   - Does STARS output word-level or phoneme-level timestamps?
   - What is the output format (JSON, CSV, TextGrid)?

3. Attempt inference on the test clip (adapt CLI to actual discovered interface):
   ```bash
   python inference.py \
     --audio ../test_clip_30s.wav \
     --lyrics ../test_clip_lyrics.txt \
     --output ../test_clip_stars_output.json
   ```

4. Document the results in `alignment_engine/STARS_RESULT.md`:
   - Model weights available? (yes/no — where from, how to download)
   - Inference successful? (stdout/stderr, exit code, timing)
   - Output format observed (schema snippet)
   - Word durations plausible? (spot-check first 5)

**Step 2.4**: Decision gate — evaluate STARS viability.

| Condition | Action |
|-----------|--------|
| Model weights unavailable OR inference crashes | Document failure in STARS_RESULT.md. Set STARS_VIABLE=false. Proceed to MERT+DTW (Phase 3) as primary. |
| Inference succeeds but >20% words <= 0.08s | Document as degraded. Try different parameters. If still failing, fall back. |
| Inference succeeds AND quality plausible (median > 0.12s) | Mark STARS_VIABLE=true. Proceed to adapter (Phase 4). Also build MERT+DTW for comparison. |

If STARS_VIABLE=true AND the output format is already known from inspection:

Write STARS-specific adapter in Phase 4 that handles whatever format STARS emits.
This may be:
- Phoneme-level → aggregate to word-level using lyrics mapping
- Custom JSON → parse fields into `word`, `start`, `end`
- TextGrid → parse interval tiers

### Phase 3 — MERT+DTW Fallback (ALWAYS BUILT)

This phase runs regardless of STARS outcome — it is the guaranteed fallback.

**Step 3.1**: Install MERT+DTW dependencies.

```bash
source venv_align/Scripts/activate
pip install torch transformers librosa soundfile dtaidistance
```

Test imports:

```bash
python -c "
import torch
import transformers
import librosa
import soundfile
from dtaidistance import dtw
print('All imports OK')
print(f'PyTorch {torch.__version__}, CUDA: {torch.cuda.is_available()}')
"
```

**Step 3.2**: Create the MERT+DTW alignment script.

Create `alignment_engine/mert_dtw_align.py` with the following specification:

**Purpose**: Take (audio_path, lyrics_text_path) → produce `word_timestamps.json` with
word-level start/end times using MERT feature embeddings + DTW alignment.

**Architecture**:

1. **Load MERT model** from HuggingFace: `m-a-p/MERT-v1-330M`
   - Use CPU by default; auto-detect CUDA if available
   - Extract frame-level embeddings at ~50Hz (MERT's native frame rate for
     16kHz audio with 320-hop transformer)

2. **Load audio**: Use `soundfile` to read the 16kHz mono WAV. Normalize to [-1, 1].

3. **Load lyrics**: Parse the text file. Split into words (preserve original
   punctuation for output, but lowercase for phoneme mapping).

4. **Synthesize reference audio from lyrics** (CRITICAL — this is the TTS synthesis
   approach from the Roadmap; without it DTW has no reference):
   - **Option A (preferred)**: Install `piper-tts` + download en_US voice model,
     synthesize the lyrics as speech, extract MERT features from synthesized speech
   - **Option B (simpler, fallback)**: Uniform timing initialization — assume each
     word gets equal duration, create feature vectors by repeating per-word mean
     MERT embeddings proportionally. Then use iterative refinement (DTW → extract
     per-word features → re-DTW with refined reference → repeat 2x)

   The Executor should attempt Option A first. If piper-tts fails to install or the
   voice model download fails, fall back to Option B.

5. **DTW alignment**:
   - Compute MERT frame embeddings from real audio → matrix (T_frames × D_features)
   - Compute MERT frame embeddings from reference audio → matrix (R_frames × D_features)
   - Compute cosine distance between all frame pairs
   - Run multi-dimensional DTW using `dtaidistance.dtw_ndim`
   - Extract optimal warping path
   - Map path to word boundaries: for each reference word's frame range, find
     corresponding real-audio frame range via the DTW path → word start/end times

6. **Output**: Write `word_timestamps.json` with schema:
   ```json
   {
     "words": [
       {"word": "Didn't", "start": 0.12, "end": 0.45, "index": 0},
       {"word": "know", "start": 0.48, "end": 0.72, "index": 1}
     ],
     "confidence": 0.82,
     "alignment_method": "mert_dtw_v0.1",
     "clip_duration_s": 30.0
   }
   ```

**CLI interface**: `--audio`, `--lyrics`, `--output`, `[--refine N]`, `[--device cpu|cuda]`

**Step 3.3**: Run MERT+DTW on the test clip.

```bash
source venv_align/Scripts/activate
python alignment_engine/mert_dtw_align.py \
  --audio alignment_engine/test_clip_30s.wav \
  --lyrics alignment_engine/test_clip_lyrics.txt \
  --output alignment_engine/test_clip_mert_dtw_output.json
```

Expected runtime: 2-5 minutes on CPU for a 30s clip (MERT at ~50Hz × 30s = 1500
frames; DTW on 1500 × ~40 reference frames = manageable).

**Step 3.4**: Run diagnostic on MERT+DTW output.

```bash
python alignment_engine/diagnose_alignment.py \
  --input alignment_engine/test_clip_mert_dtw_output.json \
  --expected-duration 30.0
```

### Phase 3B — MERT+DTW Iterative Refinement (only if initial quality fails)

If the diagnostic script reports FAIL on the first MERT+DTW pass (Step 3.4):

1. Add a `--refine` flag to `mert_dtw_align.py` that:
   - Pass 1: uniform/piper reference → DTW → word boundaries v1
   - Pass 2: extract per-word MERT embeddings from real audio at boundaries v1,
     build new reference by repeating per-word embeddings proportionally to v1
     duration → DTW → word boundaries v2
   - Pass 3: same refinement again → word boundaries v3 (final)

2. Re-run with `--refine 3`:
   ```bash
   python alignment_engine/mert_dtw_align.py \
     --audio alignment_engine/test_clip_30s.wav \
     --lyrics alignment_engine/test_clip_lyrics.txt \
     --output alignment_engine/test_clip_mert_dtw_output.json \
     --refine 3
   ```

3. Re-run diagnostic. If still failing, apply DTW path-smoothing:
   - Median filter (kernel=5) on the DTW warping path to reduce jitter
   - Minimum word duration floor of 0.08s (post-process: stretch words below this)

### Phase 4 — Adapter: Alignment Output → timing.json

**Step 4.1**: Create `alignment_engine/convert_to_timing.py`.

This is the critical bridge between any alignment engine output and the karaoke player.
It must handle two input formats:
- STARS output (format TBD by Executor at Step 2.3)
- MERT+DTW output (the `word_timestamps.json` format from Phase 3)

**Script usage**:

```bash
python convert_to_timing.py \
  --alignment alignment_engine/test_clip_mert_dtw_output.json \
  --lyrics "moss_audio test/starman" \
  --audio "moss_audio test/starman_vocal_16k.wav" \
  --output karaoke_player/timing.json \
  --method mert_dtw \
  [--clip-start 30.0]    # if aligning a clip; omit for full song
  [--force]              # write even if quality gates fail
```

**Logic**:

1. **Load alignment data**: Parse the alignment JSON. Detect format:
   - If `words` key exists with start/end per word → MERT+DTW format
   - If STARS-specific keys → STARS format (Executor determines exact schema)
   - If phoneme-level → aggregate to words using lyric-to-phoneme mapping

2. **Load full lyrics**: Parse the Starman lyrics file (identical logic to
   `transcribe_full_v2.py`'s `load_lyrics()`). Split into stanzas (by `\n\n`),
   lines, words. Create `LyricToken` objects with `global_index`.

3. **Map aligned words to lyric words**:
   - If aligned output covers the full song → map by index with fuzzy fallback
     using `SequenceMatcher` (same approach as `transcribe_full_v2.py`'s
     `align_words_to_window()`)
   - If aligned output covers a 30s test clip → map to the lyric range that
     corresponds to the clip segment

4. **Build timing.json structure** matching the exact schema consumed by
   `karaoke_player/karaoke.html`.

   **Critical fields the player reads** (must be present):
   - `metadata.duration_s` — float
   - `metadata.quality_status` — "pass" or "fail"
   - `stanzas[].label` — string (e.g., "Verse 1", "Chorus")
   - `stanzas[].words[].word` — display text
   - `stanzas[].words[].start` — float, seconds
   - `stanzas[].words[].end` — float, seconds
   - `stanzas[].words[].syllables[].text`, `.start`, `.end` — for fill animation

   Each word object should also include these diagnostic fields (not required by
   the player but preserved from the MOSS schema):
   - `recognized_word`, `match_confidence`, `match_status`, `lyric_global_index`,
     `start_local`, `end_local`, `segment`, `index`

5. **Generate stanza labels**: Map lyric file stanzas to human-readable labels:
   - First stanza ("Hey now, now / Goodbye love") → "Intro"
   - Stanzas containing "There's a starman waitin' in the sky" → "Chorus"
   - Stanzas containing "He told me / Let the children" → "Bridge"
   - Final stanzas with "La, la, la" → "Outro"
   - Others → "Verse N" based on position

   Use a keyword-based classifier on the first line of each stanza. If no
   keywords match, fall back to positional labels ("Stanza 1", "Stanza 2", etc.).

6. **Apply quality gates** (stricter than MOSS thresholds):
   - `MIN_MEDIAN_WORD_DURATION_S = 0.15`
   - `MAX_SHORT_WORD_RATIO = 0.10` (words ≤ 0.08s)
   - `MIN_COVERAGE_RATIO = 0.85`
   - Monotonicity: `start[i] ≤ start[i+1]` for all i
   - No negative or zero durations
   - Compute `duration_stats`, `short_word_ratio`, `segment_statuses`

7. **Write output**: Write `timing.json` only if quality passes or `--force` is set.
   Always write `timing_candidate.json` as a safe candidate the user can inspect.

**Step 4.2**: Test the adapter on the MERT+DTW test clip output.

```bash
source venv_align/Scripts/activate
python alignment_engine/convert_to_timing.py \
  --alignment alignment_engine/test_clip_mert_dtw_output.json \
  --lyrics "moss_audio test/starman" \
  --audio "moss_audio test/starman_vocal_16k.wav" \
  --output karaoke_player/timing.json \
  --method mert_dtw \
  --clip-start 30.0 \
  --force
```

This should produce a valid `timing.json` for the 30s clip segment only. The karaoke
player can then be tested with this partial timing to confirm end-to-end compatibility.

### Phase 5 — Diagnostic Script

**Step 5.1**: Create `alignment_engine/diagnose_alignment.py`.

This is a standalone script that validates any alignment JSON against quality thresholds.
It is used both during development (to check intermediate outputs) and by
`convert_to_timing.py` (as an imported module).

**Usage**:

```bash
python diagnose_alignment.py --input word_timestamps.json [--expected-duration 30.0]
python diagnose_alignment.py --input karaoke_player/timing.json [--full-song]
```

Exit codes: `0 = PASS`, `1 = FAIL`, `2 = INVALID_INPUT`

**Checks**:

| Check | Threshold | Failure Condition |
|-------|-----------|-------------------|
| Word count | > 0 | No words in output |
| Median word duration | ≥ 0.15s | median < 0.15 |
| Short word ratio | ≤ 10% | more than 10% of words ≤ 0.08s |
| Negative durations | 0 | any word with end ≤ start |
| Monotonic timestamps | 100% | any word[i].start > word[i+1].start |
| Coverage (full song) | ≥ 85% | (max_end - min_start) / audio_duration < 0.85 |
| Zero-duration words | 0 | any word with end == start |
| Gap sanity | < 0.5s median | median gap between consecutive words > 0.5s (warn only) |

**Output format** (stdout):

```
═══════════════════════════════════════════════════════
  ALIGNMENT QUALITY DIAGNOSTIC
  Input: word_timestamps.json
  Method: mert_dtw_v0.1
═══════════════════════════════════════════════════════
  Total words:           40
  Audio duration:        30.00s
  Timestamp range:       0.12s – 29.87s (99.2% coverage)
  Median word duration:  0.362s
  Mean word duration:    0.415s
  Min / Max duration:    0.095s / 1.840s
  Words ≤ 0.08s:         0 (0.0%)
  Negative durations:    0
  Non-monotonic:          0
  Zero-duration:          0
  Median gap:            0.042s
═══════════════════════════════════════════════════════
  PASS — All quality gates met
═══════════════════════════════════════════════════════
```

On FAIL, list each violation with the observed vs. threshold value.

**Implementation note**: The Executor should make `diagnose_alignment.py` work on both
`word_timestamps.json` (flat word list with `words` key) and the full `timing.json`
(stanzas with nested words). Detect format by checking for `stanzas` key.

### Phase 6 — Full Song Alignment Pipeline

**Step 6.1**: Create `alignment_engine/align_full.py`.

This is the top-level script that aligns the entire Starman vocal stem and produces
`timing.json` in one command.

**Usage**:

```bash
python align_full.py [--method auto|stars|mert_dtw] [--force]
```

**Pipeline**:

1. **Load lyrics** from `moss_audio test/starman`. Parse into stanzas (by `\n\n`).
   Count total words and stanzas.

2. **Load full vocal stem** WAV via soundfile. Get duration and sample rate.

3. **Stanza segmentation** (audio): Two approaches:
   - **Approach A (full-song DTW, preferred)**: Align the full song in one DTW pass.
     Full song is 257s × 50Hz = 12,850 frames; 12,850 × ~370 reference frames =
     ~4.7M cost matrix entries ≈ 19MB float32 — within RAM limits.
   - **Approach B (per-stanza, fallback)**: Use MOSS output from existing
     `karaoke_player/timing.json` as rough guide. Extract stanza start/end times
     from first/last word in each segment. Use as approximate boundaries with
     ±3s padding. Process each stanza independently via DTW.

   Try Approach A first. If DTW times out (>10 min) or produces OOM (>8GB RAM),
   fall back to Approach B with a log message.

4. **Call alignment engine** (MERT+DTW `align()` function or STARS inference) on
   the full song or each stanza. For per-stanza: concatenate results and fix any
   gaps/overlaps at stanza boundaries.

5. **Merge word timestamps**: Verify monotonicity across stanza boundaries.
   Fix overlaps by adjusting end time of earlier word; fix gaps by adjusting
   start time of later word.

6. **Run `convert_to_timing.py` logic** (import its functions or duplicate inline)
   to produce the final `timing.json` structure with metadata, quality gates,
   and stanza labels.

7. **Run `diagnose_alignment.py`** on the output.

8. **Write output**: If quality passes OR `--force`:
   - Back up existing `karaoke_player/timing.json` to `karaoke_player/backups/<timestamp>/`
   - Write new `karaoke_player/timing.json`
   - Print summary: word count, median duration, short ratio, coverage, quality status

**Step 6.2**: Run full-song alignment.

```bash
source venv_align/Scripts/activate
python alignment_engine/align_full.py --method mert_dtw --force
```

Expected runtime: 5-20 minutes on CPU for full song (MERT embedding: ~2-3 min,
DTW: ~5-15 min). GPU cuts MERT embedding to ~10-30s.

### Phase 7 — Test Report

**Step 7.1**: Create `alignment_engine/TEST_REPORT.md`.

The Executor should populate a markdown report with these sections:

```markdown
# STARS & MERT+DTW Alignment — Test Report

**Generated**: YYYY-MM-DD HH:MM:SS
**Run ID**: RUN_20260507-005544

## Executive Summary

[One paragraph: which method succeeded, key metrics vs MOSS baseline.]

## STARS Results

| Metric | Value |
|--------|-------|
| Repo cloned | YES / NO |
| Dependencies installed | YES / NO |
| Model weights available | YES / NO |
| Inference succeeded | YES / NO |
| Test clip aligned | YES / NO |
| Full song aligned | YES / NO |
| Median word duration | X.XXXs |
| Words <= 0.08s | X.X% |
| Notes | [any issues, error messages, workarounds] |

## MERT+DTW Results

| Metric | Value |
|--------|-------|
| Dependencies installed | YES |
| Reference method | piper-tts / uniform / iterative |
| Refinement passes | N |
| Test clip aligned | YES |
| Full song aligned | YES |
| Test clip median duration | X.XXXs |
| Test clip % <= 0.08s | X.X% |
| Full song median duration | X.XXXs |
| Full song % <= 0.08s | X.X% |
| Coverage | XX.X% |
| Runtime (test clip, CPU) | X.X min |
| Runtime (full song, CPU) | XX.X min |
| Diagnostic result | PASS / FAIL |
| Notes | |

## Comparison: New vs MOSS Baseline

| Metric | MOSS Baseline | Best New Alignment |
|--------|--------------|-------------------|
| Median word duration | 0.080s | X.XXXs |
| Words <= 0.08s | 72.6% | X.X% |
| Min duration | 0.020s | X.XXXs |
| Coverage | 19-27% per segment | XX.X% |
| Quality status | FAIL | PASS/FAIL |

## Player Verification

- [ ] karaoke_player/karaoke.html loads without errors
- [ ] Word highlighting advances with audio playback
- [ ] No rapid flashing of words (no <0.08s words visible)
- [ ] Stanza labels appear correctly
- [ ] Seek bar works with new timing
- [ ] Syllable fill animation visible on longer words

## Known Issues

[List any issues not resolved: specific stanzas with poor alignment, edge cases, etc.]

## Artifacts Produced

| Artifact | Path |
|----------|------|
| Test clip | alignment_engine/test_clip_30s.wav |
| STARS output (if any) | alignment_engine/test_clip_stars_output.json |
| MERT+DTW test output | alignment_engine/test_clip_mert_dtw_output.json |
| Full alignment | karaoke_player/timing.json |
| Candidate (if quality failed) | karaoke_player/timing_candidate.json |
| Backup of old timing | karaoke_player/backups/<timestamp>/ |
| Diagnostic output | (stdout captured in session) |
```

### Phase 8 — Verification (Manual)

**Step 8.1**: Open `karaoke_player/karaoke.html` in a browser.

- The player fetches `timing.json` relative to the HTML file
- Verify the quality status is "pass" in the loaded metadata
- If it shows the failed-timing warning, the `quality_status` field is "fail" —
  fix alignment and re-run

**Step 8.2**: Play the song and observe:

- Word highlighting should advance smoothly, not flash
- Words should highlight in sync with the singing, not lagging or leading by >0.5s
- The syllable fill animation should be visible (longer words fill gradually)
- The seek bar should work correctly with the full 257.3s duration

## Fallback Activation Criteria

The Executor must track these decision points:

| Trigger | Action |
|---------|--------|
| STARS `git clone` fails (network error, 404) | Skip STARS entirely; record in TEST_REPORT.md |
| STARS `pip install` fails (unresolvable deps) | Skip STARS; record error in TEST_REPORT.md |
| STARS model weights download fails (404, auth required) | Skip STARS; record error |
| STARS inference crashes (OOM, CUDA error, shape mismatch) | Skip STARS; record traceback |
| STARS output has >20% words ≤ 0.08s | Mark STARS as degraded; use MERT+DTW output for timing.json |
| MERT+DTW pass 1 fails diagnostic (≥1 hard failure) | Enable iterative refinement (`--refine 3`) |
| MERT+DTW with refinement still fails (median < 0.15s) | Apply post-processing: minimum duration floor of 0.08s |
| MERT+DTW with all mitigations still fails | Document in TEST_REPORT.md; produce best-effort timing.json with `--force`; mark `quality_status` as "fail" |
| Full-song DTW OOM (>8GB RAM) | Fall back to per-stanza alignment using MOSS-guide boundaries |
| piper-tts fails to install/synthesize | Fall back to uniform-duration reference + iterative refinement |

## Handoff Notes

### Key Paths

| What | Path |
|------|------|
| Project root | `C:/Users/doner/moss_audio` |
| Vocal stem (16kHz mono) | `moss_audio test/starman_vocal_16k.wav` (257.3s) |
| Lyrics file | `moss_audio test/starman` (plain text, 12 stanzas, `\n\n` delimited) |
| Karaoke player | `karaoke_player/karaoke.html` (reads timing.json from same dir) |
| Current timing.json | `karaoke_player/timing.json` (MOSS output, quality: fail) |
| Existing pipeline | `transcribe_full_v2.py` (MOSS-only, segment-window alignment) |
| Audio converter | `convert_mp3_to_wav.py` (uses imageio-ffmpeg) |
| Python venv (MOSS) | `venv_moss/` (Python 3.12.10, contains MOSS-Audio deps) |
| **New alignment venv** | `venv_align/` (Python 3.12, fresh — create in Step 0.2) |
| **New alignment code** | `alignment_engine/` (all new scripts go here) |
| STARS clone target | `alignment_engine/STARS/` |
| Research artifacts | `research_alignment/` (read-only — do not modify) |
| Run artifacts | `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260507-005544/` |
| Plan (this file) | `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260507-005544/ATT_1_PLAN.md` |

### Key Decisions Made

1. **STARS is primary; MERT+DTW is always-built fallback.** Even if STARS works,
   MERT+DTW is built for comparison and as a safety net.

2. **New venv (`venv_align`)** separate from `venv_moss` to avoid dependency conflicts
   (STARS may require specific PyTorch/transformers versions that differ from MOSS).

3. **Piper TTS as the DTW reference synthesis engine**, with uniform-duration +
   iterative refinement fallback. This matches the Roadmap's recommendation.

4. **Stanza segmentation from lyric file structure** (not MOSS). The lyric file uses
   `\n\n` between stanzas — this is deterministic and doesn't depend on MOSS.

5. **Quality gates stricter than MOSS** because singing alignment should produce
   physically plausible durations: median ≥ 0.15s (vs 0.12s for MOSS), short ratio
   ≤ 10% (vs 50% for MOSS), coverage ≥ 85% (vs 30% for MOSS segments).

6. **Full-song DTW is attempted first**, with per-stanza fallback if OOM. The full
   song cost matrix (~4.7M entries × 4 bytes = ~19MB) is well within typical RAM.

7. **The `--force` flag pattern from transcribe_full_v2.py is preserved**: alignment
   output always writes a candidate; timing.json is only overwritten if quality
   passes or `--force` is given.

### Ambiguities to Resolve During Execution

1. **STARS output format**: Unknown until Step 2.3. The adapter script must handle
   whatever format STARS emits (phoneme-level, word-level, TextGrid, custom JSON).
   The Executor should document this format before writing the adapter.

2. **STARS model weight availability**: Unknown. The Executor should first check the
   STARS README for weight download instructions. If weights are behind a request
   wall or unavailable, document and skip.

3. **Piper TTS voice model compatibility**: Piper TTS may not install cleanly on
   Windows. If it fails, the Executor should fall back to the uniform-duration
   reference + iterative refinement approach (Option B in Step 3.2).

4. **DTW performance on full song**: Estimated manageable, but actual performance
   depends on MERT embedding quality and the dtaidistance library's C implementation.
   If dtaidistance crashes on multi-dimensional DTW, fall back to cosine-distance
   matrix + scipy shortest-path DTW.

5. **Lyric-to-audio mapping for the 30s test clip**: The clip starts at 30.0s offset
   and contains verse 1 ("Didn't know what time it was…"). The Executor should
   verify that the clip actually contains these lyrics by listening to the extracted
   clip or checking the timestamps.

6. **Stanza label generation**: The keyword-based classifier for "Verse", "Chorus", "Bridge", "Outro" may mislabel stanzas. The Executor should verify labels against the actual song structure and adjust detection phrases as needed.

### Environment Notes

- **No system-level ffmpeg on PATH**: Use `imageio_ffmpeg.get_ffmpeg_exe()` for audio
  extraction (Python-only, no admin needed).
- **Python 3.12.10** available in `venv_moss`. The new `venv_align` should also use
  Python 3.12 for consistency.
- **CPU-only mode expected**: Pi's environment likely has no CUDA GPU. All commands
  assume CPU. If a GPU is available, PyTorch will auto-detect it.
- **Windows paths**: Use forward slashes in Python code (`Path` objects handle this).
  In bash commands, use `/c/Users/...` format (Git Bash).
- **Research files in `research_alignment/`** are read-only context documents. The
  Executor should NOT create new files there — all new artifacts go in
  `alignment_engine/`.
