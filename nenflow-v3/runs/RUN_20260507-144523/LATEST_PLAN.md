---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260507-144523
context_saturation_estimate: "~8%"
---

## Task Statement

Implement Milestone 1 only: a CTC coarse full-song forced-alignment pipeline that converts known lyrics + vocal WAV into a reviewable karaoke timing candidate at `karaoke_player/timing_ctc_candidate.json`. Do not implement STARS refinement yet; this milestone exists to decide whether CTC is good enough as the primary coarse aligner.

## Invariants

- Executor must self-assess context at start; if estimate is `>45%` at start or rises above `45%`, stop and emit a continuation/handoff instead of continuing.
- Never overwrite `karaoke_player/timing.json` by default; default output is `karaoke_player/timing_ctc_candidate.json`.
- CTC is the only timing source for this milestone; do not call STARS or make STARS a dependency.
- Preserve lyric global order and original lyric display tokens/punctuation from `moss_audio test/starman`.
- Output karaoke schema must include `metadata` and `stanzas[].words[]` with `word`, `start`, `end`, `duration`.
- Expected Starman lyric count is 367; any mismatch must be explicit in diagnostics.
- Timestamps must be non-negative, end after start, monotonic, and bounded/reported against vocal audio duration.
- Diagnostics must include word count coverage, monotonicity, median duration, short-word ratio, local compression bursts, total coverage, suspicious gaps, and suspicious overlaps.
- Missing `ctc_forced_aligner`, model/runtime errors, or audio deps must fail gracefully with actionable guidance, not an unhandled traceback.
- Generated artifacts must live under `alignment_engine/ctc_work/`, `alignment_engine/run_logs/`, and the candidate JSON path; do not destroy prior STARS/MERT artifacts.

## Success Criteria

1. `alignment_engine/ctc_forced_align.py` exists with documented CLI and pure functions testable without loading a model.
2. Repo-root command shape works: `venv_align/Scripts/python alignment_engine/ctc_forced_align.py --audio "moss_audio test/starman_vocal_16k.wav" --lyrics "moss_audio test/starman" --output karaoke_player/timing_ctc_candidate.json --device cpu`.
3. The script writes `karaoke_player/timing_ctc_candidate.json`, raw/diagnostic artifacts under `alignment_engine/ctc_work/`, and a log under `alignment_engine/run_logs/`.
4. Candidate JSON preserves original display words/punctuation and uses karaoke-player-compatible stanza/word structure.
5. Diagnostics JSON/report contains all required metrics plus `quality_status` and failures/warnings.
6. Missing optional dependency behavior is covered by tests and emits install guidance for `git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git`.
7. Tests validate conversion, diagnostics, cardinality, no-default-overwrite behavior, and compression/gap/overlap detection using synthetic CTC output only.

## Implementation Steps

1. **Create `alignment_engine/ctc_forced_align.py`.** Keep optional/heavy imports lazy so module import succeeds when `ctc_forced_aligner` is absent. Reuse safe helpers from `alignment_engine.convert_to_timing` where useful: `load_lyrics`, `LyricToken`, `make_syllables`, `label_stanza`, `basic_stats`, `get_audio_duration`. Define default paths: `CTC_WORK_DIR = alignment_engine/ctc_work`, `RUN_LOG_DIR = alignment_engine/run_logs`, `DEFAULT_OUTPUT = karaoke_player/timing_ctc_candidate.json`.

