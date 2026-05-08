---
artifact_type: VERIFICATION_REPORT
role: VERIFIER
run_id: RUN_20260507-124756
verdict: PASS
---

# ATT_5 Verification: STARS `phase` Compression Fix Retry

## Verdict: PASS

The ATT_3 FAIL is fixed. `alignment_engine/run_stars_full.py::clean_lyrics()` now preserves one cleaned token per raw whitespace token for the checked-in full Starman lyrics, including hyphenated tokens. The core stanza-path invariants also remain satisfied by direct manual assertions: stale pass-1 cache rejection, localized compression detection, overlong segment splitting without silent clipping, and token cardinality.

## Commands run

- `python -m py_compile alignment_engine/run_stars_stanza.py alignment_engine/run_stars_full.py tests/test_stars_alignment_engine_regressions.py`
  - PASS; no output.
- `python -m pytest tests/test_stars_alignment_engine_regressions.py -q`
  - NOT RUN; environment lacks pytest: `No module named pytest`.
- Manual Python assertions with `g2p_en`, `librosa`, `soundfile`, and `numpy` stubbed.
  - PASS; output ended with `ALL MANUAL ASSERTIONS PASSED`.

## Direct evidence

### 1. Previous FAIL fixed: whole-song `clean_lyrics()` cardinality

Production evidence:

- `alignment_engine/run_stars_full.py:58` defines per-token `_clean_lyric_token(token)`.
- `alignment_engine/run_stars_full.py:67` removes punctuation inside one raw token with `re.sub(r"[^\w']+", "", cleaned)`, so punctuation such as hyphens is deleted instead of replaced by whitespace.
- `alignment_engine/run_stars_full.py:71` joins exactly one cleaned token for each `text.split()` token.

Manual assertions observed:

```text
PASS clean_lyrics phase phrase; raw=clean=9; that weren't no dj that was hazy cosmic jive
PASS clean_lyrics hyphen tokens; raw=clean=4; la la lala reentry
PASS clean_lyrics contractions; raw=clean=8; didn't rock and roll because he wasn't waitin'
PASS clean_lyrics punct-only fallback; raw=clean=3; hello _ world
PASS full Starman clean_lyrics cardinality; raw=clean= 367
```

Regression coverage exists in `tests/test_stars_alignment_engine_regressions.py:192`, `:206`, and `:218`.

### 2. Stale pass-1 cache rejection remains fixed

Production evidence:

- `alignment_engine/run_stars_stanza.py:459` checks cached timing identity/order via `timing_words_match_lyrics()`.
- `alignment_engine/run_stars_stanza.py:462` checks cached timing local quality via `assess_local_compression()` before reuse.

Manual assertions observed:

```text
PASS stale same-count cache rejected; calls= 1
PASS compressed same-word cache rejected; calls= 1
```

Regression coverage exists in `tests/test_stars_alignment_engine_regressions.py:71` and `:104`.

### 3. Local compression detection remains fixed

Production evidence:

- `alignment_engine/run_stars_stanza.py:173` implements local sliding-window compression detection.
- `alignment_engine/run_stars_stanza.py:1016` applies the local quality gate to merged timing output.

Manual assertions against checked-in artifacts observed:

```text
PASS current timing compression detected; {'word_count': 9, 'single_frame_count': 5, 'short_word_count': 9, 'short_word_ratio': 1.0, 'median_duration': 0.016, 'localized_burst_count': 5}
PASS raw STARS segment compression detected; {'word_count': 9, 'single_frame_count': 5, 'short_word_count': 9, 'short_word_ratio': 1.0, 'median_duration': 0.016, 'localized_burst_count': 5}
```

Regression coverage exists in `tests/test_stars_alignment_engine_regressions.py:230` and `:254`.

### 4. Overlong stanza segments are split, not silently clipped

Production evidence:

- `alignment_engine/run_stars_stanza.py:631` splits overlong word ranges by safe windows before segment creation.
- `alignment_engine/run_stars_stanza.py:691-728` marks coverage status and preserves assigned word coverage, warning rather than silently clipping when impossible.

Manual assertion observed:

```text
PASS overlong segment split/coverage; [(0.0, 41.5, [0, 1, 2, 3, 4, 5, 6], 'covered', 'overlong_cluster_split_1_of_2'), (38.5, 59.5, [7, 8, 9], 'covered', 'overlong_cluster_split_2_of_2')]
```

Regression coverage exists in `tests/test_stars_alignment_engine_regressions.py:139`.

### 5. Token cardinality invariant

Manual assertions verified one-cleaned-token-per-raw-token for:

- the original `phase` contraction phrase,
- hyphenated words (`la-la`, `re-entry`),
- contraction rewrites (`'n'`, `'Cause`),
- punctuation-only fallback tokens,
- full checked-in Starman lyrics (`367` raw tokens and `367` cleaned tokens).

## Residual risks

- `pytest` is not installed in this environment, so the pytest regression suite could not be executed directly.
- No full STARS model inference was run; verification covered deterministic preprocessing, segmentation, cache-gating, and artifact-inspection logic only.
- The historical bad `karaoke_player/timing.json` remains present, but the local quality gate detects its post-`phase` compression and rejects it as a pass-1 seed.

## Recommendations

1. Install pytest in the verification environment and run `python -m pytest tests/test_stars_alignment_engine_regressions.py -q` before final release.
2. Keep the whole-song Starman cardinality test as a guard against future punctuation-normalization regressions.
