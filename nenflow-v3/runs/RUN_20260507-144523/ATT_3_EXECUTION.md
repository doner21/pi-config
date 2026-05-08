---
artifact_type: EXECUTION_REPORT
role: EXECUTOR
run_id: RUN_20260507-144523
context_saturation_estimate: "~22%"
---

# Execution Report — ATT_3 Continuation

## Context health

- Start self-estimate: `~18%`, healthy and below the user hard stop threshold of `>45%`.
- End self-estimate: `~22%`, still below threshold.

## Scope of this continuation

The prior executor had already created:

- `alignment_engine/ctc_forced_align.py`
- `tests/test_ctc_forced_align.py`

After that, the orchestrator corrected an API-shape bug in `alignment_engine/ctc_forced_align.py::run_ctc_alignment` to match the documented `ctc_forced_aligner` public API and added synthetic unit test coverage in `tests/test_ctc_forced_align.py::test_run_ctc_alignment_uses_public_api_shape`.

This continuation inspected the current files and re-ran validation. No blocker was found, so no code changes were made.

## Current implementation observations

- `run_ctc_alignment` now documents and uses the public API shape:
  - `generate_emissions(...) -> (emissions, stride)`
  - `get_alignments(...) -> (segments, scores, blank_token)`
  - `get_spans(tokens_starred, segments, blank_token)`
  - `postprocess_results(text_starred, spans, stride, scores)`
- The new synthetic unit test `test_run_ctc_alignment_uses_public_api_shape` is present and asserts those calls.
- The CLI help confirms the default output remains `karaoke_player/timing_ctc_candidate.json`, not `karaoke_player/timing.json`.

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
.........
----------------------------------------------------------------------
Ran 9 tests in 0.954s

OK
Wrote CTC candidate: C:\Users\doner\AppData\Local\Temp\tmphe4j__lc\timing_ctc_candidate.json
Wrote diagnostics: C:\Users\doner\AppData\Local\Temp\tmphe4j__lc\ctc_work\ctc_diagnostics_20260507_150010.json
Wrote raw CTC artifact: C:\Users\doner\AppData\Local\Temp\tmphe4j__lc\ctc_work\ctc_raw_20260507_150010.json
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

Exit status: `2` — expected/acceptable because `ctc_forced_aligner` is absent.

### CLI documentation check

Command:

```text
venv_align/Scripts/python alignment_engine/ctc_forced_align.py --help | head -80
```

Output:

```text
usage: ctc_forced_align.py [-h] [--audio AUDIO] [--lyrics LYRICS]
                           [--output OUTPUT] [--device DEVICE]
                           [--language LANGUAGE] [--batch-size BATCH_SIZE]
                           [--window-size WINDOW_SIZE]
                           [--context-size CONTEXT_SIZE] [--model MODEL]
                           [--from-ctc-json FROM_CTC_JSON] [--check-deps]
                           [--verbose]

Generate a CTC-only coarse karaoke timing candidate. Default output is
karaoke_player/timing_ctc_candidate.json, not karaoke_player/timing.json.

options:
  -h, --help            show this help message and exit
  --audio AUDIO         Vocal WAV/audio path
  --lyrics LYRICS       Lyrics text file path
  --output OUTPUT       Candidate timing JSON output path
  --device DEVICE       CTC device, e.g. cpu or cuda
  --language LANGUAGE   CTC language code
  --batch-size BATCH_SIZE
                        CTC batch size
  --window-size WINDOW_SIZE
                        CTC emission window size
  --context-size CONTEXT_SIZE
                        CTC context size
  --model MODEL         CTC forced-aligner model name
  --from-ctc-json FROM_CTC_JSON
                        Convert/debug from a saved or synthetic CTC JSON
                        result without loading the model package
  --check-deps          Check optional CTC dependency and exit
  --verbose             Print traceback for unexpected runtime failures
```

Exit status: `0`.

### Safety checks

Command:

```text
ls -la alignment_engine/ctc_work 2>/dev/null || true; ls -lt alignment_engine/run_logs | head -10; test -f karaoke_player/timing_ctc_candidate.json && echo candidate_exists || echo candidate_not_present_in_repo_root; stat -c '%y %n' karaoke_player/timing.json 2>/dev/null || true
```

Output:

```text
total 8
drwxr-xr-x 1 doner 197609 0 May  7 14:55 .
drwxr-xr-x 1 doner 197609 0 May  7 14:55 ..
total 44
-rw-r--r-- 1 doner 197609  452 May  7 15:00 ctc_forced_align_20260507_150010.log
-rw-r--r-- 1 doner 197609  452 May  7 14:59 ctc_forced_align_20260507_145919.log
-rw-r--r-- 1 doner 197609  452 May  7 14:55 ctc_forced_align_20260507_145525.log
-rw-r--r-- 1 doner 197609 8609 May  7 13:36 stars_full_alignment_20260507-133347_overlap.log
-rw-r--r-- 1 doner 197609 8236 May  7 13:32 stars_full_alignment_20260507-132949_wordsplit32.log
-rw-r--r-- 1 doner 197609 7322 May  7 13:28 stars_full_alignment_20260507-132555.log
candidate_not_present_in_repo_root
2026-05-07 13:37:29.277280500 +0100 karaoke_player/timing.json
```

## Plan step outcomes after ATT_3 inspection

1. **Create `alignment_engine/ctc_forced_align.py`** — still done; inspected current file.
2. **Expose testable functions** — still done; `run_ctc_alignment` API-shape correction is present.
3. **CLI behavior** — still done; `--help` documents the candidate default and `--from-ctc-json`/`--check-deps` paths.
4. **Artifact writing** — still done; synthetic conversion test writes candidate/raw/diagnostics/log artifacts in temp directories.
5. **Diagnostics details** — still done; diagnostics tests pass.
6. **Add `tests/test_ctc_forced_align.py`** — still done; now 9 tests including public API-shape regression.
7. **Validation commands** — done in this continuation with current evidence above.

## Deviations / notes

- No code changes were made by this ATT_3 executor because no blocker was found.
- No real model download or inference was run.
- `ctc_forced_aligner` remains absent, so `--check-deps` correctly exits `2` with install guidance.
- `karaoke_player/timing.json` was not overwritten.
