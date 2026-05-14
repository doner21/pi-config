---
artifact_type: PLAN
role: PLANNER
run_id: run-2026-05-13-export-stall
context_saturation_estimate: ~22%
source_research: ATT_4_RESEARCH.md
source_intake: C:/Users/doner/kraokebox_song_generator/intake.md
---

# ATT_5_PLAN - AMD/AMF Encoder Support (Phase 2)



## Task Statement

Add AMD AMF GPU encoder (h264_amf) support across the full export pipeline: replace the broken compile-time encoder probe with live runtime tests, add h264_amf to all encoder whitelists and if/else arg chains (CPU + streaming paths), add amf field to GPU capabilities detection with proper priority ordering, and fix the broken streaming fallback error message. No rendering changes, no IPC contract changes, no UI changes.

---

## Invariants (Must Hold After All Edits)

1. No change to rendering - src/karaoke/karaokeDrawerGL.js, src/karaoke/karaokeDrawer.js untouched
2. No change to IPC contract - all ipcMain.handle signatures and return shapes unchanged (additive amf field only)
3. No change to UI - src/hooks/useKaraokeExport.js untouched
4. CPU export path must still work - libx264 path unchanged (AMF branch inserted before else)
5. Tests must pass - npm test (3 suites in src/editor/__tests__/) all green
6. Build must succeed - npm run build exit code 0
7. probe-gpu-encoders IPC handler MUST return the new amf field in both success and error shapes

---

## Success Criteria

| # | Criterion | How Verified |
|---|-----------|-------------|
| SC-7 | GPU probe uses live encoder test instead of ffmpeg -encoders | Source diff: grep lavfi in main.js |
| SC-8 | h264_amf in valid encoder lists (export-start and export-start-streaming) | Source diff: validEncoders arrays contain h264_amf |
| SC-9 | AMF encoder args in CPU path (export-finalize) AND streaming path (export-start-streaming) | Source diff: else if block with -c:v h264_amf -usage transcoding -quality quality -rc cqp -qp_i 18 -qp_p 20 -profile:v high -pix_fmt yuv420p |
| SC-10 | amf field in gpuCapabilities.js capabilities, return types, JSDoc, priority chain | Source diff: amf in cachedCapabilities, probeFFmpegEncoders returns, JSDoc, preferredEncoder |
| SC-11 | Streaming fallback throws clear error about incomplete output | Source diff: error string mentions incomplete output + retry with CPU |
| SC-12 | npm test passes | vitest run exit code 0, zero failures |
| SC-13 | npm run build succeeds | vite build exit code 0 |

---

## Implementation Steps

### Step 1: Fix GPU encoder probe - live test (File 1: electron/main.js, Edit A)

**Location**: Lines 139-168, ipcMain.handle('probe-gpu-encoders', ...)

Replace the entire handler. OLD uses ffmpeg -encoders string-grep (gives false positives on AMD). NEW tests each encoder with a live micro-encode (16x16 black frame, 0.1s) in parallel via Promise.all with 5s per-encoder timeout.

**OLD (delete entire handler at lines 139-168)**:

```javascript
ipcMain.handle('probe-gpu-encoders', async () => {
    try {
        const result = await new Promise((resolve, reject) => {
            const proc = spawn(FFMPEG_PATH, ['-encoders'], { stdio: 'pipe' });
            let stdout = '';
            let stderr = '';
            proc.stdout.on('data', (data) => { stdout += data.toString(); });
            proc.stderr.on('data', (data) => { stderr += data.toString(); });
            proc.on('close', (code) => {
                resolve(stdout);
            });
            proc.on('error', (err) => {
                reject(err);
            });
        });

        const nvenc = result.includes('h264_nvenc');
        const qsv = result.includes('h264_qsv');
        console.log(`[GPU Probe] NVENC: ${nvenc}, QSV: ${qsv}`);
        return { success: true, nvenc, qsv };
    } catch (err) {
        console.error('[GPU Probe] Failed:', err.message);
        return { success: false, nvenc: false, qsv: false, error: err.message };
    }
});
```

**NEW (replace with)**:

