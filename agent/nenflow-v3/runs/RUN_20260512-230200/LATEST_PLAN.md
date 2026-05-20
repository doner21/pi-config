---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260512-230200
context_saturation_estimate: "~18%"
precedes: ATT_3_EXECUTION
---

# ATT_2 — PLAN

## Task Statement

Fix the vocal stem separator in KaraokeBox so it works on the current machine (AMD GPU, Windows, user doner). Three compound bugs prevent all AI splitters from working: (a) the Python venv has zero ML dependencies installed, (b) initSplitterService() crashes on undeclared health variable before reaching Mock fallback, and (c) seven files hardcode FFmpeg to a path from a different user's machine. After fixes, Demucs (htdemucs) and UVR-MDX-NET splitters must complete end-to-end on CPU and produce valid vocals.mp3 + instrumentals.

---

## Invariants (Must Not Break)

1. **Frontend splitter UI** — must still submit jobs via POST /split/start and poll GET /split/status/:jobId without changes.
2. **Demucs adapter interface** — checkHealth() and separate() signatures must not change (only internal FFmpeg path resolution changes).
3. **UVR-MDX-NET adapter interface** — same as above.
4. **Job queueing/cancellation/download routes** — server/splitter/queue.js and Express routes in index.js must continue to function.
5. **.env file** — must not require new mandatory fields.
6. **Database schema and artifact storage** — must not be altered (only fix the updated_at param bug in existing statements, not the schema).
7. **Existing model selection** — all Demucs and UVR models must remain selectable.
8. **Mock fallback** — must still serve as final fallback if no real engine is available.

---

## Success Criteria

| # | Criterion | How to Verify |
|---|-----------|--------------|
| SC-1 | initSplitterService() completes without crash and reports at least ONE AI splitter as healthy | Check server startup logs for Demucs: true or UVR-MDX-NET: true |
| SC-2 | DemucsAdapter.checkHealth() returns { available: true } | Observe startup log |
| SC-3 | UVRMDXNetAdapter.checkHealth() returns { available: true } | Observe startup log |
| SC-4 | htdemucs 2-stem CPU split produces vocals.mp3 + no_vocals.mp3 | POST /split/start, poll until done, verify files on disk |
| SC-5 | uvr-mdx-inst-main 2-stem split produces vocal + instrumental files | Same as SC-4 with UVR model |
| SC-6 | No hardcoded FFmpeg paths remain in code | grep -rn "donald clark" server/ electron/ returns zero matches |
| SC-7 | npm run clean-start launches app and splitter endpoints respond | Run clean-start, check logs for SplitterService init |
| SC-8 | GPU errors do not crash splitter; graceful CPU fallback with warning | Submit split with device: gpu, expect warning log, no crash |
| SC-9 | updated_at RangeError fixed in cancel() path | Cancel a job via endpoint, verify no updated_at errors in logs |

---

## Implementation Steps

### Phase 1: Install Python Dependencies (BLOCKER for all AI adapters)

**Step 1.1** — Install demucs into the project venv:

```powershell
cd C:/Users/doner/kraokebox_song_generator
.\venv\Scripts\python.exe -m pip install demucs
```
This pulls: torch, torchaudio, numpy, soundfile. Expect ~2-5 min, ~3-5 GB disk.

**Step 1.2** — Install audio-separator into the project venv:

```powershell
.\venv\Scripts\python.exe -m pip install audio-separator
```
This pulls: onnxruntime, librosa.

**Step 1.3** — Verify both packages import correctly:

```powershell
.\venv\Scripts\python.exe -c "import demucs; print('demucs OK')"
.\venv\Scripts\python.exe -c "import audio_separator; print('audio-separator OK')"
.\venv\Scripts\python.exe -c "import torch; print('torch', torch.__version__, 'CUDA:', torch.cuda.is_available())"
```
Expected: all three print OK. Torch CUDA prints False (AMD GPU, expected).

**Step 1.4** — Create requirements.txt at project root for future reproducibility:

```
demucs
audio-separator
```

### Phase 2: Fix ReferenceError: health is not defined in initSplitterService()

**File**: server/splitter/index.js

