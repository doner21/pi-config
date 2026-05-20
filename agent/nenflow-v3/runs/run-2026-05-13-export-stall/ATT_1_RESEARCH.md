---
artifact_type: RESEARCH
role: RESEARCHER
run_id: run-2026-05-13-export-stall
context_saturation_estimate: "~32%"
---

# ATT_1_RESEARCH — Export Stall Investigation

## Investigation Scope (from INTAKE)

1. Verify race condition in `export-finalize-streaming`
2. Linting / code quality sweep of 6 target files
3. Full GPU export pipeline trace (after 75% progress)
4. Test infrastructure assessment

---

## Key Findings

### Finding 1: Race condition CONFIRMED — exact lines match INTAKE prediction

**File**: `electron/main.js`, lines 565–583

The bug is **exactly** as the INTAKE describes. The event listener ordering is broken:

```js
// LINE 567–571: stdin.end() runs first, awaits completion
await new Promise((resolve, reject) => {
    exp.ffmpegProcess.stdin.end(() => {
        resolve();  // ← this resolves, returning control
    });
});

// LINE 574–583: 'close' listener attached AFTER stdin is done
await new Promise((resolve, reject) => {
    exp.ffmpegProcess.on('close', (code) => {  // ← NEVER FIRES if FFmpeg already exited
        if (code === 0) { resolve(); }
        else { reject(/* ... */); }
    });
    exp.ffmpegProcess.on('error', reject);
});
```

**Root cause**: When `stdin.end()` fires its callback (line 569), FFmpeg's internal write buffer has been flushed. If FFmpeg immediately processes the remaining data (common with GPU encoders like NVENC that finish fast once input ends), the `close` event fires **BEFORE** the second `await` block attaches its listener at line 575. The `close` promise never resolves → permanent hang at "Finalizing video...".

**Severity**: Blocker. The entire GPU export path is dead for any song where FFmpeg encodes the remaining frames fast enough.

### Finding 2: No timeout guards on ANY FFmpeg subprocess

**File**: `electron/main.js`  
**Affected handlers**: All 5 FFmpeg spawn sites

| Handler | Lines | Spawns | Timeout? |
|---------|-------|--------|----------|
| `probe-gpu-encoders` | 144–153 | 1 FFmpeg | No |
| `export-finalize` (CPU path) | 307–340 | FFmpeg + fallback FFmpeg | No |
| `export-finalize-streaming` (GPU) | 565–583 | FFmpeg stdin close wait | No |
| Audio mix (both paths) | 586–612 / 342–368 | 1 FFmpeg | No |
| Video+audio combine (both paths) | 616–641 / 372–398 | 1 FFmpeg | No |

**Impact**: Any FFmpeg subprocess that hangs (GPU driver crash, I/O stall, resource exhaustion) will hang the entire export permanently. A 30-second timeout with `Promise.race` would prevent this.

### Finding 3: No GPU encoder fallback in streaming path

**File**: `electron/main.js`

The **CPU path** (`export-finalize`, lines 307–340) has NVENC→libx264 fallback:
```js
if (encoder !== 'libx264') {
    console.warn(`[Export] ${encoder} failed, falling back to libx264...`);
    // ... spawns fallback FFmpeg with libx264
}
```

The **streaming path** (`export-finalize-streaming`, lines 558–585) has **no fallback**. If NVENC fails during encoding, the `close` event fires with non-zero code and the error is thrown directly — no retry with libx264. This is asymmetric and a gap.

### Finding 4: Frame retry loop has no hard cap

**File**: `src/utils/electronExport.js`, lines 244–249

```js
if (frameResult.backpressure) {
    await new Promise(r => setTimeout(r, 10));
    i--; // Retry this frame
    continue;
}
```

**Issue**: If FFmpeg crashes (process killed, GPU error) after the main process starts signaling backpressure via `export-frame-raw`, the renderer will loop indefinitely retrying the same frame. The `i--` decrement has no max retry limit, no timeout aggregator, and no error escalation.

**Risk**: Medium. In practice, FFmpeg crash would also trigger `frameResult.success === false` on the next IPC call with an error message, so it likely wouldn't loop forever. But no guard exists.

### Finding 5: WebGL context loss logged but not recovered

**File**: `src/utils/karaokeDrawerGL.js`, lines 149–155

```js
canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.error('[GL] WebGL context lost! GPU resources freed.');
});
canvas.addEventListener('webglcontextrestored', () => {
    console.log('[GL] WebGL context restored.');
});
```

The context loss listener calls `e.preventDefault()` (which enables context restoration) and logs. But there is **no recovery logic** — the restored context would need the entire WebGL pipeline re-initialized (shaders recompiled, VAOs recreated, texture re-bound). Without re-init, any subsequent `drawKaraokeFrameGL()` call would fail.

