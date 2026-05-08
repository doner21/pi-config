---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260507-202643
context_saturation_estimate: ~75%
---

# Research: CTC+STARS Duration-Only Enhancement Strategy

## Investigation Scope

Five areas per INTAKE: root cause of previous failure, STARS internal behavior, CTC boundary quality, hybrid strategies, and gap/silence analysis.

---

## Key Findings

### 1. Root Cause of RUN_20260507-160800 Failure

The previous CTC+STARS pipeline (ctc_stars_refine.py) had three compounding failure modes:

#### Failure A: Mechanical windowing cut across instrumental gaps (CRITICAL)

The build_ctc_windows() function builds sliding windows mechanically from CTC word density, without awareness of musical phrase boundaries. This caused windows 3 and 4 (covering Chorus 1) to fail the quality gate entirely:

- Window 3 (words 52-75): Starts at phase (45.44s, late Verse 1), crosses a 4.12s instrumental gap (51.64s -> 55.76s) between Verse 1 and Chorus 1. STARS produced starman=0.976s (CTC: 2.42s -- WORSE), sky=0.800s, phase=0.016s (single-frame). Gate: FAIL.
- Window 4 (words 70-93): Starts at like (mid-phrase), crosses into second half. STARS: starman=0.379s (CTC: 2.28s), sky=0.016s (SF), our=0.011s (SF). Gate: FAIL.
- Result: ALL Chorus 1 held-note words (starman, waitin, sky, blow, minds) received ZERO improvement.

When a STARS window contains 4+ seconds of silence/instrumental, the Viterbi decoder compresses the actual sung content into too few frames. This was already documented: the 46-word full run had 17-59% compression rates; the 19-27 word stanza run had 0-32%.

#### Failure B: Duration capping (151/367 words, 41%)

The merge logic enforces word[i].end <= word[i+1].ctc_start - 0.001. STARS produces segment-relative durations that are internally consistent within its padded window. When transplanted onto CTC absolute start times, they frequently exceed the inter-word gap:

| Word | CTC start | Next start | Max possible | STARS wanted | Got | Capped? |
|------|-----------|------------|--------------|--------------|-----|---------|
| starman (idx 183) | 135.28 | 137.86 | 2.58s | 2.768s | 2.579s | YES |
| low (idx 14) | 23.84 | 25.12 | 1.28s | 1.877s | 1.279s | YES |
| phase (idx 52) | 45.44 | 47.00 | 1.56s | ~2.0s | 1.559s | YES |

But dur_capping is not fatal: 100 of the 151 capped words still achieved >50% improvement over CTC. Capping limits the full STARS potential but still delivers gains.

#### Failure C: Median improvement was overstated

The execution report claimed refined median = 0.421s. Actual refined median = 0.299s (verified from timing_ctc_stars_refined.json metadata). Additionally, 30 words got WORSE (delta < -0.01s), mostly edge-positioned short words.

### 2. What DID Work

Despite the failures, significant improvements occurred for well-windowed words:

| Word | CTC | Refined | Delta | Source Window |
|------|-----|---------|-------|---------------|
| starman (183) | 1.52s | 2.579s | +1.059s | Window 10 (capped from 2.768s) |
| radio (20) | 0.98s | 2.005s | +1.025s | Window 1 |
| low (14) | 0.34s | 1.279s | +0.939s | Window 0 (capped from 1.877s) |
| phase (52) | 0.30s | 1.559s | +1.259s | Window 2 (capped) |
| fright (180) | 0.48s | 1.568s | +1.088s | Window 10 |
| tonight (168) | 0.66s | 1.904s | +1.244s | Window 9 |
| love (4) | 0.06s | 0.651s | +0.591s | Window 0 |
| sky (187) | 0.48s | 0.879s | +0.399s | Window 10 (capped from 2.987s!) |

Window 10 (words 175-198, Chorus 2 first half) produced the best STARS outputs: starman=2.768s, sky=2.987s, fright=1.568s. This was a musically coherent 24-word window with no internal gaps.

La-la-la outro (70 words): median from 0.100s to 0.717s (+617%). STARS inference: 153s for 24 windows (~6.4s/window on CPU).

### 3. STARS Internal Behavior

How STARS computes durations (from alignment_engine/STARS/inference/stars.py):

1. STARS runs Viterbi forced alignment on mel spectrogram frames
2. Model outputs word_of_list: each entry is (start_frame, end_frame, word_id)
3. Word duration = (end_frame - start_frame) x hop_size_second
4. hop_size_second = 256/24000 = ~0.01067s per frame
5. Single-frame word = 0.01067s (model could not place the word)
6. Word durations come DIRECTLY from the model, not aggregated from phonemes
7. max_frames=6000 (~32s max audio)