**Step 2.1** — At line 57 (before the // Fallback to FFmpeg section), replace:

```js
    // OLD (line 57):
    health = await ffmpegSplit.checkHealth();

    // NEW:
    let health;
    health = await ffmpegSplit.checkHealth();
```

The single let health; at this scope covers both the FFmpeg fallback (line 59) and the audio-separator fallback (line 71). ESM strict mode forbids assignment to undeclared variables — this single fix stops both ReferenceErrors.

### Phase 3: Replace Hardcoded FFmpeg Paths with ffmpeg-static

ffmpeg-static npm package is already installed and resolves to:
```
C:/Users/doner/kraokebox_song_generator/node_modules/ffmpeg-static/ffmpeg.exe
```
The pattern for all 7 files:
- **Import**: import ffmpegPath from 'ffmpeg-static';
- **For PATH injection**: path.dirname(ffmpegPath) — needed by adapters spawning child processes
- **For direct spawn**: ffmpegPath — use the path directly

#### File 3.1: server/splitter/demucs-adapter.js
Add after existing imports: import ffmpegPath from 'ffmpeg-static';
Replace lines 13-14 (FFMPEG_DIR + FFMPEG_PATH) with:
  const FFMPEG_PATH = ffmpegPath;
  const FFMPEG_DIR = path.dirname(ffmpegPath);

#### File 3.2: server/splitter/uvr-mdx-net-adapter.js
Add after existing imports: import ffmpegPath from 'ffmpeg-static';
Replace lines 13-14 (FFMPEG_DIR + FFMPEG_PATH) with same pattern as File 3.1.

#### File 3.3: server/splitter/audio-separator-adapter.js
Add after existing imports: import ffmpegPath from 'ffmpeg-static';
Replace line 12 (FFMPEG_DIR) with: const FFMPEG_DIR = path.dirname(ffmpegPath);

#### File 3.4: server/splitter/ffmpeg-splitter-adapter.js
Add after existing imports: import ffmpegPath from 'ffmpeg-static';
Replace line 10 (FFMPEG_PATH) with: const FFMPEG_PATH = ffmpegPath;

#### File 3.5: server/downloader/adapters/yt-dlp.js
Add at top (after existing imports):
  import path from 'path';
  import ffmpegPath from 'ffmpeg-static';
Add module-level const: const ffmpegDir = path.dirname(ffmpegPath);
Remove line 98: const ffmpegDir = 'C:\Users\donald clark\...';

#### File 3.6: electron/main.js
**RISK**: Electron main process may resolve modules differently.
Primary approach: Add after existing imports: import ffmpegPath from 'ffmpeg-static';
Replace line 139 (FFMPEG_PATH) with: const FFMPEG_PATH = ffmpegPath;
If import fails in Electron, use fallback:
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  const ffmpegPath = require('ffmpeg-static');
  const FFMPEG_PATH = ffmpegPath;

#### File 3.7: server/services/exportService.js
Add after line 8 (after import { promisify }): import ffmpegPath from 'ffmpeg-static';
Replace line 15 (FFMPEG_PATH) with: const FFMPEG_PATH = ffmpegPath;

### Phase 4: Fix updated_at Column Bugs

**Step 4.1 — File: server/splitter/queue.js**
In the cancel() method (lines 158-168), the updateState.run() call is missing updated_at. Add the missing field:

```js
JobMgr.stmts.updateState.run({
    id: jobId,
    state: 'canceled',
    completed_at: Date.now(),
    error_json: null,
    result_json: null,
    params_json: null,
    updated_at: Date.now()     // ADD THIS LINE
});
```

**Step 4.2 — Verify JobMgr.fail() in server/orchestrator/index.js**
Code inspection shows fail() already has updated_at: Date.now() at line 288. Executor should confirm and only fix if a discrepancy is found.

### Phase 5: Hard-Default Device to CPU + GPU Warning

POST /split/start already defaults device to cpu (index.js line 161). DemucsAdapter.separate() already defaults device to cpu (line 50). No default change needed.

**Step 5.1 — File: server/splitter/demucs-adapter.js**
After the deviceFlag computation (~line 92), add a GPU warning log:

```js
const deviceFlag = device === 'gpu' ? 'cuda' : 'cpu';
// ADD after above line:
if (device === 'gpu') {
    console.warn('[Demucs] GPU mode requested but CUDA may be unavailable on this machine.');
    onProgress(0.01, 'GPU mode requested (CUDA may be unavailable on this machine)');
}
```

Note: UVR-MDX-NET adapter uses audio-separator which auto-detects device. No explicit GPU flag needed. AMD GPU has no CUDA support on Windows PyTorch, so CPU is the only path.

### Phase 6: Verification Tests

Run each test in order. Stop and fix before proceeding if any fails.

**Test 6.1 — Venv health (no server needed):**
```powershell
cd C:/Users/doner/kraokebox_song_generator
.\venv\Scripts\python.exe -c "import demucs; print('demucs OK')"
.\venv\Scripts\python.exe -c "import audio_separator; print('audio-separator OK')"
.\venv\Scripts\python.exe -c "import torch; print('torch', torch.__version__, 'CUDA:', torch.cuda.is_available())"
```
Expected: all three print OK. CUDA: False.

**Test 6.2 — FFmpeg resolution (no server needed):**
```powershell
node -e "const f=require('ffmpeg-static'); console.log('exists:', require('fs').existsSync(f))"
```
Expected: exists: true.

**Test 6.3 — No hardcoded paths remain:**
```powershell
grep -rn "donald clark" server/ electron/ --include="*.js"
```
Expected: zero matches.

**Test 6.4 — Server startup with splitter init:**
```powershell
node server/index.js
```
Check logs for:
  [SplitterService] Adapter Availability:
    - Demucs: true
    - UVR-MDX-NET: true
  [SplitterService] Active Adapter: Smart Router
No ReferenceError, no crash.

**Test 6.5 — E2E Demucs split (htdemucs, 2-stem, cpu):**
If no test audio exists, generate one:
```powershell
.\venv\Scripts\python.exe -c "import wave,struct,math; w=wave.open('test_audio.wav','w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100); [w.writeframes(struct.pack('<hh',int(8000*math.sin(2*math.pi*440*i/44100)),)*2) for i in range(44100*10)]; w.close(); print('test_audio.wav created')"
```
Submit split:
```powershell
curl -X POST http://localhost:3000/split/start -H "Content-Type: application/json" -d '{"source":{"inputPath":"C:/Users/doner/kraokebox_song_generator/test_audio.wav"},"modelId":"htdemucs","stems":2,"device":"cpu"}'
```
Poll status until state: done. Verify vocals.mp3 and no_vocals.mp3 exist on disk.

**Test 6.6 — E2E UVR-MDX-NET split:**
```powershell
curl -X POST http://localhost:3000/split/start -H "Content-Type: application/json" -d '{"source":{"inputPath":"C:/Users/doner/kraokebox_song_generator/test_audio.wav"},"modelId":"uvr-mdx-inst-main","stems":2,"device":"cpu"}'
```
Poll status until done. Verify vocal + instrumental files exist.

---

## Handoff Notes

### Critical Context for Executor

1. **ORDER MATTERS**: Phase 1 (pip installs) MUST come first. It takes 5-10 minutes. Other phases cannot be verified without it. Phase 2 and Phase 3 can be done in any order after Phase 1, but both are needed before testing.

2. **Compound bugs**: Even after venv deps are installed, initSplitterService() still crashes at line 59 with ReferenceError until Phase 2 is applied. Both Phase 1 AND Phase 2 must be fixed for any AI adapter to work. The Mock fallback is never reached because the crash happens before it.

3. **FFmpeg PATH injection is critical**: Demucs, UVR, and AudioSeparator adapters inject FFMPEG_DIR into process.env.PATH for spawned child processes. This MUST be path.dirname(ffmpegPath), NOT the full .exe path. If only the .exe path is used, spawned child processes cannot locate ffmpeg.exe because PATH expects directories.

4. **electron/main.js is the riskiest file**: Electron main process module resolution may differ from the server. If import ffmpegPath from 'ffmpeg-static' fails, use the createRequire fallback documented in Phase 3.6. The Executor should test this file separately.

5. **Test audio file**: The Executor will need a real audio file for E2E testing. If none exists in the project, generate a 10-second 440Hz sine wave WAV using the Python command in Test 6.5.

6. **Disk space**: pip install demucs pulls PyTorch (~2.5 GB). Ensure at least 5 GB free on the drive before starting Phase 1.

7. **Time estimate**: Phase 1: 5-10 min. Phases 2-5: ~15 min. Phase 6: 5-10 min plus 2-5 min per Demucs split run. Total: ~30-60 minutes.

8. **AMD GPU awareness**: torch.cuda.is_available() returns False on this machine. ROCm is unsupported on Windows PyTorch. All GPU code paths should trigger graceful fallback to CPU. This is already the default behavior; the GPU warning log added in Phase 5 provides visibility.

### File Paths Summary

| File | Change |
|------|--------|
| server/splitter/index.js | Add let health; before line 57 |
| server/splitter/demucs-adapter.js | Import ffmpeg-static, replace FFMPEG_DIR/PATH, add GPU warning |
| server/splitter/uvr-mdx-net-adapter.js | Import ffmpeg-static, replace FFMPEG_DIR/PATH |
| server/splitter/audio-separator-adapter.js | Import ffmpeg-static, replace FFMPEG_DIR |
| server/splitter/ffmpeg-splitter-adapter.js | Import ffmpeg-static, replace FFMPEG_PATH |
| server/downloader/adapters/yt-dlp.js | Import ffmpeg-static + path module-level, replace ffmpegDir |
| electron/main.js | Import ffmpeg-static (with createRequire fallback), replace FFMPEG_PATH |
| server/services/exportService.js | Import ffmpeg-static, replace FFMPEG_PATH |
| server/splitter/queue.js | Add updated_at: Date.now() to cancel() updateState.run() |
| (new) requirements.txt | Create with demucs + audio-separator |

### Things the Executor MUST NOT Do

- Do NOT modify database schema (no ALTER TABLE, no new migrations)
- Do NOT change API route signatures (POST /split/start, GET /split/status/:jobId, etc.)
- Do NOT remove the MockSplitterAdapter fallback
- Do NOT change model selection logic in frontend or adapters
- Do NOT add new required .env variables
- Do NOT upgrade or downgrade npm packages
- Do NOT modify the initSplitterService() architecture (adapter chain, health check order)

[PLANNER CONTEXT — END]
self_estimate: ~20%
