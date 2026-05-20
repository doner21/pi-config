---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260507-025516
preceded_by: ATT_0_INTAKE
investigation_status: COMPLETE
confidence: HIGH
---

# Research: STARS Segment-Boundary Compression Root Cause

## 1. Root Cause Confirmed

### Primary Cause: Even-Word Distribution Mismatch

The pipeline splits 412 words evenly into 9 segments of 46 words each,
using fixed 30s audio chunks. STARS, being a forced aligner, MUST place
every phoneme it receives somewhere in the audio frames. When a segment
audio contains only ~18s of vocal content but STARS is fed 46 words
(many belonging to the NEXT segment), it compresses excess words into
the remaining tail frames at 0.005-0.053s each.

### Evidence from Raw STARS Outputs

| Segment | Speech | Audio | Single-Frame | PctCompressed |
|---------|--------|-------|-------------|--------------|
| 0 | 11.31s | 30.04s | 15 words | 32.6% |
| 1 | 28.98s | 30.04s | 8 words | 17.4% |
| 2 | 21.23s | 30.04s | 10 words | 21.7% |
| 3 | 19.33s | 30.04s | 11 words | 23.9% |
| 4 | 24.25s | 30.04s | 9 words | 19.6% |
| 5 | 25.48s | 30.04s | 4 words | 8.7% |
| 6 | 28.53s | 30.04s | 21 words | 45.7% |
| 7 | 24.07s | 30.04s | 0 words | 0% |
| 8 | 6.18s | 17.41s | 15 words | 34.1% |

**93/412 words (22.6%) single-frame (<=0.017s)**
**140/412 words (34.0%) short (<=0.08s)**
**Median word duration: 0.245s. Quality: FAIL.**

Compression clusters at the TAIL of each segment. In seg 0, the last 24
words occupy only ~1.3s. These words belong to the lyric line spanning
across the 30s segment boundary into seg 1 audio.

### Secondary Issue: Merge Time-Offset Drift

merge_segments() uses last_word_end_time as time_offset for the next
segment. When seg 2 last word ends at 83.2s but seg 3 audio starts at
90s, a 10.25s gap appears (word 137->138: on at 83.2s -> you at 93.5s).
This is an instrumental interlude absorbed as SP tokens in seg 3.

## 2. max_frames=6000 is NOT the Bottleneck

| Parameter | Value | Effective Limit |
|-----------|-------|----------------|
| Config max_frames | 6000 | ~32s at 24kHz/hop=128 |
| CLI --max_tokens | 50000 | ~267s at 24kHz/hop=128 |
| 30s segment frames | ~5622 | Well within both limits |

AlignInferDataset stores wav frame counts as sizes. batch_by_size()
uses self.args.max_tokens (50000 from CLI), overriding config max_frames.
The full 257s vocal (~48,000 frames) could theoretically fit under
--max_tokens 50000 but would likely OOM on CPU due to conformer O(n^2).

## 3. Silence Detection Analysis

librosa.effects.split at top_db=30 yields 127 tiny fragments (0.02-12.7s)
because the vocal stem has minimal inter-word silence (instrumental
bleed-through, breath sounds). Key natural gaps detected:

- 17.26s -> 20.84s: 3.58s instrumental between intro and verse 1
- 83.35s -> 97.05s: 13.7s instrumental solo gap

These gaps exist but require careful threshold tuning for segmentation.
RMS-energy-based segmentation with larger windows is more viable.

## 4. Stanza Structure

The lyrics file has blank-line-separated stanzas:

| Stanza | Words | Content |
|--------|-------|---------|
| 1 (intro) | 5 | Hey now now / Goodbye love |
| 2 (verse 1) | 42 | Did not know what time... cosmic jive |
| 3 (chorus 1) | 43 | There is a starman... worthwhile |
| 4 (bridge 1) | 15 | He told me... boogie |
| 5 (verse 2) | 42 | I had to phone... in fright |
| 6 (chorus 2) | 43 | There is a starman... worthwhile |
| 7 (bridge 2) | 15 | He told me... boogie |
| 8 (outro ch) | 43 | Starman waitin... worthwhile |
| 9 (outro br) | 15 | He told me... boogie |
| 10-21 (la) | 149 | La la la... (12 stanzas) |

Stanza-aware segmentation would eliminate all mid-phrase boundaries.

### Recommended: Two-Pass Approach

1. **First pass**: Run even-split to get approximate word timings
2. **Stanza mapping**: Use approximate timings to map stanza boundaries
   to estimated audio times
3. **Segment creation**: Create stanza-aligned audio segments with
   2-3s padding on each side
4. **Second pass**: Re-run STARS on stanza-aligned segments
5. **Merge**: Prefer middle-of-segment timings, discard padded edges

Alternatives considered:
- RMS-energy-based segmentation (partial viability)
- Overlapping 35s segments with 5s overlap trusting middle 25s
  (simpler but less precise than two-pass)

## 5. Diagnostic Script

**Path:** alignment_engine/diagnose_boundary_compression.py

Modes: --mode analyze (timing.json), --mode audit (raw STARS JSONs),
--mode all (both)

Test assertions the script enables:
- No segment should have >20% single-frame words
- Inter-segment gaps should be <2s
- Speech content should be >70% of segment duration

Current failures: seg 0(32.6%), 2(21.7%), 3(23.9%), 6(45.7%), 8(34.1%)
Gap failures: seg 2->3 (10.25s)
Coverage failures: seg 0(37.7%), 8(35.5%)

## 6. Constraints and Risks

### Risks
- Two-pass doubles runtime (~80-90s CPU), acceptable for one-time generation
- CPU OOM possible on segments >60s (~11000 frames / 300+ phonemes)
- La-la-la stanzas (13 identical stanzas, 149 words): repeated phoneme
  sequences may produce arbitrary alignment
- Short bridges (15 words, ~5-7s): group with adjacent stanzas or align
  independently
- g2p_en coverage: some words like waitin produce partial phoneme sets

### Hard Constraints (unchanged)
- Audio and lyrics files are read-only
- timing.json schema: {stanzas: [{words: [{start, end, duration, word}]}]}
- CPU inference only, all code in alignment_engine/
- STARS source code must not be modified
- Existing timing.json backups preserved

## 7. Unknowns for the Planner

1. Padding per stanza segment (2s vs 5s): wider padding = more safety,
   but more discarded overlap
2. Overlap arbitration: prefer later segment timings (STARS stabilizes
   after initial silence)
3. La-la-la handling: identical lyrics in 13 stanzas. May need silence-
   based splitting within the outro region
4. Short stanza grouping: bridge stanzas (15 words) may benefit from
   pairing with adjacent chorus
5. Auto-detection: should the pipeline detect compression and re-run with
   adjusted segments, or report to the human?

## 8. Summary Table

| Finding | Status |
|---------|--------|
| Root cause: even word split across fixed segments | CONFIRMED |
| max_frames=6000 is a bottleneck | DISPROVEN |
| Silence detection viable for segmentation | PARTIAL (major gaps only) |
| Stanza structure available in lyrics | CONFIRMED (10+ stanzas) |
| STARS always aligns all given phonemes | CONFIRMED |
| Diagnostic script built and validated | YES |
| Recommended: two-pass stanza-aware | YES |
| Merge time-offset causes gap drift | CONFIRMED |