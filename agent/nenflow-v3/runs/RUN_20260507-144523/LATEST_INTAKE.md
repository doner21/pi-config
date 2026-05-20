---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-144523
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~12%"
---

# Task Summary

Implement the next alignment milestone from `handoff.md`: use a CTC forced aligner for full-song/coarse word timing, emit a candidate karaoke timing file, and prepare STARS to remain only an optional localized refinement stage after the CTC-only candidate is evaluated.

# Task Type

Codebase implementation + test-driven validation + integration wrapper around an external CTC aligner.

# User Intent

The user wants a practical alignment architecture where one robust coarse aligner does most of the work. The current STARS-only full-song/stanza approach is known to drift and locally compress words; STARS must not be trusted as the primary full-song coarse aligner.

# Goal Attractor

A repeatable command can take:

- `moss_audio test/starman_vocal_16k.wav`
- `moss_audio test/starman`

and produce:

- `karaoke_player/timing_ctc_candidate.json`
- a CTC run log and diagnostic artifacts under `alignment_engine/run_logs/` and `alignment_engine/ctc_work/`

without overwriting `karaoke_player/timing.json` by default. The result should preserve the original lyric words/punctuation and expose diagnostics that make it clear whether CTC is good enough before any STARS local refinement is attempted.

# Project Context Studied

- Graphify was consulted first: `graphify-out/GRAPH_REPORT.md` identifies Alignment Engine Core, Conversion Timing Tools, Debug Alignment Tools, STARS, and Karaoke Player UI as the relevant communities.
- Capati registry does not currently list `C:/Users/doner/moss_audio`, so durable Capati project memory is not linked for this repo; the available Graphify brain is the main memory artifact used.
- `handoff.md` explicitly recommends CTC-only as Milestone 1 and delaying STARS refinement.
- Existing relevant files:
  - `alignment_engine/convert_to_timing.py` already has lyric parsing, karaoke-schema construction, and quality gates, but is MERT/STARS-oriented and writes `timing_candidate.json` rather than `timing_ctc_candidate.json`.
  - `alignment_engine/run_stars_stanza.py` contains local compression detection and STARS segment logic; it should not be made primary for the new full-song coarse stage.
  - `tests/test_stars_alignment_engine_regressions.py` contains deterministic regression tests for previous STARS compression hypotheses.
- Inputs are present:
  - `moss_audio test/starman_vocal_16k.wav` exists.
  - `moss_audio test/starman` exists and contains 367 whitespace lyric tokens across 10 stanzas.
- Environment facts:
  - `venv_align` has `torch`, `transformers`, `librosa`, `soundfile`, `numpy`, and related audio dependencies.
  - `ctc_forced_aligner` is not currently installed in `venv_align`.
  - `ctc-forced-aligner` console script is not currently available.
  - `ffmpeg` is not currently on PATH, so a robust implementation should avoid depending solely on the package's ffmpeg-based `load_audio` path for already-existing WAV input.
  - `pytest` is not installed in `venv_align`, so tests should be runnable without requiring new test-runner installation, or the executor should explicitly handle/install test tooling if needed.

# Web Contact / External Facts

Internet contact confirmed the current `MahmoudAshraf97/ctc-forced-aligner` README/API shape:

- Install: `pip install git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git`
- CLI: `ctc-forced-aligner --audio_path ... --text_path ... --language eng --romanize --split_size word --device cpu --batch_size ... --window_size 30 --context_size 2`
- Python API exports: `load_audio`, `load_alignment_model`, `generate_emissions`, `preprocess_text`, `get_alignments`, `get_spans`, `postprocess_results`.
- The package is BSD licensed, but its default model `MahmoudAshraf/mms-300m-1130-forced-aligner` is CC-BY-NC 4.0; treat default-model output as research/non-commercial unless licensing changes.
- Known caveat from project/user research remains: CTC is speech-oriented and not singing-validated, so diagnostics and visual evaluation are mandatory.

# Constraints

