---
artifact_type: RESEARCH
role: RESEARCHER
run_id: run-2026-05-13-export-stall
context_saturation_estimate: "~25%"
---

# Researcher Report — AMD/AMF Encoder Investigation (Phase 2)

## Investigation Scope

Per INTAKE Phase 2, investigated five areas:
1. GPU probe bug — verify `ffmpeg -encoders` false-positive on AMD
2. Correct `h264_amf` FFmpeg encoder args for quality encoding
3. Streaming fallback analysis — broken re-encode path
4. All encoder list locations needing AMF support
5. `gpuCapabilities.js` — where `amf` field needed and what `resolveGpuConfig` returns on AMD

---

## Key Findings

### 1. GPU Probe Bug — CONFIRMED

**Evidence**: `ffmpeg-static` v5.3.0 bundles ffmpeg 6.1.1 built with:
```
--enable-amf --enable-nvenc --enable-cuvid --enable-ffnvcodec --enable-nvdec
```

Running `ffmpeg -encoders` lists **all three** as available:
```
h264_amf             AMD AMF H.264 Encoder
h264_nvenc           NVIDIA NVENC H.264 encoder
h264_qsv             H.264 / AVC (Intel Quick Sync Video acceleration)
```

The current probe at `electron/main.js:154-155`:
```js
const nvenc = result.includes('h264_nvenc');
const qsv = result.includes('h264_qsv');
```
Returns `{ nvenc: true, qsv: false }` on AMD systems — **NVENC is always listed because it's compiled in, not because it works.**

**Live encoder test** confirms runtime availability differs from compiled list:

| Encoder | Compile list | Live test on non-NVIDIA/AMD machine | Correct behavior |
|---------|-------------|-------------------------------------|------------------|
| `libx264` | N/A | ✅ SUCCESS | Always works |
| `h264_nvenc` | ✅ listed | ❌ `Cannot load nvcuda.dll` | Only on NVIDIA |
| `h264_amf` | ✅ listed | ❌ `encoder->Init() failed with error 5` | Only on AMD |
| `h264_qsv` | ✅ listed | Not tested | Only on Intel |

**Recommended live-test command** (per intake suggestion):
```bash
ffmpeg -y -f lavfi -i "color=black:size=16x16:d=0.1" -c:v {encoder} -f null -
```
Exit code 0 = encoder works. Non-zero = encoder not runtime-available. Takes ~2-3s per encoder.

---

### 2. AMF Encoder Args — RESEARCHED

Full encoder options from `ffmpeg -h encoder=h264_amf` (ffmpeg 6.1.1):

**Supported pixel formats** (CRITICAL CONSTRAINT):
```
nv12 yuv420p d3d11 dxva2_vld
```
⚠️ **No `rgba` support.** Streaming path uses `-f rawvideo -pix_fmt rgba` — FFmpeg's swscale will auto-convert rgba→yuv420p before encoder. Identical to how NVENC/QSV paths already work. No code change needed for format handling.

**Quality parameters** (equivalent to x264 CRF 17):

For **CPU path** (PNG frames → AMF):
```
-c:v h264_amf
-usage transcoding
-quality quality
-rc cqp
-qp_i 18
-qp_p 20
-profile:v high
-pix_fmt yuv420p
```

For **streaming path** (raw RGBA stdin → AMF):
```
-c:v h264_amf
-usage transcoding
-quality quality
-rc cqp
-qp_i 18
-qp_p 20
-profile:v high
-pix_fmt yuv420p
```
Same args — FFmpeg handles rgba→yuv420p conversion internally.

**Key option reference**:
- `-usage`: 0=transcoding, 4=high_quality (use transcoding per GPUOpen wiki for general use)
- `-quality`: 0=balanced, 1=speed, 2=quality
- `-rc cqp`: Constant Quantization Parameter (closest to x264 CRF)
- `-qp_i` / `-qp_p`: I-frame/P-frame QP, range -1..51, lower=better
- `-profile high`: Profile 100 (High)
- Optional quality boosters (not needed for karaoke text/static content): `-preanalysis true -vbaq true`

**Source**: FFmpeg 6.1.1 built-in help + GPUOpen/AMF Wiki (github.com/GPUOpen-LibrariesAndSDKs/AMF)

---

### 3. Streaming Fallback Analysis — BROKEN

**Two fallback paths exist — only CPU path works:**

#### CPU path fallback (`export-finalize`, line ~317):
```
GPU encoder fails → re-encode from PNG frame files → libx264
```
✅ **WORKS** — PNG frame files are intact (written before encoding starts). Re-encoding from source frames always succeeds.