### Finding 6: `probe-gpu-encoders` ignores FFmpeg exit code

**File**: `electron/main.js`, line 145

```js
proc.on('close', (code) => {
    // FFmpeg -encoders exits with 0 on success
    resolve(stdout);  // ← resolves regardless of exit code
});
```

If `FFMPEG_PATH` is wrong or FFmpeg fails to run, the handler still resolves with empty stdout = no GPU encoders detected. Not a stall bug but masks startup issues.

### Finding 7: Zero test coverage for the export pipeline

**Files searched**: `src/**/__tests__/**`  
**Tests found**: Only 3 test files, all in `src/editor/__tests__/`:

- `jsonAdapters.test.js` — editor data adapters
- `tokenTransforms.test.js` — token transformation logic  
- `undoStack.test.js` — undo/redo stack

**Not tested**: `electron/main.js`, `electronExport.js`, `karaokeDrawerGL.js`, `gpuCapabilities.js`, `fastExport.js`, `useKaraokeExport.js`. The export pipeline (both CPU and GPU paths) has **zero automated test coverage**.

### Finding 8: Verification scripts are manual/advisory only

**File**: `scripts/verify-rendering.js`

The script prints instructions for manually using a `#/verify` route in the app. It does **not** perform automated verification — it's an instruction manual, not a test.

**Files**: `scripts/test_gpu_split.js`, `scripts/test_parity.js`, `scripts/test_cpu_baseline.js`

These are standalone manual test scripts for the Demucs adapter (CPU/GPU split parity). They test the vocal splitting pipeline, **not** the export pipeline.

---

## Export Pipeline Tracing: What Happens After 75%

### Frame rendering phase (0%–75%)

1. `electronExport.js` line 199: `gl.readPixels()` reads RGBA → `flipVertical()` → IPC to main
2. `main.js` line 531: `export-frame-raw` handler writes to `ffmpegProcess.stdin`
3. Backpressure check at line 533: if `pendingWrites > 30`, returns `backpressure: true`
4. Renderer retries with `i--` at line 252
5. Progress updates every 5 frames, yield-to-UI every 10 frames

### Finalization phase (75%–100%) — THE STALL ZONE

**Step 1** (electronExport.js line 253): Renderer calls `export-finalize-streaming` IPC

**Step 2** (main.js lines 558–583): Handler runs:
- `stdin.end()` awaited → FFmpeg processes remaining frames → `close` event fires
- **BUG**: `close` listener not attached yet → event missed → promise hangs

**Step 3** (main.js lines 585–641): After video encode completes:
- Mix audio stems with FFmpeg
- Combine video + audio with FFmpeg
- Return output path

**Step 4** (electronExport.js lines 258–276): Save dialog, copy file, cleanup

### Backpressure mechanism analysis

The `pendingWrites` tracking uses getter/setter closures (main.js lines 509–512):
```js
pendingWrites: () => pendingWrites,
incrementPending: () => { pendingWrites++; },
decrementPending: () => { pendingWrites--; },
```

This pattern **does not** suffer from stale closure issues because each call to `pendingWrites()` re-reads the same `pendingWrites` variable that `incrementPending()` and `decrementPending()` mutate. All three closures close over the same lexical binding.

### FFmpeg args analysis — streaming path

**File**: `electron/main.js`, lines 442–478

The video args for the streaming path are:
```
-y -f rawvideo -pix_fmt rgba -s WxH -r FPS -i pipe:0
-c:v <encoder> ... <encoder-specific flags>
-pix_fmt yuv420p <videoOnlyPath>
```

**No flags that would cause FFmpeg to wait for more input.** The `pipe:0` approach correctly signals EOF when stdin is closed. However, the **absence of `-nostdin`** flag means FFmpeg could theoretically wait for interactive input on its stdin (if any were available), but since stdin is pipe:0 and the pipe is closed by `stdin.end()`, this shouldn't be an issue.

---

## Linting / Code Quality Issues

### 1. Unused variables / dead code

**None found.** All 6 files are clean. No unused imports, no unreachable code, no stale branches.

### 2. Missing error handling

| File | Line(s) | Issue |
|------|---------|-------|
| `main.js` | 567–571 | `stdin.end()` callback error param not checked |
| `main.js` | 649–651 | `export-cleanup` silently catches all errors — but this is deliberate cleanup |
| `electronExport.js` | 325 | catch in finally block catches but only logs; no user-visible error |
| `gpuCapabilities.js` | 38 | `WEBGL_debug_renderer_info` extension optional, gracefully handled |

### 3. Potential memory leaks

| File | Lines | Issue | Severity |
|------|-------|-------|----------|
| `electronExport.js` | 226 | `pixels.buffer.slice(0)` creates a copy per frame — required for ArrayBuffer transfer, not a leak | Low |
| `electronExport.js` | 197 | `gl.readPixels()` writes to same reused buffer — correct, no allocation per frame beyond IPC | None |
| `karaokeDrawerGL.js` | 149–155 | Context loss event listeners never removed — but canvas lifetime matches export lifetime | Low |

