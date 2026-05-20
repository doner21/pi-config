---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260507-144523
context_saturation_estimate: "~31%"
---

# Execution Report

## Context health

- Start self-estimate recorded in session: `~15%`, healthy and below the hard `45%` threshold.
- End self-estimate: `~31%`, still below threshold.

## Files created/modified

- Created `alignment_engine/ctc_forced_align.py`.
- Created `tests/test_ctc_forced_align.py`.
- Validation command `--check-deps` created runtime log `alignment_engine/run_logs/ctc_forced_align_20260507_145525.log` and ensured `alignment_engine/ctc_work/` exists.
- Did not modify `karaoke_player/timing.json`; observed timestamp after work: `2026-05-07 13:37:29.277280500 +0100 karaoke_player/timing.json`.
- No real model download/inference was run.

## Plan step outcomes

1. **Create `alignment_engine/ctc_forced_align.py`** — done.
   - Heavy/optional CTC imports are lazy.
   - Default paths include `alignment_engine/ctc_work`, `alignment_engine/run_logs`, and `karaoke_player/timing_ctc_candidate.json`.
   - Reuses pure helpers from `alignment_engine.convert_to_timing`.

2. **Expose testable functions** — done.
   - Implemented `CtcDependencyError`, `load_ctc_api`, `normalize_for_ctc`, `run_ctc_alignment`, `coerce_ctc_words`, `map_ctc_words_to_lyrics`, `detect_local_compression`, `analyze_ctc_candidate`, `build_ctc_timing_json`, and `run_pipeline`.

3. **CLI behavior** — done.
   - Implemented argparse CLI with default Starman audio/lyrics, `--device cpu`, `--language eng`, `--batch-size 1`, `--window-size 30`, `--context-size 2`, `--output karaoke_player/timing_ctc_candidate.json`, `--from-ctc-json`, and `--check-deps`.
   - No default path writes to `karaoke_player/timing.json`.

4. **Artifact writing** — done.
   - Pipeline writes raw CTC JSON and diagnostics under `alignment_engine/ctc_work/`, candidate JSON to `--output`, and run log under `alignment_engine/run_logs/`.

5. **Diagnostics details** — done.
   - Metrics include expected/actual word counts, coverage, monotonicity/non-monotonic count, duration stats/median, short-word ratio, local compression bursts, total coverage, suspicious gaps/overlaps, out-of-bounds count, and negative/zero duration count.

6. **Add `tests/test_ctc_forced_align.py`** — done.
   - Uses stdlib `unittest` only.
   - Covers import without CTC package, actionable dependency failure, Starman 367-token cardinality, punctuation/display preservation, synthetic 367-span karaoke conversion, diagnostics for bad candidates, default output safety, and `--from-ctc-json` conversion without CTC import/model loading.

7. **Validation commands** — done.

## Validation evidence

### `py_compile`

Command:

```text
venv_align/Scripts/python -m py_compile alignment_engine/ctc_forced_align.py tests/test_ctc_forced_align.py
```

Output:

```text
(no output)
```

Exit status: `0`.

### Unit tests

Command:

```text
venv_align/Scripts/python -m unittest discover -s tests -p "test_ctc_forced_align.py"
```

Output:

```text
........
----------------------------------------------------------------------
Ran 8 tests in 0.037s

OK
Wrote CTC candidate: C:\Users\doner\AppData\Local\Temp\tmpe6jkwd1r\timing_ctc_candidate.json
Wrote diagnostics: C:\Users\doner\AppData\Local\Temp\tmpe6jkwd1r\ctc_work\ctc_diagnostics_20260507_145531.json
Wrote raw CTC artifact: C:\Users\doner\AppData\Local\Temp\tmpe6jkwd1r\ctc_work\ctc_raw_20260507_145531.json
Quality status: pass
```

Exit status: `0`.

### Dependency check graceful failure

Command:

```text
venv_align/Scripts/python alignment_engine/ctc_forced_align.py --check-deps
```

Output:

```text
CTC dependency check failed gracefully: Missing optional dependency 'ctc_forced_aligner'. Install the optional CTC aligner with: pip install git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git
```

Exit status: `2` (expected/acceptable because `ctc_forced_aligner` is absent).

### Safety checks

Command:

```text
ls -la alignment_engine/ctc_work 2>/dev/null || true; ls -lt alignment_engine/run_logs | head -10; test -f karaoke_player/timing_ctc_candidate.json && echo candidate_exists || echo candidate_not_created_by_default_validation; stat -c '%y %n' karaoke_player/timing.json 2>/dev/null || true
```

Output:

```text
total 8
drwxr-xr-x 1 doner 197609 0 May  7 14:55 .
drwxr-xr-x 1 doner 197609 0 May  7 14:55 ..
total 36
-rw-r--r-- 1 doner 197609  452 May  7 14:55 ctc_forced_align_20260507_145525.log
-rw-r--r-- 1 doner 197609 8609 May  7 13:36 stars_full_alignment_20260507-133347_overlap.log
-rw-r--r-- 1 doner 197609 8236 May  7 13:32 stars_full_alignment_20260507-132949_wordsplit32.log
-rw-r--r-- 1 doner 197609 7322 May  7 13:28 stars_full_alignment_20260507-132555.log
candidate_not_created_by_default_validation
2026-05-07 13:37:29.277280500 +0100 karaoke_player/timing.json
```

## Deviations / notes

- No STARS integration/refinement was implemented or called.
- The real CTC model path was not exercised because the optional package is absent and the user instructed not to download/run real inference unless already available.
