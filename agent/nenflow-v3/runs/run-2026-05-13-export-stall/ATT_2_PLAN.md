---
artifact_type: PLAN
role: PLANNER
run_id: run-2026-05-13-export-stall
context_saturation_estimate: '~38%'
source_research: ATT_1_RESEARCH.md
source_intake: C:/Users/doner/kraokebox_song_generator/intake.md
---

# ATT_2_PLAN — MP4 Export Stall Fix

## Task Statement

Apply three targeted fixes in electron/main.js and one safety guard in src/utils/electronExport.js to eliminate the permanent hang in the GPU streaming export path (export-finalize-streaming), add timeout protection across all FFmpeg subprocess waits, and add GPU-to-CPU encoder fallback symmetry for the streaming path. Run existing test suite + manual verification scripts to confirm world contact. No refactoring, no rendering pipeline changes.

---

## Invariants (Must Hold After Fixes)

1. No regressions in CPU export path — npm test passes (all 3 vitest suites)
2. No change to rendering — karaokeDrawerGL.js, karaokeDrawer.js, gpuCapabilities.js untouched
3. No change to IPC contract — export-frame-raw, export-start-streaming, export-finalize-streaming, export-cleanup signatures unchanged
4. No change to UI — useKaraokeExport.js untouched
5. Existing error paths preserved — all catch blocks and error messages remain reachable
6. Race condition no longer reproducible — close listener always attached before stdin.end() creates the opportunity for FFmpeg to exit

---

## Success Criteria

| # | Criterion | How Verified |
|---|-----------|-------------|
| SC-1 | close listener attached before stdin.end() in export-finalize-streaming | Source diff inspection |
| SC-2 | FFmpeg close wait has 30s timeout | Source diff inspection + grep for setTimeout / Promise.race |
| SC-3 | Streaming path has NVENC-to-libx264 fallback structurally mirroring CPU path | Source diff inspection |
| SC-4 | Frame retry loop has max retry guard | Source diff inspection |
| SC-5 | npm test passes with zero failures | vitest run output |
| SC-6 | Code builds without errors | vite build exit code 0 |
---

## Implementation Steps

### File 1: electron/main.js — PRIMARY fix (race condition)

Location: Lines 558-583, export-finalize-streaming handler
Change: Reorder stdin.end() and close listener attachment. Attach close and error listeners FIRST, then call stdin.end() as fire-and-forget, then await the close promise (with timeout).

CURRENT CODE (lines 565-583):
   await new Promise((resolve, reject) => {
       exp.ffmpegProcess.stdin.end(() => { resolve(); });
   });
   await new Promise((resolve, reject) => {
       exp.ffmpegProcess.on("close", (code) => { ... });
       exp.ffmpegProcess.on("error", reject);
   });

REPLACE WITH (combined PRIMARY+SECONDARY):
   // Attach close/error listeners BEFORE ending stdin to avoid race
   const encodePromise = new Promise((resolve, reject) => {
       exp.ffmpegProcess.on("close", (code) => {
           if (code === 0) resolve();
           else {
               const stderr = typeof exp.ffmpegStderr === "function" ? exp.ffmpegStderr() : "";
               reject(Object.assign(new Error("FFmpeg streaming encode failed: " + stderr.slice(-300)), { code, encoder: exp.encoder }));
           }
       });
       exp.ffmpegProcess.on("error", reject);
   });

   // 30-second timeout guard
   const ENCODE_TIMEOUT_MS = 30000;
   const timeoutPromise = new Promise((_, reject) =>
       setTimeout(() => reject(new Error("FFmpeg streaming encode timed out after 30s")), ENCODE_TIMEOUT_MS)
   );

   // End stdin — close listener already attached, no race
   exp.ffmpegProcess.stdin.end();

   try {
       await Promise.race([encodePromise, timeoutPromise]);
   } catch (encodeErr) {
       // TERTIARY fallback (see below)
       ...
   }
Key detail: The reject in the close handler uses Object.assign(new Error(...), { code, encoder: exp.encoder }) so the catch block can inspect the exit code and encoder for fallback logic.

---

### File 1 (same): electron/main.js — SECONDARY fix (timeout guards)

Already combined with PRIMARY above for the streaming encode wait. Additionally, add timeout guards to the audio mix and video+audio combine subprocesses within the same export-finalize-streaming handler.

AUDIO MIX (current lines ~595-612):
Extract the existing new Promise(...) into a variable and wrap with Promise.race:

   const mixPromise = new Promise((resolve, reject) => {
       // ... existing FFmpeg spawn for audio mixing ...
   });
   await Promise.race([
       mixPromise,
       new Promise((_, reject) => setTimeout(() => reject(new Error("Audio mix timed out after 30s")), 30000))
   ]);

VIDEO+AUDIO COMBINE (current lines ~616-641):
Same pattern:

   const combinePromise = new Promise((resolve, reject) => {
       // ... existing FFmpeg spawn for combining ...
   });
   await Promise.race([
       combinePromise,
       new Promise((_, reject) => setTimeout(() => reject(new Error("Video+audio combine timed out after 30s")), 30000))
   ]);

Note: Do NOT refactor the existing promise construction. Just extract into a variable and wrap.

---

### File 1 (same): electron/main.js — TERTIARY fix (GPU encoder fallback)