### 4. Inconsistent patterns

| Pattern | CPU Path | GPU Streaming Path | Notes |
|---------|----------|-------------------|-------|
| GPU encoder fallback | Yes (lines 307–340) | **No** | Asymmetric — fix needed |
| FFmpeg timeout | No | No | Both paths need it |
| Frame batch writing | Batched PNGs | Single frame per IPC | Inherent difference, not a bug |
| Progress reporting | 5%–70% rendering | 5%–75% rendering | Slight offset, cosmetic |

### 5. Missing timeout guards on async operations

All 5 FFmpeg spawn sites in `main.js` lack timeout guards. See Finding 2 above.

### 6. Type safety

**File**: `electronExport.js`, line 15 — `flipVertical` uses typed `Uint8Array`  
**File**: `karaokeDrawerGL.js` — uses JSDoc annotations (e.g., `@param {Object}`)  
**File**: `gpuCapabilities.js` — uses JSDoc return type annotations  

No `any` types found. Type safety is reasonable for a JS codebase.

---

## Constraints Identified

1. **GPU encoder completion speed is the trigger**: The race condition only manifests when FFmpeg finishes encoding *faster than the event loop can attach the `close` listener*. This is more likely with:
   - NVENC on fast NVIDIA GPUs
   - Short songs (less data to encode)
   - High-performance NVMe drives for temp file writes

2. **Cannot unit-test the race**: The race is in main-process IPC handlers that spawn real processes. Testing requires full integration test infrastructure (Electron + FFmpeg).

3. **The fix is minimal**: Reordering 2 lines fixes the primary bug. See Recommendations below.

4. **WebGL context loss during export is unlikely**: During export, the WebGL context is actively used every frame (~30fps for a typical 3-minute song = 5400 frames). Context loss typically happens during GPU memory pressure from other applications, not from steady rendering.

---

## Existing Patterns (notable for the Planner)

1. **Factory pattern**: `activeExports` Map (main.js line 168) serves as a simple factory tracking all active exports by ID
2. **Streaming pattern**: Pending writes via getter/setter closures (main.js lines 508–512) — closure-based approach to shared mutable state
3. **Guard clause**: `export-cleanup` (line 647) checks `!exp.ffmpegProcess.killed` before killing — defensive
4. **Resolution map**: `RESOLUTION_MAP` in `useKaraokeExport.js` (lines 13–17) — clean key→dimension lookup
5. **Singleton cache**: `gpuCapabilities.js` — cached detection with concurrent-call guard (lines 127–131)

---

## Recommendations

### Immediate (for the Executor)

1. **Fix the race condition** — Reorder `export-finalize-streaming` (main.js lines 565–583):
   ```js
   // Attach close listener FIRST, then end stdin
   const closePromise = new Promise((resolve, reject) => {
       exp.ffmpegProcess.on('close', (code) => {
           if (code === 0) resolve();
           else reject(new Error(`FFmpeg failed (code ${code})`));
       });
       exp.ffmpegProcess.on('error', reject);
   });
   exp.ffmpegProcess.stdin.end(); // fire-and-forget
   await closePromise;
   ```

2. **Add 30-second timeout** to the FFmpeg wait using `Promise.race`

3. **Add NVENC→libx264 fallback** in the streaming path (symmetrical with CPU path)

### Short-term

4. **Add `--max-retries=20` cap** to the `i--` backpressure loop in `electronExport.js`

5. **Add integration test** for the streaming export path (at minimum: smoke test with a short synthetic audio clip)

### Optional

6. Add `-nostdin` flag to FFmpeg args in streaming path as defensive measure
7. Add WebGL context recovery logic in `karaokeDrawerGL.js` (low priority — unlikely during export)

---

## Unknowns Remaining

1. **User's GPU model** — Not confirmed. Determines whether NVENC or QSV is in use. Both GPU encoders can trigger the race, but NVENC typically finishes faster.
2. **Console logs from main process** — Not available. Cannot confirm whether "Video encoded" appears or FFmpeg stderr shows errors.
3. **Song duration** — Not confirmed. Short songs are more likely to trigger the race (less data to encode = faster completion).
4. **CPU export path behavior** — Not confirmed whether non-GPU export works. This would isolate the bug to the streaming path vs. a broader issue.
5. **FFmpeg binary version** — Could affect encoder behavior. Some FFmpeg builds have different NVENC completion timing.
6. **Whether `pendingWrites` drains to 0 before `stdin.end()`** — If writes are still pending when stdin is ended, FFmpeg might not process all frames, but this wouldn't cause a stall — it would cause a truncated video.
