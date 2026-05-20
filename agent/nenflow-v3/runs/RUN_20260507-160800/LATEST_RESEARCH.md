---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260507-160800
context_saturation_estimate: ~45%
---

# Research: CTC+STARS Refinement Pipeline

## Investigation Scope

Five areas per INTAKE.

---

## Key Findings

### 1. CTC Candidate Weaknesses

Source: karaoke_player/timing_ctc_candidate.json (367 words)

CTC reliable monotonic but underestimates singing durations.

**A. Long-vowel content words plausible but likely too short:**

| Word | CTC dur | Count | Note |
|------|---------|-------|------|
| sky | 0.48-0.54s | 5x choruses | Held note, likely 0.6-1.0s |
| blow | 0.20-0.30s | 5x | Held oo vowel, likely 0.4-0.6s |
| fright | 0.48s | idx 180 | Verse 2 ending, 0.8-1.2s |
| jive | 0.60s | idx 61 | Verse 1 ending diphthong |
| wave | 0.60s | idx 50 | Held ay |
| fade | 1.74s | idx 41 | Longest, plausible |
| minds | 0.50-0.64s | 5x | Held eye |

**B. La-la-la outro -- massive underestimation:**

Single la, tokens: ALL 0.06-0.10s (35+ instances). Should be >=0.15s.
- idx 348: la-la 0.100s (neighbors 0.34-0.42s)
- idx 366: la-la 0.060s (final word, 11.14s gap)

**C. Short non-function words (<0.15s) musically significant:**

| idx | Word | CTC | Neighbors | Note |
|-----|------|-----|-----------|------|
| 4 | love | 0.060s | Goodbye(0.72) | Held note intro |
| 277 | all | 0.060s | worthwhile(0.40) | "its all worthwhile" |
| 281 | me | 0.020s | told(0.12) | Extremely short |
| 356 | la, | 0.020s | la-la,(0.30) | In outro |

**D. Function words at 0.02-0.08s:** a, he, the, to, I -- speech-typical.

**E. CTC gets right:** starman at 1.52-2.42s across choruses.

### 2. STARS API Surface

Source: alignment_engine/run_stars_stanza.py, run_stars_segment() at line 252



**Input parameters:**

| Param | Type | Description |
|-------|------|-------------|
| wav_24k | str | 24kHz mono vocal WAV path |
| segment | dict | {words: [str], phones: [str], ph2words: [int]} |
| seg_idx | int | Segment index for output naming |
| start_sec | float | Audio slice start (seconds) |
| end_sec | float | Audio slice end (seconds) |

**Internal processing:**

1. librosa.load(wav_24k, sr=24000, mono=True, offset=start_sec, duration=end-start) -- audio slice
2. soundfile.write to WORK_DIR/segment_{idx}.wav
3. Writes metadata JSON to meta_segment_{idx}.json:
   [{item_name, wav_fn, word: [...], ph: [...], ph2words: [...]}]
   - ph: ARPABET phonemes from g2p_en.G2p
   - ph2words: maps each phoneme to word index
4. Runs STARS subprocess:
   python STARS/inference/stars.py --ckpt <path> --config <path> --phset <path>
     --metadata <meta_path> -o <out_dir> --ds_workers 0 --bsz 1 --max_tokens 50000
   PYTHONPATH=STARS_DIR, CUDA_VISIBLE_DEVICES="" (CPU-only)
5. Returns data[0] from output.json or None on failure

**Output keys (from output.json):**

| Key | Type | Description |
|-----|------|-------------|
| item_name | str | Segment identifier |
| wav_fn | str | Input WAV path |
| ph_list | list[str] | ARPABET phonemes incl <SP> |
| word_list | list[str] | Words incl <SP> and <AP> markers |
| word_durs | list[float] | Duration per word token (seconds) |
| ph_durs | list[float] | Duration per phone token (seconds) |
| note_list, note_durs, *tech | Various | Singing technique (not needed for timing) |

**Dependencies:** g2p_en.G2p, librosa, soundfile, STARS checkpoint at
checkpoints/stars_chinese_english_bilingual/model_ckpt_steps_300000.ckpt,
config at configs/stars_bilingual.yaml, phone set at chinese_and_english_phone_set.json.
STARS max_frames=6000 (~32s).