- Do not overwrite `karaoke_player/timing.json` by default.
- Milestone 1 is CTC-only; do not implement or depend on STARS local refinement until the CTC candidate is produced and evaluated.
- Preserve original lyric words/punctuation from `moss_audio test/starman` in the karaoke output wherever possible.
- Output must use the karaoke schema consumed by `karaoke_player/karaoke.html`.
- Logs/artifacts must be inspectable and written under `alignment_engine/run_logs/` and `alignment_engine/ctc_work/`.
- The implementation must gracefully fail with actionable install/runtime guidance when `ctc_forced_aligner` or model/runtime prerequisites are missing.
- Because `ffmpeg` is absent from PATH, the implementation should prefer loading the known WAV with `soundfile`/`librosa` and feeding tensors to the CTC API, instead of requiring the package CLI or package `load_audio` helper.
- Default CTC model output is research/non-commercial due to model license caveat.
- Execution phase must build tests for any implementation hypotheses, especially output conversion, diagnostics, missing dependency behavior, and original lyric cardinality.
- Executor context-health threshold from the user is stricter than the skill default: if executor self-estimate goes above 45%, it must stop and hand off/emit continuation rather than continuing.

# Invariants

- `karaoke_player/timing.json` remains untouched unless explicitly requested by the user in a later step.
- CTC coarse timing is the primary source of truth for this milestone.
- STARS is optional local refinement only and must never be allowed to make a CTC window worse.
- Word order must be monotonic and preserve lyric global order.
- Output word count should match the lyric token count, expected 367 for Starman, or diagnostics must explicitly explain the mismatch.
- Original lyric display tokens must remain one-to-one with output word entries where possible.
- Timestamps must be monotonic, non-negative, and bounded by the vocal audio duration.
- Diagnostics must include word coverage, monotonicity, median duration, short-word ratio, local compression bursts, total coverage, and suspicious gaps/overlaps.
- All generated candidate/debug artifacts must be safe to inspect and must not destroy previous STARS/MERT artifacts.

# Success Criteria

1. A new CTC pipeline entry point exists, preferably `alignment_engine/ctc_forced_align.py`, with a documented CLI.
2. The pipeline can target `moss_audio test/starman_vocal_16k.wav` and `moss_audio test/starman` and is designed to emit `karaoke_player/timing_ctc_candidate.json`.
3. The output converter preserves original lyric words/punctuation and produces the karaoke schema with `stanzas[].words[]` entries containing `word`, `start`, `end`, and `duration`.
4. Diagnostics are written under `alignment_engine/ctc_work/` and/or `alignment_engine/run_logs/` and include the metrics required in the handoff.
5. Missing `ctc_forced_aligner`, missing model dependencies, or missing ffmpeg/CLI conditions fail gracefully with actionable messages rather than stack traces.
6. Tests validate pure conversion/diagnostic behavior without needing a full model download, including a synthetic CTC result that maps to the original lyric schema and catches local compression/monotonicity problems.
7. No default path overwrites `karaoke_player/timing.json`.

# Ambiguities Resolved

- Input files are present and the lyric count is 367; no need to ask for paths for the first milestone.
- Since `ffmpeg` is unavailable, a Python API path with `soundfile`/`librosa` audio loading is the safer implementation target than a CLI-only wrapper.
- Since `ctc_forced_aligner` is absent, code should include installation checks and tests should avoid requiring the package/model by mocking or exercising pure functions.
- Since `pytest` is absent, execution should either add/run tests with a lightweight runner path or explicitly install/use pytest if permitted by environment.
- The user requested "World contact"; current external docs have been checked and should be carried into the plan.

# Remaining Ambiguities / Risks

- Whether the model can be downloaded and run in this environment is unknown; implementation must not make model execution a precondition for passing pure tests.
- CTC quality on singing vocals is unproven; a produced candidate may still be diagnostically marked `fail` or `needs_review`.
- The exact desired future STARS window/refinement API is not yet specified; this should remain a later milestone after CTC-only evaluation.

# Routing Decision

Proceed to PLANNER. Research is sufficient for the implementation plan: local project inspection plus external CTC README/API facts resolved the main immediate ambiguities. The planner should produce a CTC-only implementation plan with testable hypotheses and explicit executor context-health instructions.
