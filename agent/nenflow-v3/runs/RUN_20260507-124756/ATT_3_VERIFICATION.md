---
artifact_type: VERIFICATION_REPORT
role: VERIFIER
run_id: RUN_20260507-124756
verdict: FAIL
---

# ATT_3 Verification: STARS `phase` Compression Fix

## Verdict: FAIL

The primary stanza-path fixes were directly verified and behave as intended for the regression mechanisms under test. However, the full-song path still does **not** preserve raw-token cardinality for the checked-in Starman lyrics, despite the new `clean_lyrics()` contract claiming cardinality preservation. Because token cardinality preservation is one of the requested invariants, verification is FAIL until that gap is fixed or the full-song path is explicitly declared out of scope.

## Commands run

- `python -m py_compile alignment_engine/run_stars_stanza.py alignment_engine/run_stars_full.py tests/test_stars_alignment_engine_regressions.py`
  - PASS; no output.
- `python -m pytest tests/test_stars_alignment_engine_regressions.py -q`
  - NOT RUN; `No module named pytest` in this environment.
- Manual Python assertions with `g2p_en`, `librosa`, `soundfile`, and `numpy` stubbed.
  - PASS for pass-1 cache rejection, local compression detection, overlong stanza splitting/coverage, and the phase contraction cardinality case.
  - FAIL for whole-song raw/clean token cardinality in `run_stars_full.clean_lyrics()`.

## Evidence verified

### 1. Pass-1 stale-cache reuse is prevented in `run_stars_stanza.py`

Manual assertion created a same-count `timing.json` with different words and patched `run_stars_segment()` to count fresh pass-1 calls.

Observed:

```text
Pass 1: Ignoring existing timing.json cache; identity/order mismatch: ...
Pass 1: Running even-split alignment...
PASS stale same-count cache rejected; calls= 1
```

A second manual assertion used the same words but locally collapsed durations.

Observed:

```text
Pass 1: Ignoring existing timing.json cache; pass1 cache: localized compression words ...
Pass 1: Running even-split alignment...
PASS compressed same-word cache rejected; calls= 1
```

This verifies identity/order and localized quality gates are active before pass-1 cache reuse.

### 2. Local compression is detected

Manual checks against both historical bad artifacts passed:

```text
PASS current timing compression detected; {'word_count': 9, 'single_frame_count': 5, 'short_word_count': 9, 'short_word_ratio': 1.0, 'median_duration': 0.016, 'localized_burst_count': 5}
PASS raw STARS segment compression detected; {'word_count': 9, 'single_frame_count': 5, 'short_word_count': 9, 'short_word_ratio': 1.0, 'median_duration': 0.016, 'localized_burst_count': 5}
```

A whole-file check of current `karaoke_player/timing.json` also reports local compression failure.

### 3. Overlong stanza segments are split instead of silently clipped

Synthetic one-stanza input spanning 0.0s-56.0s with 3.5s padding produced multiple covered segments:

```text
PASS overlong segment split/coverage; segments= [(0.0, 41.5, [0, 1, 2, 3, 4, 5, 6], 'covered'), (38.5, 59.5, [7, 8, 9], 'covered')]
```

Each emitted segment covered the estimated word span for its assigned words and preserved global word order/cardinality for the synthetic case.

### 4. Phase contraction token cardinality is fixed, but whole-song cardinality is not

The targeted phrase now passes:

```text
PASS clean cardinality; that weren't no dj that was hazy cosmic jive
```

But the full Starman lyric does not preserve raw token count through `run_stars_full.clean_lyrics()`:

```text
raw split 367 clean split 390
```

Cause: `alignment_engine/run_stars_full.py:67` removes hyphens via `re.sub(r"[^\w\s']", ' ', cleaned)`, so raw tokens such as `la-la` become two words (`la la`). This contradicts the docstring at `run_stars_full.py:58-62` and the stated one-timing-word-per-raw-lyric-word invariant.

## Residual risks

- `pytest` is not installed, so the pytest suite itself could not be executed; only equivalent manual assertions were run.
- No full STARS inference was run, per intake constraints.
- `build_stanza_segments()` still has last-resort paths that can emit warnings for impossible spans/audio-boundary cases; these are no longer silent clipping, but downstream STARS behavior for such segments remains unvalidated without inference.
- The current bad `karaoke_player/timing.json` remains in place as a historical artifact; the new stanza pass-1 gate rejects it due identity mismatch and local compression.

## Recommendations

1. Fix `run_stars_full.clean_lyrics()` so punctuation normalization cannot split one raw token into multiple cleaned tokens, or document/deprecate the full-song path as non-cardinality-preserving.
2. Add a regression test comparing `len(clean_lyrics(full_starman_text).split())` to `len(full_starman_text.split())`, not only the `weren't` phrase.
3. Install pytest or run the test suite in an environment that has pytest before accepting the fix.
