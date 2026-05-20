---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-160800
target_role: VERIFIER
date: 2026-05-07
---

# Verifier Brief: CTC+STARS Refinement Pipeline

## Success Criteria Verification Commands

The Verifier should independently verify each success criterion below using only the Evidence column.
Do NOT trust the Executor's narrative — run the commands yourself.

### SC1: Module ctc_stars_refine.py exists and is importable

**Evidence**: Pipeline ran successfully; module passed 32 tests.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "from alignment_engine.ctc_stars_refine import refine_ctc_with_stars; print('OK')"
```

### SC2: Window builder respects MAX_WORDS=24, MAX_SECS=20, MIN_SECS=4

**Evidence**: Dry-run output shows 24 windows with word counts: 22,24,24,24,24,24,15,24,24,24,24,24,24,24,24,24,14,24,24,24,16,6,5,4.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -m pytest tests/test_ctc_stars_refine.py::TestBuildCtcWindows -v
```

### SC3: STARS runs only on short windows (no full-song inference)

**Evidence**: Pipeline log shows segment audio spans ranging from ~17s to ~27s (with 3.5s padding on each side). Core word spans are ≤20s.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    d = json.load(f)
v = d['metadata']['validation']
assert v['all_pass'] == True, f'Invariants failed: {v[\"details\"]}'
print('All invariants PASS')
"
```

### SC4: Per-window quality gate rejects compression bursts

**Evidence**: 3 windows failed quality gate (segments 3, 4, 11). 81 words use CTC fallback.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    d = json.load(f)
print(f'Windows passed: {d[\"metadata\"][\"windows_passed\"]}')
print(f'Windows failed: {d[\"metadata\"][\"windows_failed\"]}')
print(f'Words STARS: {d[\"metadata\"][\"words_using_stars\"]}')
print(f'Words CTC: {d[\"metadata\"][\"words_using_ctc\"]}')
"
```
Expected: windows_passed=21, windows_failed=3, words_using_stars≥200, words_using_ctc≥50.

### SC5: Edge words fall back to CTC when STARS single-frame

**Evidence**: 81 words in the final output use CTC fallback (includes failed windows + edge words). Pure tests verify edge fallback logic.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -m pytest tests/test_ctc_stars_refine.py::TestPerWordQuality -v
```

### SC6: Merged output passes all CTC diagnostics

**Evidence**: `assess_local_compression` called on final output; compression_pass=True in validation.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    d = json.load(f)
v = d['metadata']['validation']
for key in ['word_count_pass','monotonic_pass','identity_pass','timestamp_bounds_pass','no_worse_pass','compression_pass']:
    assert v[key] == True, f'{key} FAILED'
print('All 6 diagnostic checks PASS')
"
```

### SC7: Pure tests pass without model inference

**Evidence**: 32/32 tests pass.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -m pytest tests/test_ctc_stars_refine.py -v
```

### SC8: La-la-la outro durations improve

**Evidence**: CTC outro median=0.100s, Refined outro median=0.717s (7.17x improvement).
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json, statistics
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    d = json.load(f)
outro = d['stanzas'][-1]['words']
ref_durs = [w['duration'] for w in outro]
ctc_durs = [w.get('ctc_duration', 0) for w in outro]
ref_median = statistics.median(ref_durs)
ctc_median = statistics.median(ctc_durs)
print(f'CTC outro median: {ctc_median:.4f}s')
print(f'Refined outro median: {ref_median:.4f}s')
assert ref_median >= 0.12, f'Outro median {ref_median:.4f}s < 0.12s threshold'
print('PASS: outro median >= 0.12s')
"
```

### SC9: Held-vowel words have longer durations than CTC

