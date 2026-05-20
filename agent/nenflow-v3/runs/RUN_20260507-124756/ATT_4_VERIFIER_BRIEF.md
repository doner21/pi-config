---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-124756
attempt: 4
---

# ATT_4 Verifier Brief

## Scope to verify

Verifier failure from ATT_3 was addressed: `alignment_engine/run_stars_full.py::clean_lyrics()` no longer changes whole-song token cardinality for checked-in Starman lyrics.

## Key evidence

- `clean_lyrics()` now maps each raw whitespace token through `_clean_lyric_token()` and joins one cleaned token per raw token.
- Punctuation inside a raw token is deleted rather than replaced with whitespace, so hyphenated tokens cannot split:
  - `la-la` -> `lala`
  - `re-entry` -> `reentry`
- Apostrophes are still preserved for contractions:
  - `weren't` remains one token.
- Cardinality-preserving contraction rewrites remain one token:
  - `'n'` -> `and`
  - `'Cause` -> `because`

## Tests/assertions added

In `tests/test_stars_alignment_engine_regressions.py`:

- `test_full_song_cleaning_preserves_starman_whole_song_cardinality`
- `test_full_song_cleaning_keeps_hyphenated_tokens_single`
- `test_full_song_cleaning_keeps_cardinality_for_contractions`
- Updated `test_full_song_cleaning_preserves_raw_word_cardinality_for_alignment_mapping`

## Commands run

```text
python -m py_compile alignment_engine/run_stars_stanza.py alignment_engine/run_stars_full.py tests/test_stars_alignment_engine_regressions.py
```

PASS.

```text
python -m pytest tests/test_stars_alignment_engine_regressions.py -q
```

Could not run because `pytest` is not installed: `No module named pytest`.

Manual import/assertion script with heavy dependencies stubbed passed:

```text
PASS clean_lyrics manual assertions; raw=clean= 367
```

The manual assertions directly confirmed checked-in `moss_audio test/starman` raw split `367` and cleaned split `367`, eliminating the ATT_3 verifier mismatch (`367` vs `390`).
