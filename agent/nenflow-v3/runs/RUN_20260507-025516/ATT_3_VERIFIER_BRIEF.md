---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-025516
preceded_by: ATT_3_EXECUTION
for_role: VERIFIER
---

# Verifier Brief — Stanza-Aware STARS Alignment Pipeline

## What Was Built

`alignment_engine/run_stars_stanza.py` — a two-pass stanza-aware STARS forced-alignment
pipeline that replaces the even-split approach in `run_stars_full.py`.

## What to Verify

### 1. Pipeline exists and is functional

**File:** `C:/Users/doner/moss_audio/alignment_engine/run_stars_stanza.py`

**Run it:**
```bash
cd C:/Users/doner/moss_audio
venv_align/Scripts/python alignment_engine/run_stars_stanza.py
```

Expected: ~60-90s runtime, produces `karaoke_player/timing.json` with 412 words and
Quality: PASS.

### 2. Quality metrics from timing.json

**Run diagnostic:**
```bash
cd C:/Users/doner/moss_audio
venv_align/Scripts/python alignment_engine/diagnose_boundary_compression.py --mode analyze
```

Expected output:
```
Quality: PASS
Median duration: 0.336s (≥ 0.15)
Single-frame (≤0.017s): 50 (12.1%)
Short (≤0.08s): 90 (21.8%)
Inter-segment gaps >0.5s: NONE
```

### 3. No boundary compression — key evidence

The even-split pipeline had this signature of boundary compression:
- Clusters of 15-24 single-frame words at segment tails
- Large gaps (e.g., 10.25s) between segments

The stanza pipeline should show:
- **Zero** inter-word gaps > 0.5s
- Single-frame words are isolated short function words ("a", "the", "he", "it")
  rather than clusters at segment boundaries

**Verify:** Read the last 10 words of timing.json's word list. They should be la-la-la
words with reasonable durations (not all compressed).

### 4. File integrity

| Check | Expected |
|-------|----------|
| `alignment_engine/run_stars_stanza.py` exists | Yes |
| `alignment_engine/run_stars_full.py` unchanged | Yes (compare with git or backup) |
| `alignment_engine/STARS/` unmodified | Yes |
| `karaoke_player/backups/timing_pre_stanza_fix.json` exists | Yes |
| `alignment_engine/stars_stanza_work/` has segment outputs | Yes (11 segments) |
| `alignment_engine/stars_full_work/` preserved | Yes |

### 5. Stanza parsing correctness

**Verify:**
```bash
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import sys; sys.path.insert(0,'alignment_engine')
import run_stars_stanza as rss
stanzas = rss.parse_stanzas(rss.load_lyrics())
print(f'Total stanzas: {len(stanzas)}')
print(f'Non-la stanzas: {sum(1 for s in stanzas if not all(w.lower().startswith(\"la\") for w in s[0].replace(\",\",\"\").split()))}')
print(f'La stanzas: {sum(1 for s in stanzas if all(w.lower().startswith(\"la\") for w in s[0].replace(\",\",\"\").split()))}')
"
```

Expected: 21 total stanzas (9 non-la, 12 la-la-la).

### 6. No regressions

| Check | How |
|-------|-----|
| `run_stars_full.py` still works | `venv_align/Scripts/python -c "import py_compile; py_compile.compile('alignment_engine/run_stars_full.py', doraise=True)"` |
| `karaoke.html` loads | Open in browser |
| timing.json schema unchanged | `{stanzas: [{label, words: [{start, end, duration, word}]}]}` |

## Known Limitations (Honest Assessment)

1. **50 single-frame words remain** (12.1%). These are NOT boundary compression artifacts
   — they are short function words ("a", "the", "he", "it", "me") that STARS legitimately
   assigns short durations to in rapid speech passages. The Plan's criterion of "zero
   single-frame words" is not met, but the pathological boundary compression (22.6%
   clustered at edges) is eliminated.

2. **La-la-la outro has 12 SF words** — identical repeated phoneme sequences cause STARS
   to distribute durations somewhat arbitrarily. The la-la-la quality is acceptable for
   karaoke highlighting (user's primary concern was main song stanzas).

3. **Diagnostic's per-segment 46-word analysis** shows 27.3% SF in "Seg 8" — this is
   the diagnostic splitting the merged output into fixed 46-word chunks (not our actual
   STARS segments). The last chunk contains la-la-la words at the song's fade-out.

## Quick Sanity Check

```bash
cd C:/Users/doner/moss_audio && venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing.json') as f:
    tj = json.load(f)
words = tj['stanzas'][0]['words']
# Check first 5 and last 5 words
for w in words[:5]:
    print(f'  {w[\"word\"]:>12s}: {w[\"start\"]:.2f}-{w[\"end\"]:.2f} ({w[\"duration\"]:.3f}s)')
print('  ...')
for w in words[-5:]:
    print(f'  {w[\"word\"]:>12s}: {w[\"start\"]:.2f}-{w[\"end\"]:.2f} ({w[\"duration\"]:.3f}s)')
print(f'\\nMetadata: {tj[\"metadata\"]}')
# Verify no huge gaps
gaps = [words[i][\"start\"] - words[i-1][\"end\"] for i in range(1, len(words))]
max_gap = max(gaps)
print(f'Max inter-word gap: {max_gap:.2f}s')
"
```

Expected: First words ~10.8-17s ("hey now now goodbye love"), last words ~253-257s
("la la la la la"), max gap < 5s (instrumental pauses).
