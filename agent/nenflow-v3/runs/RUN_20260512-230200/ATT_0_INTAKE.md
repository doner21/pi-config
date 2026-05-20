---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260512-230200
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~6%"
context_handoff_threshold_percent: 40
context_handoff_threshold_source: user_prompt
---

# ATT_0 — INTAKE

## Task Summary
Fix vocal stem separator splitting errors in KaraokeBox. The project was cloned from a machine with an NVIDIA GPU (username: `donald clark`) to a new machine with an AMD GPU. The hybrid real splitter (audio-separator) and UVR MDX splitter fail with errors when running on CPU, and GPU mode is non-functional due to AMD vs. NVIDIA mismatch. The goal is to make the splitters work correctly on the current machine.

## Task Type
Bug fix / environment portability — a codebase developed on one machine (NVIDIA GPU, specific user paths) now runs on a different machine (AMD GPU, different user) and splitter subprocesses fail.

## User Intent
The user wants the vocal stem separation pipelines to produce output (vocals + instrumental) successfully on their current machine. CPU mode should work as a reliable fallback. GPU mode on AMD should either work or gracefully degrade to CPU. The user explicitly stated: "The intention here is to fix the splitting error that's happening."

## Goal Attractor
The splitters run without errors and produce valid separated audio files (vocals.mp3 / band/instrumental.mp3) on the current machine. CPU mode is the primary target since AMD GPU CUDA is not available. The Demucs adapter (`htdemucs`, `mdx_extra`) and UVR-MDX-NET adapter both work end-to-end through CPU processing.

## Constraints (Hard Limits)
1. **Do not require NVIDIA CUDA** — the machine has an AMD GPU. The code must not hard-depend on CUDA availability.
2. **FFmpeg must be discoverable** — currently hardcoded to `C:\Users\donald clark\AppData\Roaming\Youka Desktop\youka\data\binaries\ffmpeg`. The npm package `ffmpeg-static` is installed and should be used as the FFmpeg source.
3. **Python venv must be respected** — all Python subprocess calls must route through `venv/Scripts/python.exe` (already done).
4. **Existing API contracts must remain** — the Express routes in `server/splitter/index.js` and the adapter interfaces (`checkHealth()`, `separate()`) must not change shape.
5. **All existing models must remain selectable** — Demucs models (htdemucs, mdx_extra, etc.) and UVR-MDX-NET models must both be available after the fix.

## Invariants (Must Not Break)
1. The frontend splitter UI must still submit jobs and receive status/progress correctly.
2. The Demucs adapter (which may already work) must not be regressed.
3. Job queueing, cancellation, and download routes must continue to function.
4. The `.env` configuration file must not require new mandatory fields.
5. The database schema and artifact storage must not be altered.

## Success Criteria
1. **SC-1**: `server/splitter/index.js` init reports at least one AI splitter as healthy (Demucs or UVR-MDX-NET).
2. **SC-2**: Submitting a 2-stem split job with `modelId: 'htdemucs'` and `device: 'cpu'` completes without error and produces `vocals.mp3` and `no_vocals.mp3`.
3. **SC-3**: Submitting a 2-stem split job with `modelId: 'uvr-mdx-inst-main'` (or similar UVR model) and default device completes without error and produces vocal + instrumental files.
4. **SC-4**: The `checkHealth()` method on the audio-separator/adapter reports availability correctly.
5. **SC-5**: The FFmpeg binary resolves from the installed `ffmpeg-static` npm package, not from a hardcoded user-specific path.
6. **SC-6**: GPU-related errors do NOT crash the splitter — instead, the system gracefully falls back to CPU with a logged warning.
7. **SC-7**: After fixes, running `npm run clean-start` launches the app and the splitter endpoints respond correctly.

## Ambiguities
1. **What exact error is produced?** The user says "I'm getting an error" but hasn't pasted the specific error output. The Researcher must inspect logs (`latest_error.txt`, `server_crash_log.txt`, `build_log.txt`, `server_stdout.txt`) to identify the exact failure mode.
2. **Does Demucs already work on CPU?** The user only mentions the "hybrid real splitter" and "UVR MDX splitter" as failing. Demucs may already work. The Researcher must test Demucs health and separate independently.
3. **Is the `venv` fully functional for all adapters?** The Researcher must verify `python -m demucs` and `audio-separator` CLI both work from the venv.
4. **FFmpeg-static resolution** — The Researcher must determine how to resolve the `ffmpeg-static` npm package path programmatically in the adapters.
5. **Does `audio-separator` need FFmpeg in PATH?** The adapters add a hardcoded path to env.PATH. The Researcher must verify whether `ffmpeg-static` resolution works for the spawned child processes.

## Routing Decision
→ **RESEARCH** recommended. Several unknowns about the exact error condition, FFmpeg path resolution, and adapter health need investigation before a Plan can be written. The codebase was developed on a different machine with different hardware and hardcoded paths; systematic discovery is required.