### 3. STARS Failure Patterns

Sources: stars_full_work/out_segment_0..8/output.json (even-split, 9 segs x ~46 words)
        stars_stanza_work/out_segment_0..18/output.json (stanza-aware, 19 segs x 5-34 words)
        diagnose_boundary_compression.py

**Full-run (even-split, ~46 words/seg, ~30s each):**

| Seg | Real | Compressed | Single-Frame | Rate |
|-----|------|-----------|--------------|------|
| 0 | 46 | 22 | 15 | 48% |
| 1 | 46 | 9 | 4 | 20% |
| 2 | 46 | 17 | 10 | 37% |
| 3 | 46 | 14 | 11 | 30% |
| 4 | 46 | 11 | 9 | 24% |
| 5 | 46 | 8 | 4 | 17% |
| 6 | 46 | 27 | 21 | 59% |
| 7 | 46 | 0 | 0 | 0% |
| 8 | 46 | 3 | 0 | 7% |

**Critical failure clusters in full run:**

Segment 0 tail collapse (the fade region):
- fade: CTC 1.740s to STARS 0.016s (single-frame)
- seem: CTC 0.440s to STARS 0.016s
- sound: CTC 0.500s to STARS 0.021s
- loud: CTC 0.240s to STARS 0.075s
- Words idx 27-34 (some cat was laying down...) ALL single-frame (0.016s each)

Segment 6 (59%): 21 single-frame words. Chorus 2 second half. Segment boundary mid-phrase.

Segment 7 (0%): Clean. Happens to align with musical unit.

**Stanza-run (stanza-aware, smaller segments):**

| Seg | Words | Compr | Rate | Key observations |
|-----|-------|-------|------|------------------|
| 3 | 19 | 3 | 16% | hazy 0.656s, cosmic 0.315s, jive 0.437s |
| 4 | 24 | 2 | 8% | starman 4.688s, waitin 3.643s, sky 0.603s |
| 5 | 27 | 5 | 19% | Edge: he 0.011s, blow 0.016s, our 0.011s |
| 10 | 24 | 2 | 8% | Similar to seg 4 |
| 11 | 27 | 7 | 26% | Edge compression at boundaries |
| 13 | 24 | 1 | 4% | Excellent |
| 14 | 25 | 8 | 32% | Edge: knows 0.016s, all 0.011s, worthwhile 0.037s |

**Root cause analysis:**
- 46 words/seg causes catastrophic compression; 19-27 words/seg mostly fine
- Edge compression persists in stanza run: words in first/last ~3 positions of 3.5s padding zone
- Cutting musical phrases mid-flow (e.g. segments 4/5 split) triggers compression
- merge_stanza_segments() handles this via center-confidence deduplication

**Existing quality gate (assess_local_compression, line ~180):**
- LOCAL_COMPRESSION_WINDOWS = (6, 9)
- MAX_LOCAL_SINGLE_FRAME_WORDS = 2
- MAX_LOCAL_SHORT_RATIO = 0.70
- MIN_LOCAL_DURATION_PER_WORD = 0.10
- Detects catastrophic burst collapse but does NOT individually gate per-word STARS vs CTC

### 4. Simplest Experiment

The stanza STARS run already validates short-window refinement. But uses stanza boundaries from timing.json, not CTC boundaries.

**Recommended test: Chorus 1, first half**

- Audio slice: 55.5s-70.5s (15.0s with ~3s padding each side)
- 24 words (idx 62-85: "Theres a starman waitin in the sky...blow our minds...starman")
- CTC vs STARS stanza observed:
  - starman: CTC 2.42s vs STARS 4.688s (+93%)
  - waitin: CTC 0.50s vs STARS 3.643s (+629%)
  - sky: CTC 0.52s vs STARS 0.603s (+16%)
  - meet: CTC 0.24s vs STARS 0.645s (+169%)
  - minds: CTC 0.64s vs STARS 0.789s (+23%)

**Implementation:**



Pre-existing 24kHz WAV at stars_stanza_work/starman_vocal_24k.wav.

**What proves the hypothesis:** STARS produces no single-frame bursts, longer held-vowel durations, passes assess_local_compression.

### 5. Phoneme Dependency

