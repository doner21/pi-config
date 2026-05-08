---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-124756
context_saturation_estimate: "~18%"
---

# Verifier Brief: STARS `phase` Compression Fixes

## Success criteria evidence and checks

### Criterion: pass1 cache must not reuse same-count `timing.json` unless word identity/order and localized quality pass

Evidence:
- `alignment_engine/run_stars_stanza.py` defines `timing_json_word_entries()`, `normalize_word_identity()`, `timing_words_match_lyrics()`, and `assess_local_compression()`.
- `pass1_even_split()` now rejects identity mismatch, failed metadata quality, and local compression bursts before reuse.
- Tests cover same-count mismatch and same-word compressed cache rejection.

Verifier check:

```bash
python -m py_compile alignment_engine/run_stars_stanza.py tests/test_stars_alignment_engine_regressions.py
```

If pytest is installed:

```bash
python -m pytest tests/test_stars_alignment_engine_regressions.py -q
```

### Criterion: segment builder must not silently clip assigned word spans

Evidence:
- `build_stanza_segments()` now splits overlong word ranges via `_split_indices_by_safe_windows()`.
- Segment dictionaries include `estimated_word_start_sec`, `estimated_word_end_sec`, `coverage_status`, `warnings`, and `split_reason`.
- Regression test asserts overlong synthetic stanza is split and each segment covers assigned word timings.

Verifier check:

```bash
python -m pytest tests/test_stars_alignment_engine_regressions.py::test_overlong_stanza_segment_does_not_silently_clip_assigned_word_span -q
```

Or inspect `alignment_engine/run_stars_stanza.py` for removal of the old symmetric clamp after word assignment.

### Criterion: avoid raw/clean token cardinality divergence around `weren't`

Evidence:
- `alignment_engine/run_stars_full.py` no longer expands contractions to multi-token phrases.
- `clean_lyrics()` preserves apostrophes and collapses whitespace only.
- Regression test checks `That weren't no DJ, that was hazy cosmic jive` raw and cleaned token counts match.

Verifier check:

```bash
python - <<'PY'
from alignment_engine.run_stars_full import clean_lyrics
raw = "That weren't no DJ, that was hazy cosmic jive"
print(clean_lyrics(raw))
assert len(clean_lyrics(raw).split()) == len(raw.split())
PY
```

(Stub heavy deps first if local environment lacks `g2p_en/librosa/soundfile`.)

### Criterion: deterministic tests assert fixed behavior without STARS inference

Evidence:
- `tests/test_stars_alignment_engine_regressions.py` uses stubs for heavy/model dependencies.
- Added/updated tests for cache rejection, segment splitting/coverage, cardinality, and artifact compression detection.
- `pytest` was unavailable in this environment; `py_compile` and manual assertions passed.

Verifier check:

```bash
python -m py_compile alignment_engine/run_stars_stanza.py alignment_engine/run_stars_full.py tests/test_stars_alignment_engine_regressions.py
python -m pytest tests/test_stars_alignment_engine_regressions.py -q
```

Expected here without pytest:

```text
No module named pytest
```

### Criterion: diagnostics/metadata make compression visible

Evidence:
- `assess_local_compression()` returns status, failures, metrics, and burst examples.
- Stanza output metadata now includes `quality_failures`, `localized_compression`, and per-segment metadata.
- Failed-quality output is written as `alignment_engine/stars_stanza_work/timing_candidate_failed_quality.json` unless `STARS_FORCE_WRITE_TIMING=1` is set.

Verifier check:

```bash
python - <<'PY'
import json, sys, types, importlib
m=types.ModuleType('g2p_en'); m.G2p=object; sys.modules['g2p_en']=m
l=types.ModuleType('librosa'); l.load=None; l.resample=None; l.get_duration=None; sys.modules['librosa']=l
s=types.ModuleType('soundfile'); s.write=None; sys.modules['soundfile']=s
sys.modules.setdefault('numpy', types.ModuleType('numpy'))
st=importlib.import_module('alignment_engine.run_stars_stanza')
words=st.timing_json_word_entries(json.load(open('karaoke_player/timing.json')))
r=st.assess_local_compression(words, 'current timing')
print(r['status'], r['metrics'])
assert r['status'] == 'fail'
PY
```