Failure patterns confirmed:
- Edge compression: First/last ~3 words in the 3.5s padding zone are systematically compressed
- Gap-induced burst compression: Windows with >2s silence/instrumental gaps cause Viterbi collapse
- STARS requires phoneme input: ARPABET via g2p_en.G2p then integer IDs via phone set lookup

STARS output keys: ph_list, word_list, word_durs, ph_durs, note_list, note_durs. SP/AP tokens interleaved in word_list -- must strip (handled by extract_stars_real_words).

### 4. CTC Boundary Quality

CTC start times are trustworthy as anchors. Evidence:
- All 367 words monotonic (verified)
- Word identities match source lyrics (identity invariant PASS)
- Stanza structure maps correctly to song sections
- Only 9 words have CTC duration >90% of available inter-word space
- Most words have room to extend

Stanza structure with gaps:

```
Intro (Hey now)     :  5 words, 10.7s-17.1s
  gap: 3.78s (musical pause)
Verse 1             : 57 words, 20.8s-51.6s (30.8s)
  gap: 4.12s (pre-chorus build)
Chorus 1            : 41 words, 55.8s-75.1s (19.3s)
  gap: 0.04s (attacca)
Bridge 1            : 18 words, 75.2s-83.1s (7.9s)
  gap: 17.24s (GUITAR SOLO)
Verse 2             : 60 words, 100.3s-130.6s (30.3s)
  gap: 4.18s (pre-chorus build)
Chorus 2            : 41 words, 134.7s-153.9s (19.2s)
  gap: 0.04s (attacca)
Bridge 2            : 18 words, 153.9s-161.7s (7.8s)
  gap: 0.74s
Chorus 3            : 39 words, 162.5s-180.9s (18.4s)
  gap: 0.08s
Bridge 3            : 18 words, 181.0s-188.2s (7.2s)
  gap: 9.52s (instrumental outro)
Outro (la-la-la)    : 70 words, 197.7s-257.3s
```

Critical insight: The CTC stanza boundaries ARE the musical phrase boundaries. The gaps between stanzas represent instrumental sections. Using stanza boundaries as STARS window boundaries naturally avoids the catastrophic compression caused by cutting across instrumental gaps.

### 5. Comparison of Segmentation Strategies

| Approach | Windows | Chorus 1 starman | Chorus 2 starman | Key Failure |
|----------|---------|------------------|------------------|-------------|
| CTC mechanical windows | 24 | CTC only (windows 3/4 FAILED) | 2.579s (capped from 2.768s) | Instrumental gaps inside windows |
| Stanza-aware (original) | 19 | 4.688s (prior research) | N/A (overwritten) | Some edge compression |
| Even-split 46-word | 9 | 1.131s (fragmented) | 2.800s | 48% avg compression |

The stanza-aware run produced the best results because windows were aligned to musical phrase boundaries.

### 6. La-La-La Outro

Stanza 9 (70 words, 197.7s-257.3s). Improved from median 0.100s to 0.717s in previous run. INTAKE requires removal from output. Leaves 297 words across 9 stanzas.

### 7. Space Budget Analysis

Only 9/366 words have CTC > 90% of available space. 22 words have <0.05s extension room (mostly function words: a, he, the, I). Words before stanza gaps have the most room (up to 17.24s for boogie before guitar solo), but extending a word into a musical gap is musically wrong -- the gap IS real silence.

---

## Constraints Identified

1. Stanza-length windows: Some stanzas exceed MAX_WORDS_PER_SEGMENT=24:
   - Verse 1: 57 words, 30.8s -> needs 2-3 sub-windows
   - Verse 2: 60 words, 30.3s -> needs 2-3 sub-windows
   - Chorus 1: 41 words, 19.3s -> needs 2 windows
   - All bridges: 18 words -- ideal single-window size

2. No instrumental gaps within a window: This is THE key constraint. Stanza boundaries naturally respect this since gaps occur between stanzas.

3. Dur_capping is inevitable with strict CTC anchoring. The question is whether capped values are still improvements (usually yes).

4. g2p_en available in venv_align. Edge case: contracted forms may not produce valid phonemes.

5. Original stanza-run outputs were overwritten by the 24-segment CTC window run. Only stars_full_work (9-segment) remains as reference.

6. 30 words got worse in previous run. Stricter per-word quality gate could prevent this.

---

## Existing Patterns

run_stars_stanza.py is the reference implementation for musical segmentation:
- build_stanza_word_map() -- maps every global word index to its stanza
- build_stanza_segments() -- creates STARS windows aligned to stanza boundaries
- merge_stanza_segments() -- center-confidence deduplication
- Key params: PADDING_SECONDS=3.5, MAX_WORDS_PER_SEGMENT=24, WORD_OVERLAP=10