#### Streaming path fallback (`export-finalize-streaming`, line ~596):
```
GPU encoder fails → re-encode video_only.mp4 → libx264
```
❌ **BROKEN** — When GPU encoder fails mid-stream, the `video_only.mp4` file is corrupt:
- FFmpeg writes partial data to pipe
- Process terminates without finalizing MP4 container
- Missing moov atom → `ffmpeg -i video_only.mp4` will fail with "moov atom not found"
- This produces: "Video encode failed: h264_nvenc error. CPU fallback also failed."

**Root cause chain on AMD**:
1. Probe says NVENC available (false positive)
2. Streaming starts with `h264_nvenc` encoder
3. NVENC fails (no NVIDIA GPU) → writes corrupt `video_only.mp4`
4. Fallback tries to re-encode corrupt file → fails
5. Error: "CPU fallback also failed. Try disabling GPU acceleration."

**Recommendation**: After GPU streaming failure, DON'T re-encode `video_only.mp4`. Instead, degrade to CPU path: re-render frames via canvas2d, write PNG files, encode with libx264. This requires the renderer to re-send frames, which is a larger architectural change.

**Minimum viable fix**: If streaming GPU encoder fails, throw a clear error telling the user to use CPU mode. The current "CPU fallback also failed" message is misleading — CPU didn't fail, the corrupt input file failed.

---

### 4. All Encoder List Locations — AUDIT COMPLETE

**7 locations in `electron/main.js` need AMF added:**

| # | Line | Location | What's there now | What's missing |
|---|------|----------|-----------------|----------------|
| 1 | 154-155 | `probe-gpu-encoders` handler | Checks `h264_nvenc`, `h264_qsv` only | `h264_amf` check |
| 2 | 184 | `export-start` handler | `validEncoders = ['h264_nvenc', 'h264_qsv', 'libx264']` | `h264_amf` |
| 3 | 255-290 | `export-finalize` encoder if/else chain | Cases for nvenc, qsv, else | `h264_amf` else-if + args |
| 4 | 435 | `export-start-streaming` handler | `validEncoders = ['h264_nvenc', 'h264_qsv', 'libx264']` | `h264_amf` |
| 5 | 449-470 | `export-start-streaming` encoder if/else chain | Cases for nvenc, qsv, else | `h264_amf` else-if + args |
| 6 | 597 | `export-finalize-streaming` fallback check | `exp.encoder !== 'libx264'` | Already generic (any GPU encoder → fallback) |
| 7 | 317 | `export-finalize` fallback check | `encoder !== 'libx264'` | Already generic (any GPU encoder → fallback) |

**4 locations in `src/utils/gpuCapabilities.js` need AMF added:**

| # | Line | Location | What's there now | What's missing |
|---|------|----------|-----------------|----------------|
| 8 | 13 | JSDoc fallback hierarchy comment | `h264_nvenc → h264_qsv → libx264` | Add `h264_amf` |
| 9 | 72 | `probeFFmpegEncoders` return type JSDoc | `{ nvenc, qsv }` | `amf` field |
| 10 | 128 | Return type JSDoc | `nvenc, qsv` fields | `amf` field |
| 11 | 154-158 | `detectGpuCapabilities` encoder priority | nvenc → qsv → libx264 | Add amf in priority |

**1 location in `src/utils/electronExport.js`:**

| # | Line | Location | What's there now | What's missing |
|---|------|----------|-----------------|----------------|
| 12 | 55 | JSDoc `@param encoder` | `'libx264' \| 'h264_nvenc' \| 'h264_qsv'` | `'h264_amf'` |

**Total: 12 locations** requiring AMF support additions.

---

### 5. gpuCapabilities.js — resolveGpuConfig on AMD

**Current behavior on AMD system with `gpuAcceleration='auto'`:**

```
probe-gpu-encoders IPC → { nvenc: true, qsv: false }
                          ^^^ FALSE POSITIVE (compiled-in, not runtime)
detectGpuCapabilities →
  encoderInfo.nvenc = true → preferredEncoder = 'h264_nvenc'
  cachedCapabilities = { nvenc: true, qsv: false, preferredEncoder: 'h264_nvenc', ... }

resolveGpuConfig('auto', caps) →
  return { encoder: 'h264_nvenc', renderMode: 'webgl2' }
  ↑ THIS CAUSES THE EXPORT FAILURE ON AMD
```

**Where `amf` field needs to be added:**
1. `probeFFmpegEncoders()` — return `{ nvenc, qsv, amf }` (line ~76)
2. `detectGpuCapabilities()` — cachedCapabilities add `amf` field (line ~165)
3. JSDoc return types (lines ~72, ~128)
4. Encoder priority chain (line ~154): current `nvenc → qsv → libx264`, need `nvenc → amf → qsv → libx264`

**Note on priority order**: Since only one GPU vendor's encoder will actually work at runtime (after live-test fix), the order `nvenc → amf → qsv → libx264` or `amf → nvenc → qsv → libx264` doesn't functionally matter. The live test will determine which ONE works. Suggest keeping `nvenc` first (most common GPU) and adding `amf` second.

