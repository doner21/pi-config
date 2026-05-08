---
artifact_type: VERIFICATION_REPORT
role: VERIFIER
run_id: RUN_20260507-144523
verdict: PASS
context_saturation_estimate: "~18%"
---

# Verification Report

Note: two attempts to invoke the verifier subagent returned only tool-registration text and did not create an artifact, so the orchestrator performed direct verification in the visible session using the verifier checklist and independent command output.

## Criterion 1 — `alignment_engine/ctc_forced_align.py` exists with documented CLI and pure functions

**Checked:** Read/compiled `alignment_engine/ctc_forced_align.py`; ran CLI help.

**Evidence:**

```text
venv_align/Scripts/python -m py_compile alignment_engine/ctc_forced_align.py tests/test_ctc_forced_align.py
(no output, exit 0)
```

`--help` prints a documented CLI with `--audio`, `--lyrics`, `--output`, `--device`, `--language`, `--batch-size`, `--window-size`, `--context-size`, `--model`, `--from-ctc-json`, and `--check-deps`.

**Result:** PASS

## Criterion 2 — Repo-root command shape and default candidate output

**Checked:** CLI help and parser behavior through tests.

**Evidence:** `--help` includes:

```text
Generate a CTC-only coarse karaoke timing candidate. Default output is
karaoke_player/timing_ctc_candidate.json, not karaoke_player/timing.json.
```

The unit suite includes `test_default_output_path_is_candidate_not_timing_json`.

**Result:** PASS

## Criterion 3 — Candidate/raw/diagnostic/log artifact paths

**Checked:** Ran synthetic conversion tests, which exercise artifact writing without the model package.

**Evidence:**

```text
.........
----------------------------------------------------------------------
Ran 9 tests in 0.928s

OK
Wrote CTC candidate: C:\Users\doner\AppData\Local\Temp\tmp34rs84km\timing_ctc_candidate.json
Wrote diagnostics: C:\Users\doner\AppData\Local\Temp\tmp34rs84km\ctc_work\ctc_diagnostics_20260507_150332.json
Wrote raw CTC artifact: C:\Users\doner\AppData\Local\Temp\tmp34rs84km\ctc_work\ctc_raw_20260507_150332.json
Quality status: pass
```

Real `--check-deps` also wrote logs under `alignment_engine/run_logs/`.

**Result:** PASS

## Criterion 4 — Preserve lyric display tokens and karaoke schema

**Checked:** Unit tests directly validate Starman 367-token cardinality, punctuation preservation, and synthetic 367-span conversion to `metadata` + `stanzas[].words[]`.

**Evidence:** The 9-test unittest suite passed. Tests include:

- `test_starman_lyric_cardinality_is_367`
- `test_mapping_preserves_original_display_punctuation`
- `test_synthetic_367_span_conversion_to_karaoke_schema`

**Result:** PASS

## Criterion 5 — Required diagnostics

**Checked:** Inspected/validated tests for diagnostics and ran full suite.

**Evidence:** `test_diagnostics_detect_expected_quality_problems` passed and checks non-monotonicity, median/short-duration failures, localized compression, low word-count coverage, low total coverage, suspicious gaps, and overlaps.

**Result:** PASS

## Criterion 6 — Graceful missing dependency behavior

**Checked:** Ran dependency check independently.

**Evidence:**

```text
venv_align/Scripts/python alignment_engine/ctc_forced_align.py --check-deps; echo EXIT:$?
CTC dependency check failed gracefully: Missing optional dependency 'ctc_forced_aligner'. Install the optional CTC aligner with: pip install git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git
EXIT:2
```

Exit 2 is expected while `ctc_forced_aligner` is absent.

**Result:** PASS

## Criterion 7 — Synthetic/no-model tests cover conversion, diagnostics, cardinality, no-overwrite, API shape

**Checked:** Ran unittest discovery.

**Evidence:**

```text
venv_align/Scripts/python -m unittest discover -s tests -p "test_ctc_forced_align.py"
.........
----------------------------------------------------------------------
Ran 9 tests in 0.928s

OK
```

The current suite includes the added `test_run_ctc_alignment_uses_public_api_shape`, covering the documented CTC API orchestration shape.

**Result:** PASS

## Invariant checks

- **No overwrite of `karaoke_player/timing.json`:** checked timestamp after verification:

```text
2026-05-07 13:37:29.277280500 +0100 karaoke_player/timing.json
```

- **No STARS implementation/call:** searched CTC module/tests:

```text
rg -n "STARS|run_stars|stars_" alignment_engine/ctc_forced_align.py tests/test_ctc_forced_align.py
alignment_engine/ctc_forced_align.py:650:                "until visual/audio review passes; STARS refinement is intentionally not used here."
```

Only a metadata note mentions STARS; no import/call/refinement code is present.

- **No real model download/inference:** verification used pure tests and `--check-deps`; optional package remains absent.

## Final verdict

All plan success criteria and stated invariants are satisfied for the CTC-only implementation milestone. Real CTC model inference remains a future environment/setup step after installing the optional aligner.

VERDICT: PASS