```javascript
ipcMain.handle('probe-gpu-encoders', async () => {
    try {
        const ENCODERS = ['h264_nvenc', 'h264_amf', 'h264_qsv'];
        const PROBE_TIMEOUT_MS = 5000;

        const testEncoder = (encoder) => {
            return new Promise((resolve) => {
                const args = [
                    '-y',
                    '-f', 'lavfi',
                    '-i', 'color=black:size=16x16:d=0.1',
                    '-c:v', encoder,
                    '-f', 'null',
                    '-'
                ];
                let killed = false;
                const proc = spawn(FFMPEG_PATH, args, { stdio: 'pipe' });
                const timer = setTimeout(() => {
                    if (!killed) {
                        killed = true;
                        try { proc.kill(); } catch (e) { /* ignore */ }
                        resolve(false);
                    }
                }, PROBE_TIMEOUT_MS);
                proc.on('close', (code) => {
                    if (!killed) {
                        clearTimeout(timer);
                        resolve(code === 0);
                    }
                });
                proc.on('error', () => {
                    if (!killed) {
                        clearTimeout(timer);
                        resolve(false);
                    }
                });
                // Drain stdout/stderr to prevent backpressure
                proc.stdout.on('data', () => {});
                proc.stderr.on('data', () => {});
            });
        };

        const [nvenc, amf, qsv] = await Promise.all(ENCODERS.map(testEncoder));
        console.log(`[GPU Probe] NVENC: ${nvenc}, AMF: ${amf}, QSV: ${qsv}`);
        return { success: true, nvenc, amf, qsv };
    } catch (err) {
        console.error('[GPU Probe] Failed:', err.message);
        return { success: false, nvenc: false, amf: false, qsv: false, error: err.message };
    }
});
```

**Note on FFMPEG_PATH**: The const FFMPEG_PATH = ffmpegPath; is defined at line 173 but the probe handler is at line 139. This is a pre-existing TDZ pattern that works in Electron's module loader. Continue using the same variable reference the existing code uses - do NOT change the pattern.

---

### Step 2: Add h264_amf to validEncoders - CPU path (File 1: electron/main.js, Edit B)

**Location**: Inside ipcMain.handle('export-start', ...), approximately line 184.

OLD:
    const validEncoders = ['h264_nvenc', 'h264_qsv', 'libx264'];

NEW:
    const validEncoders = ['h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264'];

---

### Step 3: Add h264_amf to validEncoders - Streaming path (File 1: electron/main.js, Edit C)

**Location**: Inside ipcMain.handle('export-start-streaming', ...), approximately line 435.

OLD:
    const validEncoders = ['h264_nvenc', 'h264_qsv', 'libx264'];

NEW:
    const validEncoders = ['h264_nvenc', 'h264_amf', 'h264_qsv', 'libx264'];


---

### Step 4: Add AMF encoder args - CPU finalize path (File 1: electron/main.js, Edit D)

**Location**: Inside ipcMain.handle('export-finalize', ...), in the encoder if/else chain. Insert new else if block between the QSV block and the else fallback.

**FIND this exact text**:

            console.log('[Export] Step 1: Encoding video frames with QSV (Intel GPU)...');
        } else {
            // CPU fallback: libx264 (unchanged from original)

**REPLACE WITH**:

            console.log('[Export] Step 1: Encoding video frames with QSV (Intel GPU)...');
        } else if (encoder === 'h264_amf') {
            // AMF: GPU-accelerated encoding (AMD)
            // CQP mode at qp_i=18/qp_p=20 approximates x264 CRF 17
            videoEncodeArgs = [
                '-y',
                '-framerate', String(exp.fps),
                '-i', inputPattern,
                '-c:v', 'h264_amf',
                '-usage', 'transcoding',
                '-quality', 'quality',
                '-rc', 'cqp',
                '-qp_i', '18',
                '-qp_p', '20',
                '-profile:v', 'high',
                '-pix_fmt', 'yuv420p',
                videoOnlyPath
            ];
            console.log('[Export] Step 1: Encoding video frames with AMF (AMD GPU)...');
        } else {
            // CPU fallback: libx264 (unchanged from original)

---

### Step 5: Add AMF encoder args - Streaming path (File 1: electron/main.js, Edit E)

**Location**: Inside ipcMain.handle('export-start-streaming', ...), in the encoder-specific args chain. Insert new else if block between the QSV block and the else fallback.

**FIND this exact text** (end of QSV block):

        } else if (resolvedEncoder === 'h264_qsv') {
            videoArgs.push(
                '-c:v', 'h264_qsv',
                '-preset', 'veryslow',
                '-global_quality', '19',
                '-profile:v', 'high',
                '-pix_fmt', 'yuv420p'
            );
        } else {

**REPLACE WITH**:

        } else if (resolvedEncoder === 'h264_qsv') {
            videoArgs.push(
                '-c:v', 'h264_qsv',
                '-preset', 'veryslow',
                '-global_quality', '19',
                '-profile:v', 'high',
                '-pix_fmt', 'yuv420p'
            );
        } else if (resolvedEncoder === 'h264_amf') {
            videoArgs.push(
                '-c:v', 'h264_amf',
                '-usage', 'transcoding',
                '-quality', 'quality',
                '-rc', 'cqp',
                '-qp_i', '18',
                '-qp_p', '20',
                '-profile:v', 'high',
                '-pix_fmt', 'yuv420p'
            );
        } else {

**Note**: The streaming path sends rgba via stdin. FFmpeg swscale auto-converts rgba to yuv420p before the AMF encoder, matching the NVENC/QSV paths. No format filter needed.


---

### Step 6: Fix streaming fallback error message (File 1: electron/main.js, Edit F)

**Location**: Inside ipcMain.handle('export-finalize-streaming', ...), innermost catch block.

**FIND**:

                } catch (fallbackErr) {
                    throw new Error(
                        'Video encode failed: ' + exp.encoder + ' error. ' +
                        'CPU fallback also failed. Try disabling GPU acceleration.'
                    );
                }