---

## Constraints Identified

1. **h264_amf pixel format constraint**: Only supports `nv12`, `yuv420p`, `d3d11`, `dxva2_vld`. `rgba` input to FFmpeg pipeline is auto-converted by swscale — no code change needed for streaming path, but this constraint must be documented.

2. **Live encoder test startup cost**: Each encoder test takes ~2-3 seconds. With 3 encoders (nvenc, amf, qsv) + libx264 (always works), total probe time ~6-9 seconds if run sequentially, or ~3 seconds if run in parallel. Acceptable for one-time startup probe.

3. **AMF QP range**: 0-51 (lower = better). -1 = auto/default. QP 18 for I-frames and 20 for P-frames approximates x264 CRF 17 for synthetic/text content.

4. **DLL dependencies**: `h264_amf` requires AMD driver's `amfrt64.dll` at runtime. `h264_nvenc` requires `nvcuda.dll`. Neither is present without proper GPU drivers installed.

5. **MP4 container finalization**: When FFmpeg streaming encode fails, the output MP4 lacks a moov atom. This makes the file unreadable for any re-encoding fallback. The broken streaming fallback path is fundamentally unfixable without changing the fallback strategy.

---

## Existing Patterns

**Encoder validation pattern** (used in `export-start` and `export-start-streaming`):
```js
const validEncoders = ['list', 'of', 'encoders'];
const resolvedEncoder = validEncoders.includes(encoder) ? encoder : 'libx264';
```
Simple whitelist validation. AMF just needs to be added to both lists.

**Encoder args dispatch pattern** (used in `export-finalize` and `export-start-streaming`):
```js
if (encoder === 'h264_nvenc') { /* NVENC args */ }
else if (encoder === 'h264_qsv') { /* QSV args */ }
else { /* libx264 args */ }
```
Straightforward if/else chain. Add `else if (encoder === 'h264_amf')` before the `else`.

**Fallback pattern** (both paths):
```js
if (encoder !== 'libx264') {
    // GPU failed, try CPU fallback
}
```
Already generic — works for any GPU encoder. No change needed.

**Capabilities caching pattern** (singleton with promise dedup):
```js
let cachedCapabilities = null;
let detectionPromise = null;
// ... detects once, caches forever, prevents parallel calls
```
Add `amf` field to cached object. No structural change needed.

---

## Recommendations

### Priority 1: Fix GPU probe (prevents ALL downstream issues)
Replace the `ffmpeg -encoders` string-search approach with live encoder tests:
```js
// For each encoder: spawn ffmpeg, check exit code
// h264_nvenc → exit 0 = available
// h264_amf   → exit 0 = available
// h264_qsv   → exit 0 = available
// libx264    → always available (CPU software encoder)
```
Run tests in parallel for speed. Cache results same as current pattern.

### Priority 2: Add h264_amf everywhere (12 locations)
Add to validEncoders, encoder args chains, capabilities object, JSDoc comments.

### Priority 3: Fix streaming fallback messaging (minimum)
Change error message when streaming GPU encode + fallback both fail:
```
"Video encode failed: h264_nvenc error. CPU fallback also failed because
the GPU encoder produced corrupt output. Try disabling GPU acceleration."
```
This is honest and actionable vs the current misleading message.

### Priority 4: Robust streaming fallback (desired, larger change)
After GPU streaming failure, signal the renderer to re-render frames via CPU path (canvas2d → PNG files → libx264). This requires an IPC message from main back to renderer and a re-export flow.

---

## Unknowns Remaining

1. **Will h264_amf actually work on AMD Radeon 8060S?** The user has AMD drivers installed, so `amfrt64.dll` should be present. But AMD AMF support in ffmpeg 6.1.1 on Windows can be sensitive to driver version. The live-test probe will answer this automatically.

2. **AMF quality with karaoke text**: CQP mode at qp_i=18/qp_p=20 should produce near-lossless output for static/text content, but this hasn't been verified with actual karaoke render output. The karaoke content is mostly flat backgrounds with sharp text edges — ideal for CQP encoding.

3. **Performance of AMF on Radeon 8060S**: Unknown encoding speed. For a 5:37 song at 30fps = 10,110 frames, even if AMF is only 2x realtime, it would finish in ~2.8 minutes. Should be acceptable.

4. **Interaction with `-pix_fmt rgba` stdin input**: While swscale should handle rgba→yuv420p conversion for AMF (as it does for NVENC/QSV), this specific combination hasn't been tested. The `h264_amf` encoder help shows `yuv420p` as supported input format, so FFmpeg's automatic conversion should work. If not, a `-vf "format=yuv420p"` filter may be needed.