2. **Expose testable functions.** Suggested names:
   - `CtcDependencyError(RuntimeError)`.
   - `load_ctc_api()` lazy-imports `ctc_forced_aligner`; on failure raises actionable `CtcDependencyError`.
   - `normalize_for_ctc(tokens)` builds a cardinality-preserving transcript from normalized lyric tokens.
   - `run_ctc_alignment(audio_path, transcript, *, device, language, batch_size, window_size, context_size)` calls the Python API (`load_alignment_model`, `generate_emissions`, `preprocess_text`, `get_alignments`, `get_spans`, `postprocess_results`). Prefer `soundfile`/`librosa` WAV loading to avoid ffmpeg-only paths.
   - `coerce_ctc_words(raw_result)` normalizes common CTC result shapes to `{word,start,end}`.
   - `map_ctc_words_to_lyrics(ctc_words, lyric_tokens)` maps by index, outputs lyric display `word`, `duration`, `recognized_word`/`ctc_word`, stanza `segment`, and `lyric_global_index`.
   - `detect_local_compression(words)` implements a pure sliding-window burst detector; do not import `run_stars_stanza.py`.
   - `analyze_ctc_candidate(words, *, expected_word_count, audio_duration)` returns `(quality_status, failures, metrics)`.
   - `build_ctc_timing_json(...)` builds CTC-specific karaoke JSON metadata, including research/non-commercial model-license note.
   - `run_pipeline(args) -> int` orchestrates dependencies, alignment/conversion, artifacts, and logging.

3. **CLI behavior.** Use `argparse` defaults for Starman paths, `--device cpu`, `--language eng`, `--batch-size 1`, `--window-size 30`, `--context-size 2`, and `--output karaoke_player/timing_ctc_candidate.json`. Add `--from-ctc-json PATH` for conversion/debug from saved or synthetic CTC output without importing/loading the model. Add `--check-deps`. Do not add a default write path to `timing.json`; any future promotion must be explicit and opt-in.

4. **Artifact writing.** Create output directories. Write raw CTC to `alignment_engine/ctc_work/ctc_raw_<timestamp>.json`, diagnostics to `alignment_engine/ctc_work/ctc_diagnostics_<timestamp>.json`, and run log to `alignment_engine/run_logs/ctc_forced_align_<timestamp>.log`. Always write the candidate to `--output`; default must be `karaoke_player/timing_ctc_candidate.json`.

5. **Diagnostics details.** Metrics must include: `expected_word_count`, `actual_word_count`, `word_count_coverage`, `monotonic`/`non_monotonic_count`, duration stats with median, `short_word_ratio` for `<=0.08s`, `local_compression.localized_burst_count`, `total_coverage` with min/max timestamps, suspicious gaps (e.g. `>2.0s`), suspicious overlaps (e.g. `>0.02s`), `out_of_bounds_count`, and `negative_or_zero_duration_count`.

6. **Add `tests/test_ctc_forced_align.py`.** Use stdlib `unittest` unless executor confirms pytest is available. Synthetic/no-model tests must cover: import without `ctc_forced_aligner`; actionable missing dependency; Starman cardinality 367; punctuation/display preservation; synthetic 367-span conversion to karaoke schema; diagnostics detecting non-monotonicity, short durations, local compression, low count coverage, low total coverage, gaps, and overlaps; default output path is candidate and not `timing.json`; `--from-ctc-json` converts without importing/loading CTC package.

7. **Validation commands.** From `C:/Users/doner/moss_audio` run:
   - `venv_align/Scripts/python -m py_compile alignment_engine/ctc_forced_align.py tests/test_ctc_forced_align.py`
   - `venv_align/Scripts/python -m unittest discover -s tests -p "test_ctc_forced_align.py"`
   - Optional: `venv_align/Scripts/python alignment_engine/ctc_forced_align.py --check-deps` (expected graceful failure if package absent).
   - Do not run real model download/inference unless explicitly approved or already available.

## Handoff Notes

- `alignment_engine/convert_to_timing.py` has useful lyric/karaoke helpers, but its metadata/default output are MERT/STARS-oriented; do not copy those labels unchanged.
- `alignment_engine/diagnose_alignment.py` has global checks but lacks the full requested CTC diagnostics.
- `run_stars_stanza.assess_local_compression` shows the local-burst idea, but importing it pulls heavy deps; reimplement the pure detector in the CTC module.
- Inputs exist: `moss_audio test/starman_vocal_16k.wav` and `moss_audio test/starman`; lyrics currently contain 367 tokens across 10 stanzas.
- `ctc_forced_aligner` and its console script are currently absent in `venv_align`; graceful missing-dependency behavior is part of PASS.
- `ffmpeg` is absent from PATH, so avoid relying solely on CLI/package `load_audio`.
- Default MMS forced-aligner model has research/non-commercial license caveat; record this in metadata/logs.