**REPLACE WITH**:

                } catch (fallbackErr) {
                    throw new Error(
                        'GPU encoder (' + exp.encoder + ') failed. ' +
                        'The output file is incomplete. ' +
                        'Please retry with CPU encoding (disable GPU acceleration).'
                    );
                }

**Rationale**: Old message blames CPU fallback, but corrupt video_only.mp4 (from failed GPU encode) is the real cause. New message is honest and actionable.


---

### Step 7: Add amf to gpuCapabilities.js (File 2: src/utils/gpuCapabilities.js, Edits G+H+I combined)

Apply these sub-edits in order:

**7a. JSDoc fallback hierarchy comment (line ~13)**:

OLD:
 *   Encoder:     h264_nvenc -> h264_qsv -> libx264

NEW:
 *   Encoder:     h264_nvenc -> h264_amf -> h264_qsv -> libx264

**7b. probeFFmpegEncoders JSDoc return type (line ~72)**:

OLD:
 * @returns {{ nvenc: boolean, qsv: boolean }}

NEW:
 * @returns {{ nvenc: boolean, amf: boolean, qsv: boolean }}

**7c. probeFFmpegEncoders - add amf: false to all 3 default return sites**:

Site 1 (Electron not detected, ~line 76):
OLD:  return { nvenc: false, qsv: false };
NEW:  return { nvenc: false, amf: false, qsv: false };

Site 2 (probe failed, ~line 84):
OLD:  return { nvenc: false, qsv: false };
NEW:  return { nvenc: false, amf: false, qsv: false };

Site 3 (catch block, ~line 89):
OLD:  return { nvenc: false, qsv: false };
NEW:  return { nvenc: false, amf: false, qsv: false };

**7d. probeFFmpegEncoders success return + log (~lines 80-86)**:

OLD:
        console.log(`[GPU] FFmpeg encoders - NVENC: ${result.nvenc}, QSV: ${result.qsv}`);
        return { nvenc: result.nvenc, qsv: result.qsv };

NEW:
        console.log(`[GPU] FFmpeg encoders - NVENC: ${result.nvenc}, AMF: ${result.amf}, QSV: ${result.qsv}`);
        return { nvenc: result.nvenc, amf: result.amf, qsv: result.qsv };

**7e. detectGpuCapabilities JSDoc return type (~lines 128-131)**:

OLD (in JSDoc):
 *   nvenc: boolean,
 *   qsv: boolean,

NEW (in JSDoc):
 *   amf: boolean,
 *   nvenc: boolean,
 *   qsv: boolean,

OLD (in JSDoc):
 *   preferredEncoder: 'h264_nvenc' | 'h264_qsv' | 'libx264',

NEW (in JSDoc):
 *   preferredEncoder: 'h264_nvenc' | 'h264_amf' | 'h264_qsv' | 'libx264',

**7f. Encoder priority chain (~lines 154-158)**:

