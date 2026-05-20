---
artifact_type: EXECUTION_RETRY_REPORT
role: EXECUTOR
run_id: RUN_20260507-124756
attempt: 4
status: COMPLETE
---

# ATT_4 Execution Retry: STARS full-song `clean_lyrics()` cardinality

## Summary

Fixed the verifier-reported full-song cardinality bug in `alignment_engine/run_stars_full.py::clean_lyrics()`.

The prior implementation normalized punctuation over the whole lyric string with whitespace replacement. That allowed one raw whitespace token to become multiple cleaned tokens, e.g. `la-la` -> `la la`, producing Starman raw split `367` vs cleaned split `390`.

## Changes made

- `alignment_engine/run_stars_full.py`
  - Added `_clean_lyric_token(token)` so cleaning is performed per raw whitespace token.
  - Changed punctuation normalization inside a token from whitespace replacement to deletion:
    - `la-la` -> `lala`
    - `re-entry` -> `reentry`
    - `DJ,` -> `dj`
  - Kept apostrophes/contraction behavior cardinality-preserving:
    - `weren't` remains `weren't`
    - `'n'` -> `and`
    - `'Cause` -> `because`
  - Added a fallback `_` for punctuation-only raw tokens so every raw whitespace token still yields one cleaned whitespace token.

- `tests/test_stars_alignment_engine_regressions.py`
  - Updated the phase/contraction cardinality regression to assert exact cleaned output.
  - Added whole-song Starman raw-vs-clean token cardinality test using `moss_audio test/starman`.
  - Added targeted hyphen test (`la-la`, `re-entry`) proving punctuation cannot split a token.
  - Added targeted contraction test proving rewrites remain one-token-per-raw-token.

## Validation

Commands run:

```text
python -m py_compile alignment_engine/run_stars_stanza.py alignment_engine/run_stars_full.py tests/test_stars_alignment_engine_regressions.py
```

Result: PASS, no output.

```text
python -m pytest tests/test_stars_alignment_engine_regressions.py -q
```

Result: NOT RUN/PASS unavailable in this environment; Python reported `No module named pytest`.

Manual assertions were run with `g2p_en`, `librosa`, `soundfile`, and `numpy` stubbed at import time. Result:

```text
PASS clean_lyrics manual assertions; raw=clean= 367
```

Manual assertions covered:

- `That weren't no DJ, that was hazy cosmic jive` -> `that weren't no dj that was hazy cosmic jive` with equal token count.
- `La, la, la-la re-entry` -> `la la lala reentry` with equal token count.
- `Didn't rock 'n' roll, 'Cause he wasn't waitin'` -> expected one-token contraction rewrites with equal token count.
- Full checked-in Starman lyrics: raw split `367`, cleaned split `367`.

## Notes

No STARS model inference was run. The fix is deterministic preprocessing only and directly targets the failed verifier invariant.