ctc_stars_refine.py has correct merge/gate/invariant logic but wrong window boundaries. The fix is to replace build_ctc_windows() with a stanza-aware builder that reads the CTC candidate own stanza structure.

Center-confidence formula correctly prefers center-positioned STARS durations:

```
confidence = 1.0 - abs(word_midpoint - seg_center) / half_dur
padding_penalty: (offset/padding) squared if in padding zone
single_frame_penalty: x0.3 if dur <= 0.017s
```

---

## Recommendations

### Primary: Stanza-Boundary Windowing

Replace the mechanical build_ctc_windows() with a stanza-aware window builder:

1. Read CTC candidate stanza structure as window boundaries
2. Split overlong stanzas (more than 24 words or more than 20s) at musical sub-phrase boundaries
3. Add 6-word overlap at split boundaries for center-confidence merging
4. Remove la-la-la outro (stanza 9) from source
5. Keep all existing merge, gate, and invariant logic unchanged
6. Anchor every word at its exact CTC start time

Why this works: Stanza boundaries ARE the instrumental gaps. No window will contain a 4.12s or 17.24s gap. Chorus 1 starman should then get the full STARS benefit (estimated 2.5-4.7s vs CTC 2.42s).

### Window Split Strategy (297 words, 9 stanzas)

| Stanza | Words | Span | Windows | Strategy |
|--------|-------|------|---------|----------|
| Intro | 5 | 6.4s | 1 | trivial |
| Verse 1 | 57 | 30.8s | 3 | ~19 words each |
| Chorus 1 | 41 | 19.3s | 2 | split at natural midpoint |
| Bridge 1 | 18 | 7.9s | 1 | ideal |
| Verse 2 | 60 | 30.3s | 3 | ~20 words each |
| Chorus 2 | 41 | 19.2s | 2 | split at natural midpoint |
| Bridge 2 | 18 | 7.8s | 1 | ideal |
| Chorus 3 | 39 | 18.4s | 2 | split at natural midpoint |
| Bridge 3 | 18 | 7.2s | 1 | ideal |

Total: ~16 windows (~1.5-3 min CPU time)

### Expected Improvements

| Metric | Previous RUN_160800 | Expected stanza windows |
|--------|---------------------|-------------------------|
| Median duration | 0.299s | 0.35-0.45s |
| Chorus 1 starman | 2.42s CTC only | 2.5-4.7s STARS |
| Windows failed | 3/24 12.5% | 0-1/16 0-6% |
| Words dur_capped | 151/367 41% | 80-120/297 27-40% |
| Words worse | 30/367 8% | <10/297 3% |
| La-la-la present | Yes wrong | No correct |

### Implementation Approach

1. Import from run_stars_stanza.py: words_to_phonemes, load_phone_set, assess_local_compression
2. New function: build_stanza_ctc_windows() -- reads CTC stanzas, builds windows respecting stanza boundaries
3. Reuse existing: extract_stars_real_words, _should_use_ctc, gate_window_output, merge_windows, assemble_output, validate_invariants
4. Delete la-la-la: filter stanza 9 from ctc_candidate before window building
5. Handle la-la-la lyrics: remove lines from lyrics file or filter in code

---

## Unknowns Remaining

1. Chorus sub-phrase splitting: 41-word choruses have natural structure (two identical 20-word halves). Splitting at the repeat point after minds / before second starman preserves musical coherence.

2. Verse splitting: 57-60 word verses over ~30s. Even 3-way split at 19-20 words each is simplest. Musical 4-line sub-phrases might produce even better results but add complexity.

3. STARS reproducibility: 4.688s starman from the original stanza run is a reference point, not a guarantee. Window 10 2.768s and window 13 2.789s for Chorus 2/3 starman suggest 2.5-4s is realistic for a clean stanza window.

4. Bridge padding into gaps: Bridges ending at stanza gaps will have 3.5s of padding extending into instrumental sections. This should not cause problems since the padded audio is after the last bridge word.

5. Reduced dur_capping: Some capping is inevitable (tight inter-word spacing). But with cleaner STARS outputs from stanza windows, the gap between STARS duration and available space may be smaller, reducing capped cases.

6. The 32 existing tests must be updated. Tests for build_ctc_windows() need to reflect the new stanza-aware windowing. The merge, gate, and invariant tests should continue to pass unchanged.

### CONTINUATION

Context saturation at ~75%. The core finding is clear: replace mechanical CTC windows with stanza-boundary windows. The CTC candidate stanza structure already encodes the musical phrase boundaries. Using them as STARS window boundaries will eliminate instrumental-gap-induced failures and unlock the full STARS benefit for all choruses -- especially Chorus 1, which got zero improvement in the previous run.
