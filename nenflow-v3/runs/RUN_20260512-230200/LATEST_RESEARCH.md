---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260512-230200
precedes: ATT_2_PLAN
context_saturation_estimate: "~28%"
next: PLAN
---

# ATT_1 — RESEARCH

## Investigation Scope
Per INTAKE items 1-11: error logs, venv tools, adapters, ffmpeg-static, hardcoded paths, GPU, job flow, electron main.js.

---

## 1. Error Log Analysis

### 1.1 fatal_error.txt (CURRENT ACTIVE)
"Splitter processor not initialized (no adapter set)" at queue.js:35.
Queue.processor is null because initSplitterService() crashes before setting it.

### 1.2 latest_error.txt (old machine)
SqliteError: no such column: logs_json. DB migration mismatch. Not current failure.

### 1.3 server_stdout.txt (old machine)
Demucs worked on CPU with htdemucs. All paths: C:Usersdonald clark...

### 1.4 Other logs
- server_crash_log.txt: yt-dlp TypeError (download, not splitter)
- server_startup_error.txt: SyntaxError in alignment/job-queue.js
- server_stderr.txt: Benign Canonicalizer message

---

## 2. Python Venv Status

### Venv contents: ONLY pip 26.1.1
No torch, demucs, audio-separator, numpy, onnxruntime, soundfile.

### Tests all FAIL
- python -m demucs --help => No module named demucs
- import audio_separator => ModuleNotFoundError
- import torch => ModuleNotFoundError

### No requirements.txt
README says: pip install demucs audio-separator. Never executed here.

### Adapter Health Checks
| Adapter | Result | Why |
|---|---|---|
| DemucsAdapter | FAIL | demucs not installed |
| UVRMDXNetAdapter | FAIL | audio_separator not installed |
| AudioSeparatorAdapter | FAIL | audio_separator not installed |
| FFmpegSplitterAdapter | FAIL | hardcoded path invalid |
| MockSplitterAdapter | PASS | no deps needed |

---

## 3. Root Cause: "Splitter processor not initialized"

### initSplitterService() flow (index.js)
1. Demucs + UVR => both fail (no Python deps)
2. FFmpeg (line 59): health = await ... => UNDECLARED VARIABLE
3. audio-separator (line 71): health = await ... => UNDECLARED VARIABLE
4. Mock fallback (lines 83-90) — NEVER REACHED

### ESM strict mode ReferenceError
health = await ffmpegSplit.checkHealth(); // ReferenceError: health is not defined

Caller catches via .catch() but processor stays null. Any split job sees "no adapter set".

### Fix
Add let health; before line 59, or skip FFmpeg/audio-separator blocks and go to Mock directly.

---

## 4. Hardcoded FFmpeg Path

Path: C:Usersdonald clarkAppDataRoamingYouka Desktopyoukadatainariesfmpeg

### 7 production files affected
| File | Usage |
|---|---|
| server/splitter/demucs-adapter.js | FFMPEG_DIR, FFMPEG_PATH |
| server/splitter/audio-separator-adapter.js | FFMPEG_DIR |
| server/splitter/uvr-mdx-net-adapter.js | FFMPEG_DIR, FFMPEG_PATH |
| server/splitter/ffmpeg-splitter-adapter.js | FFMPEG_PATH |
| server/downloader/adapters/yt-dlp.js | ffmpegDir local |
| electron/main.js | FFMPEG_PATH (7+ spawn calls) |
| server/services/exportService.js | FFMPEG_PATH |

### ffmpeg-static IS available
require(ffmpeg-static) => node_modules/ffmpeg-static/ffmpeg.exe (exists).
waveform.js already uses this correctly.

### Fix
Replace all with: import ffmpegPath from ffmpeg-static
PATH injection: path.dirname(ffmpegPath)

---

## 5. GPU Status
- torch not installed, cannot probe CUDA
- AMD GPU => CUDA never available. ROCm unsupported on Windows PyTorch.
- Electron GPU export pipeline separate, also uses hardcoded FFmpeg path.

---

## 6. Adapter Details

**DemucsAdapter**: FFmpeg WAV convert => spawn python -m demucs. Requires: demucs (pulls torch, torchaudio, numpy, soundfile).

**UVRMDXNetAdapter**: FFmpeg WAV convert => spawn audio-separator.exe. Requires: audio-separator (pulls onnxruntime, torch, librosa). ONNX models auto-download.

**AudioSeparatorAdapter**: spawn python -m audio_separator.separator. Requires: audio-separator.

**FFmpegSplitterAdapter**: Phase-inversion, no ML. Requires: FFmpeg binary.

**MockSplitterAdapter**: Always healthy. No deps.

---

## 7. Job Queue Flow

SplitterQueue (queue.js) => registers split processor with JobMgr.
processSplit(job) => this.processor(jobContext, onProgress).
Processor set by initSplitterService() in index.js.

Error handling: JobMgr.fail() has secondary bug — missing updated_at column (RangeError).

Init timing: 5-second setTimeout. Jobs before init see null processor.

---

## 8. Key Evidence Summary

| # | Finding | Severity |
|---|---|---|
| 1 | Python venv empty | CRITICAL |
| 2 | Undeclared health variable => ReferenceError | CRITICAL |
| 3 | Hardcoded FFmpeg path (7 files) | HIGH |
| 4 | ffmpeg-static available | INFO |
| 5 | No requirements.txt | MEDIUM |
| 6 | AMD GPU — no CUDA | INFO |
| 7 | JobMgr.fail() updated_at bug | MEDIUM |

---

## 9. Success Criteria Status

| SC | Status | Blocker |
|---|---|---|
| SC-1: AI splitter healthy | FAIL | venv empty + health ReferenceError |
| SC-2: htdemucs+cpu works | FAIL | demucs not installed |
| SC-3: UVR model works | FAIL | audio-separator not installed |
| SC-4: checkHealth() correct | FAIL | Reports false (missing deps) |
| SC-5: FFmpeg from ffmpeg-static | FAIL | 7 files use hardcoded path |
| SC-6: GPU->CPU fallback | N/A | Cannot test |
| SC-7: clean-start works | PARTIAL | Server starts, splitter init crashes |

---

## 10. Ambiguity Resolution

1. **Exact error**: Two bugs compound — (a) ReferenceError at index.js:59 crashes init, (b) "processor not initialized" when job arrives. Empty venv forces fallback path hitting undeclared variable.

2. **Demucs CPU**: Cannot test (not installed). Old logs prove it worked (~2-3 min/song).

3. **Venv functional?**: No. Only pip installed.

4. **ffmpeg-static**: Returns full path to node_modules/ffmpeg-static/ffmpeg.exe. Directory via path.dirname().

5. **audio-separator needs FFmpeg in PATH?**: Yes for MP3. Using ffmpeg-static directory works identically.

---

## Handoff Notes to Planner

1. **Venv first**: pip install demucs audio-separator. Blocker for all AI adapters.

2. **Two compound bugs**: Fix either to stop crash, fix both for correctness:
   - Bug A: Undeclared health at index.js:59,71
   - Bug B: Empty venv

3. **FFmpeg fix**: import ffmpegPath from ffmpeg-static in all 7 files. path.dirname(ffmpegPath) for PATH injection.

4. **JobMgr.fail() secondary bug**: updated_at column missing.

5. **GPU mode**: Make device: cpu the hard default. AMD GPU has no CUDA.

6. **Fix order**: (1) install venv deps, (2) fix health variable, (3) replace FFmpeg paths, (4) verify health checks, (5) test end-to-end split.
