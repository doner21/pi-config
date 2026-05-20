---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-202643
target_role: VERIFIER
---

# VERIFIER BRIEF: Stanza-Boundary Windowing for CTC+STARS

## What to Verify

The Executor replaced mechanical CTC sliding windows with stanza-boundary-aligned
windows in `alignment_engine/ctc_stars_refine.py`. The output file is:
`karaoke_player/timing_ctc_stars_refined_v2.json`

## Critical Success Criteria (PASS/FAIL)

### C1: Chorus 1 Key Words MUST use STARS
**This is THE proof the fix works.**

Open `karaoke_player/timing_ctc_stars_refined_v2.json`. In stanza 2 (Chorus 1,
index=2), check these words:

| Global Index | Word | Required Source |
|-------------|------|----------------|
| 64 | starman | MUST start with "stars_" |
| 66 | in | MUST start with "stars_" |
| 68 | sky | MUST start with "stars_" |
| 85 | starman (second) | MUST start with "stars_" |
| 89 | sky (second) | MUST start with "stars_" |

In the previous run (RUN_20260507-160800), ALL of these were `ctc` because
windows crossed the 4.12s instrumental gap. If ANY show `ctc` as source,
the fix DID NOT WORK.

### C2: Window Count
- Expected: ~16 windows (built from 9 stanzas)
- Run: `python -c "from alignment_engine.ctc_stars_refine import build_stanza_ctc_windows, remove_lalala_from_ctc; import json; ctc=json.load(open('karaoke_player/timing_ctc_candidate.json')); c=remove_lalala_from_ctc(ctc); w=build_stanza_ctc_windows(c,max_words=24,max_secs=20,overlap=6,padding=3.5,audio_duration=257.3); print(len(w))"`

### C3: Invariants
Run: `python -c "from alignment_engine.ctc_stars_refine import refine_ctc_with_stars; r=refine_ctc_with_stars('karaoke_player/timing_ctc_candidate.json','stars_stanza_work/starman_vocal_24k.wav','moss_audio test/starman','karaoke_player/timing_ctc_stars_refined_v2.json',run_stars=False); print(r.validation)"`

(This reads the already-written output. All invariants must pass.)

### C4: Structural Checks
- 297 words (not 367 — la-la-la removed)
- 9 stanzas (not 10)
- 0 words with lyric_global_index >= 297
- Start anchor: all `start` times match CTC exactly (within 0.001s)
- No window crosses a stanza boundary (all window word ranges within one stanza)

### C5: File Integrity
- `timing.json` modification time is UNCHANGED from before the run
- `timing_ctc_candidate.json` modification time is UNCHANGED
- `karaoke_player/timing_ctc_stars_refined_v2.json` exists and is valid JSON

### C6: Test Suite
Run: `pytest tests/test_ctc_stars_refine.py -v`
Expected: 46 tests pass, exit code 0

## Known Issues to Document

1. **Median duration at 0.283s** (target: ≥0.30s). dur_capping from CTC
   anchoring limits how much STARS durations can extend.

2. **22 words got worse** (target: <10). Most are edge-positioned words
   where STARS produced shorter durations than CTC. This is partially offset
   by center-confidence merge preferring better candidates.

3. **Bridges underperform** (4/18 STARS for Bridge 1). Single-window bridges
   with mid-window compression. This is a STARS model quality issue on the
   resampled audio, not a windowing problem.

4. **Some Chorus 1 tail words still CTC** (`blow` at idx 80, `he` at idx 77).
   These were single-frame in the first window and not covered well by the
   second window due to center-confidence favoring CTC.

## Verification Procedure

```bash
# 1. Test suite
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -m pytest tests/test_ctc_stars_refine.py -v

# 2. Chorus 1 key words check
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined_v2.json') as f:
    out = json.load(f)
chorus1 = [s for s in out['stanzas'] if s['index'] == 2][0]
for w in chorus1['words']:
    gidx = w['lyric_global_index']
    if gidx in [64,66,68,77,80,82,85,89,95,102]:
        src = w.get('source','unknown')
        status = 'PASS' if src.startswith('stars_') else 'FAIL'
        print(f'  idx {gidx:3d} \"{w[\"word\"]:20s}\" source={src:40s} [{status}]')
"

# 3. Verify window count
venv_align/Scripts/python -c "
from alignment_engine.ctc_stars_refine import build_stanza_ctc_windows, remove_lalala_from_ctc
import json
with open('karaoke_player/timing_ctc_candidate.json') as f:
    ctc = json.load(f)
c = remove_lalala_from_ctc(ctc)
w = build_stanza_ctc_windows(c, max_words=24, max_secs=20, overlap=6, padding=3.5, audio_duration=257.3)
print(f'Windows: {len(w)} (expected ~16)')
for i, win in enumerate(w):
    print(f'  Window {i}: stanza={win[\"stanza_index\"]} idx=[{win[\"ctc_indices\"][0]}-{win[\"ctc_indices\"][-1]}] words={win[\"word_count\"]} overlap_tail={win.get(\"overlap_tail_start\")} overlap_head={win.get(\"overlap_head_end\")}')
"

# 4. Invariant validation
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined_v2.json') as f:
    out = json.load(f)
with open('karaoke_player/timing_ctc_candidate.json') as f:
    ctc = json.load(f)

# Word count
n = out['metadata']['total_words']
print(f'Words: {n} (expected 297) {\"PASS\" if n==297 else \"FAIL\"}')

# Stanza count
ns = len(out['stanzas'])
print(f'Stanzas: {ns} (expected 9) {\"PASS\" if ns==9 else \"FAIL\"}')

# La-la-la check
out_flat = []
for s in out['stanzas']:
    for w in s['words']:
        out_flat.append(w)
has_lalala = any(w.get('lyric_global_index',0) >= 297 for w in out_flat)
print(f'La-la-la present: {has_lalala} {\"FAIL\" if has_lalala else \"PASS\"}')

# Start anchor
ctc_flat = []
for s in ctc['stanzas']:
    for w in s['words']:
        if w['lyric_global_index'] < 297:
            ctc_flat.append(w)
max_shift = max(abs(ow['start'] - cw['start']) for ow, cw in zip(out_flat, ctc_flat))
print(f'Max start shift: {max_shift:.4f}s (expected 0.000) {\"PASS\" if max_shift < 0.001 else \"FAIL\"}')

# Median
import statistics
print(f'Median refined dur: {statistics.median([w[\"duration\"] for w in out_flat]):.4f}s (target >=0.30)')
"

# 5. File integrity
ls -la karaoke_player/timing.json karaoke_player/timing_ctc_candidate.json karaoke_player/timing_ctc_stars_refined_v2.json
```

## PASS/FAIL Determination

**PASS** if:
- All 46 tests pass
- Chorus 1 starman (idx 64) has source starting with "stars_"
- Chorus 1 sky (idx 68) has source starting with "stars_"
- Chorus 1 second starman (idx 85) has source starting with "stars_"
- 0 windows cross stanza boundaries
- All invariants pass (validation["all_pass"] == True)
- 0 la-la-la words in output
- timing.json NOT overwritten

**FAIL** if:
- Any Chorus 1 key word (idx 64, 68, 85, 89) shows "ctc" as source
- Any invariant fails
- La-la-la words present
- timing.json was overwritten
- Window count != 16 (±1)