OLD:
        let preferredEncoder = 'libx264';
        if (encoderInfo.nvenc) {
            preferredEncoder = 'h264_nvenc';
        } else if (encoderInfo.qsv) {
            preferredEncoder = 'h264_qsv';
        }

NEW:
        let preferredEncoder = 'libx264';
        if (encoderInfo.nvenc) {
            preferredEncoder = 'h264_nvenc';
        } else if (encoderInfo.amf) {
            preferredEncoder = 'h264_amf';
        } else if (encoderInfo.qsv) {
            preferredEncoder = 'h264_qsv';
        }

**7g. Add amf to cachedCapabilities object (~lines 166-175)**:

FIND:
        cachedCapabilities = {
            webgl2: webglInfo.webgl2,
            nvenc: encoderInfo.nvenc,
            qsv: encoderInfo.qsv,
            maxTextureSize: webglInfo.maxTextureSize,

ADD amf line after nvenc:
        cachedCapabilities = {
            webgl2: webglInfo.webgl2,
            nvenc: encoderInfo.nvenc,
            amf: encoderInfo.amf,
            qsv: encoderInfo.qsv,
            maxTextureSize: webglInfo.maxTextureSize,


---

### Step 8: Update electronExport.js JSDoc (File 3: src/utils/electronExport.js, Edit J)

**Location**: Line ~55, the @param encoder JSDoc comment.

OLD:
    encoder = 'libx264'       // 'libx264' | 'h264_nvenc' | 'h264_qsv'

NEW:
    encoder = 'libx264'       // 'libx264' | 'h264_nvenc' | 'h264_amf' | 'h264_qsv'

**Note**: The actualEncoder logic at line ~107 (const actualEncoder = actualGPU ? encoder : 'libx264';) is already AMF-agnostic - it passes through whatever encoder is provided when GPU rendering is active. No logic change needed.

---

## Verification

| Step | Command | Expected |
|------|---------|----------|
| V1 | npm test | 3 suites pass, zero failures |
| V2 | npm run build | Exit code 0, no errors |
| V3 | grep -n h264_amf electron/main.js | At least 5 matches (probe return, 2 validEncoders, 2 encoder arg blocks) |
| V4 | grep -n amf src/utils/gpuCapabilities.js | At least 10 matches (JSDoc, returns, defaults, cachedCapabilities, priority, log) |
| V5 | grep -n h264_amf src/utils/electronExport.js | At least 1 match (JSDoc) |
| V6 | grep lavfi electron/main.js | At least 1 match (live probe) |
| V7 | grep "output file is incomplete" electron/main.js | At least 1 match (new error message) |

---

## Handoff Notes

### For the Executor

1. **Edit order**: electron/main.js first (Edits A-F, 6 edits), then src/utils/gpuCapabilities.js (Edits G-I, 3 logical edits spanning ~10 sub-edits), then src/utils/electronExport.js (Edit J, 1 line).

2. **Edit A is the largest change** (~30 lines replaced). The probe-gpu-encoders handler starts at line 139 with ipcMain.handle(...) and ends with the closing }); after the catch block. Match the old block boundaries exactly.

3. **Encoder arg consistency**: AMF args are IDENTICAL for CPU path (Edit D) and streaming path (Edit E): -c:v h264_amf -usage transcoding -quality quality -rc cqp -qp_i 18 -qp_p 20 -profile:v high -pix_fmt yuv420p.

4. **Files NOT to touch**: src/karaoke/karaokeDrawerGL.js, src/karaoke/karaokeDrawer.js, src/hooks/useKaraokeExport.js, src/editor/__tests__/*, fastExport.js, vite.config.js, vitest.config.js, package.json.

5. **Build before test**: Run npm run build first, then npm test.

6. **No npm install needed**: All changes use existing dependencies (spawn, ffmpeg-static).

### Known Limitations

- Streaming fallback (Edit F) is a message fix only. Does NOT implement re-encode-from-frames fallback (architectural change out of scope). New error message is honest and actionable.
- Live encoder probe adds ~2-3s to app startup (parallel tests via Promise.all). Acceptable one-time cost.
- AMF encoder NOT tested on actual AMD Radeon 8060S at plan time. Live probe confirms availability at runtime.

### Context Continuity

- CONTINUATION CONTRACT: None (~22% saturation, below 40% threshold)
- Next artifact: ATT_6_EXECUTION.md
- Verifier checks: grep for new strings, npm test, npm run build