**Finding: CTC does NOT produce phonemes.** Verified: zero hits for "phoneme", "g2p", "arpabet" in ctc_forced_align.py.
CTC outputs only word-level start/end/duration and optional syllable text splits (no ARPABET).

STARS requires phonemes. Conversion exists in run_stars_stanza.py:



**What changes are needed:**
1. g2p_en already in venv_align -- no new dependency
2. Call words_to_phonemes() on window word list before run_stars_segment()
3. Pass resulting phones and ph2words as part of segment dict
4. phone_lookup from chinese_and_english_phone_set.json maps ARPABET to integers
5. No CTC pipeline changes needed -- refinement module converts independently

---

## Constraints Identified

1. **STARS max_frames=6000 (~32s):** Windows >32s risk frame overflow. 20s safe upper bound.
2. **STARS conv minimum:** MIN_SEGMENT_DURATION=2.0s. Very short segments fail.
3. **Edge compression is systematic:** Words in 3.5s padding zone compress. merge_stanza_segments() handles via center-confidence score.
4. **STARS lexicon limits:** Chinese+English phone set. Unrecognized words get zero valid phonemes.
5. **CPU-only inference:** 1-5 min per segment.
6. **g2p_en dependency:** Already in venv_align, no install needed.
7. **SP/AP tokens interleaved** in word_list/word_durs. Must strip when extracting real-word durations.

## Existing Patterns

**alignment_engine/run_stars_stanza.py** is the reference implementation:

1. Segment building: build_stanza_segments() partitions by stanza boundaries with configurable padding, max duration, max words per segment
2. STARS invocation: run_stars_segment() runs STARS subprocess on each segment
3. Quality gating: assess_local_compression() detects localized compression bursts with sliding windows
4. Merge: merge_stanza_segments() deduplicates overlapping words by center-confidence score, re-groups by stanza
5. Key parameters: PADDING_SECONDS=3.5, MAX_WORDS_PER_SEGMENT=24, WORD_OVERLAP=10, SINGLE_FRAME_DURATION=0.017s

**CTC candidate JSON** uses same stanza schema as timing.json -- stanzas with index, label, words[].

**For CTC+STARS module:** Import run_stars_segment, words_to_phonemes, load_phone_set, assess_local_compression from run_stars_stanza. Replace build_stanza_segments with CTC-boundary window builder. Adopt center-confidence merge pattern.

---

## Recommendations

1. **Use stanza run as template, not full run.** 19-27 words/seg works (0-32% compression) vs 46 words (17-59%). CTC windows should target similar density.

2. **Window sizing: adaptive by CTC density.** Group by stanza or CTC word density, split when exceeding MAX_WORDS_PER_SEGMENT=24.

3. **Import from run_stars_stanza, do not duplicate.** Functions should be imported, not copied.

4. **Per-word quality gate: center-confidence score.** Words with confidence below 0.3 (from merge_stanza_segments logic) fall back to CTC. This handles both edge compression and single-frame words.

5. **First experiment: Chorus 1 first half** (words idx 62-85). Compare starman/waitin/sky/blow/minds durations to CTC.

6. **La-la-la outro is the biggest CTC weakness.** la, tokens at 0.06-0.10s are clearly wrong. STARS on 4-word groups (LALALA_GROUP_SIZE=4) should fix them. High priority test case.

7. **Single pass is sufficient.** CTC candidate already provides approximate timings. No two-pass approach needed.

---

## Unknowns Remaining

1. **STARS inference time:** ~1-5 min/segment on CPU. ~18 windows for full 367-word song = 18-90 minutes total.
2. **STARS checkpoint licensing:** model_ckpt_steps_300000.ckpt license not documented. Verify before distributing output.
3. **Cross-segment word identity:** CTC has exact matches for all 367 Starman words. May not hold for other songs (CTC may misrecognize some words).
4. **Rapid passages:** "some cat was layin down some rock n roll" collapsed entirely in full run. Test dense-window from Verse 1.
5. **11.14s same-stanza gap at idx 365-366:** Final la-la at 0.06s. May be instrumental outro. Avoid STARS on windows with large gaps -- they contain no singing to align.
6. **Output format for karaoke player:** Karaoke player loads timing.json with stanza structure. Refinement should update durations in-place within the CTC candidate schema.