Location: Inside the catch block from Step 1, wrapping the encode wait.
Pattern: Mirror the CPU path fallback (export-finalize handler, lines 317-338) which re-spawns FFmpeg with libx264 when the GPU encoder fails.

Strategy: Since the streaming path sends frames via stdin pipe (data gone once sent), we cannot re-render. Instead, if the GPU encoder fails, we re-encode the (possibly partial) video_only.mp4 output with libx264. This handles the common case where NVENC fails at init (empty output, fast fallback failure) or partway through (partial output may be salvageable).

IMPLEMENTATION (inside the catch block from Step 1):
   if (exp.encoder && exp.encoder !== "libx264") {
       console.warn("[StreamExport] " + exp.encoder + " failed, falling back to libx264...");
       const fallbackVideoPath = exp.videoOnlyPath.replace(".mp4", "_fallback.mp4");
       try {
           await Promise.race([
               new Promise((resolve, reject) => {
                   const ffmpeg = spawn(FFMPEG_PATH, [
                       "-y", "-i", exp.videoOnlyPath,
                       "-c:v", "libx264", "-preset", "slow",
                       "-crf", "17", "-tune", "animation",
                       "-pix_fmt", "yuv420p", fallbackVideoPath
                   ], { stdio: "pipe" });
                   let fbStderr = "";
                   ffmpeg.stderr.on("data", (d) => { fbStderr += d.toString(); });
                   ffmpeg.on("close", (fbCode) => {
                       if (fbCode === 0) { console.log("[StreamExport] CPU fallback encoding succeeded"); resolve(); }
                       else { reject(new Error("libx264 fallback failed (code " + fbCode + "): " + fbStderr.slice(-300))); }
                   });
                   ffmpeg.on("error", reject);
               }),
               new Promise((_, reject) => setTimeout(() => reject(new Error("FFmpeg fallback encode timed out after 30s")), 30000))
           ]);
           await fs.promises.rename(fallbackVideoPath, exp.videoOnlyPath);
       } catch (fallbackErr) {
           throw new Error("Video encode failed: " + exp.encoder + " error. CPU fallback also failed. Try disabling GPU acceleration.");
       }
   } else {
       throw encodeErr;
   }

Important: The try/catch wraps just the encode step. The audio mix and combine steps below run regardless of fallback, since they use exp.videoOnlyPath which the fallback updates via rename.

---

### File 2: src/utils/electronExport.js — Safety guard (retry cap)

Location: Lines ~230-240, the i-- backpressure retry loop.

ADD BEFORE THE RENDER LOOP (around line 200):
   const RETRY_LIMIT = 20;
   let retries = 0;

CURRENT CODE:
   if (frameResult.backpressure) {
       await new Promise(r => setTimeout(r, 10));
       i--;
       continue;
   }

REPLACE WITH:
   if (frameResult.backpressure) {
       retries++;
       if (retries > RETRY_LIMIT) {
           throw new Error("Frame " + i + " retry limit exceeded. FFmpeg may have crashed.");
       }
       await new Promise(r => setTimeout(r, 10));
       i--;
       continue;
   } else {
       retries = 0;
   }

---

## Verification

V1: npm test — All 3 vitest suites pass (jsonAdapters, tokenTransforms, undoStack)
V2: npm run build — Build completes without errors
V3: Source diff inspection — Verify listener ordering, timeout wrappers, fallback logic, retry cap
V4: Manual scripts — node scripts/test_cpu_baseline.js, test_gpu_split.js, test_parity.js, verify-rendering.js

---

## Handoff Notes

### For the Executor

1. Edit electron/main.js first. The PRIMARY and SECONDARY fixes are co-located. Replace lines 565-583 with the combined fix. Then add timeout wrappers to audio mix and combine subprocesses. Finally wrap the encode await in try/catch for TERTIARY fallback.

2. The encode promise rejection uses Object.assign(new Error(...), { code, encoder }) so the catch block can branch on exp.encoder. exp.encoder is stored at line 508 of export-start-streaming.

3. Fallback file management: writes to video_only_fallback.mp4 in same temp dir, renames over video_only.mp4 on success. On failure, temp debris cleaned by export-cleanup (which removes entire temp dir).

4. electronExport.js edit is minimal: add RETRY_LIMIT + retries counter before the render loop, add retry check inside the backpressure branch. Do NOT restructure the loop.

5. DO NOT TOUCH: karaokeDrawerGL.js, karaokeDrawer.js, gpuCapabilities.js, useKaraokeExport.js, fastExport.js, any __tests__/ files.

6. Build before testing: npm run build first, then npm test, then manual scripts.

### Known Limitations

- TERTIARY fallback is best-effort: streaming path cannot re-send frames via stdin, so it re-encodes the (possibly partial) video_only.mp4. If NVENC failed at init (no data written), fallback also fails with clear error suggesting user disable GPU acceleration.
- Timeout values fixed at 30s. Tuned for typical song lengths. Very long exports may need adjustment (future config concern).

### Context Continuity

- CONTINUATION CONTRACT: None. Plan is self-contained at ~38% context saturation.
- Next artifact: ATT_3_EXECUTION.md
- Verifier checks: listener ordering, 3 timeout wrappers, fallback logic, npm test exit code.