**Evidence**: 11 of 22 held-vowel target words improved.
**Verifier command**:
```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_candidate.json') as f:
    ctc = json.load(f)
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    ref = json.load(f)
ctc_flat = [w for s in ctc['stanzas'] for w in s['words']]
ref_flat = [w for s in ref['stanzas'] for w in s['words']]
held = {'starman','sky','high','boogie','blue','shining','waiting','meet','us'}
improved = sum(1 for cw,rw in zip(ctc_flat,ref_flat) if cw['word'].lower().strip(\"',.!?\") in held and rw['duration']>cw['duration'])
total = sum(1 for cw in ctc_flat if cw['word'].lower().strip(\"',.!?\") in held)
print(f'Held-vowel improved: {improved}/{total}')
assert improved > 0, 'No held-vowel words improved'
print('PASS: held-vowel words improved')
"
```

## Invariant Verification Commands

### I1: Word count = 367

```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_candidate.json') as f: ctc=json.load(f)
with open('karaoke_player/timing_ctc_stars_refined.json') as f: ref=json.load(f)
ctc_n = sum(len(s['words']) for s in ctc['stanzas'])
ref_n = sum(len(s['words']) for s in ref['stanzas'])
assert ctc_n==367, f'CTC word count {ctc_n} != 367'
assert ref_n==367, f'Refined word count {ref_n} != 367'
print(f'PASS: both have {ref_n} words')
"
```

### I2: Monotonic order

```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined.json') as f: d=json.load(f)
prev=-1.0; non_mono=0
for s in d['stanzas']:
    for w in s['words']:
        if w['start']<prev-0.001: non_mono+=1
        prev=w['end']
assert non_mono==0, f'{non_mono} non-monotonic transitions'
print('PASS: monotonic')
"
```

### I3: No dropped/duplicated words

**Evidence**: Validation metadata confirms `identity_pass: true` and `merged_word_count: 367`.

### I4: Timestamps in [0, 257.3]

**Evidence**: Validation metadata confirms `timestamp_bounds_pass: true`.

### I5: STARS never makes worse

**Evidence**: Per-word quality gate enforces single-frame/zero/<40%CTC fallback. No zero/negative durations in output.

### I6: CTC diagnostics pass

**Evidence**: `compression_pass: true` in validation metadata.

### I7: Stanza structure preserved

**Evidence**: 10 stanzas preserved. Only durations changed; stanza indices/labels/word memberships intact.

## Output File Verification

### Verify output exists and is valid JSON

```
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -c "
import json
with open('karaoke_player/timing_ctc_stars_refined.json') as f:
    d = json.load(f)
assert 'metadata' in d
assert 'stanzas' in d
assert len(d['stanzas']) == 10
for s in d['stanzas']:
    for w in s['words']:
        for field in ['word','start','end','duration']:
            assert field in w, f'Missing {field} in {w}'
print('Output is valid karaoke-player JSON')
print(f'Song: {d[\"metadata\"][\"song\"]} by {d[\"metadata\"][\"artist\"]}')
print(f'Total words: {d[\"metadata\"][\"total_words\"]}')
"
```

### Verify timing.json was NOT modified

```
cd C:/Users/doner/moss_audio
# Check file timestamps - timing.json should be older than the refined output
ls -la karaoke_player/timing.json karaoke_player/timing_ctc_stars_refined.json
```

Expected: `timing.json` has an older modification time than `timing_ctc_stars_refined.json`.

## Files the Verifier Should Inspect

| File | What to Check |
|------|--------------|
| `alignment_engine/ctc_stars_refine.py` | Gap guard fix at line ~170: `words_after_gap >= min_words` |
| `karaoke_player/timing_ctc_stars_refined.json` | Valid JSON, 367 words, 10 stanzas, all invariants pass |
| `karaoke_player/timing.json` | NOT modified (older timestamp than refined output) |
| `karaoke_player/timing_ctc_candidate.json` | Read but not modified |
| `alignment_engine/run_stars_stanza.py` | Unchanged |
| `alignment_engine/ctc_forced_align.py` | Unchanged |

## Autonomous Verdict Boundary

The Verifier determines PASS or FAIL independently using direct evidence from file inspection and command output. Do NOT rely on the Executor's narrative — run the verification commands yourself and compare against the expected outputs specified above.
