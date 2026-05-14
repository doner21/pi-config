---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: run-2026-05-13-export-stall
---

# ATT_3_VERIFIER_BRIEF — MP4 Export Stall Fix

## Success Criteria Evidence

### SC-1: close listener attached before stdin.end() in export-finalize-streaming

**Status**: ✅ PASS

**Evidence**: Source code at `electron/main.js`:
- Line 569: `const encodePromise = new Promise((resolve, reject) => {` — creates promise, attaches `close` listener at line 570
- Line 586: `const encodeTimeoutPromise = ...` — creates timeout promise
- Line 590: `exp.ffmpegProcess.stdin.end();` — ends stdin AFTER both listeners are attached
- The old bug pattern (`stdin.end()` then attach listener) has been removed

**Verification command**:
```
grep -n "encodePromise\|stdin.end()" electron/main.js | head -5
```
Expected output: `encodePromise` line number < `stdin.end()` line number

---

### SC-2: FFmpeg close wait has 30s timeout

**Status**: ✅ PASS

**Evidence**: Three timeout wrappers confirmed in `electron/main.js`:

1. **Encode**: Line 586 `ENCODE_TIMEOUT_MS = 30000`, line 594 `Promise.race([encodePromise, encodeTimeoutPromise])`
2. **Audio mix**: Lines 665-668 `Promise.race([audioMixPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Audio mix timed out after 30s')), 30000))])`
3. **Video+audio combine**: Lines 694-697 `Promise.race([combinePromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Video+audio combine timed out after 30s')), 30000))])`

**Verification command**:
```
grep -c "30000" electron/main.js
```
Expected: at least 3 occurrences (one per timeout site)

---

### SC-3: Streaming path has NVENC-to-libx264 fallback structurally mirroring CPU path

**Status**: ✅ PASS

**Evidence**: `electron/main.js` lines 595-632:
- Line 597: `if (exp.encoder && exp.encoder !== 'libx264')` — gate condition
- Line 599: `const fallbackVideoPath = exp.videoOnlyPath.replace('.mp4', '_fallback.mp4')`
- Line 605: `'-c:v', 'libx264', '-preset', 'slow'` — same encoder + preset as CPU fallback (line 321)
- Line 606: `'-crf', '17', '-tune', 'animation'` — same quality flags as CPU fallback (line 322)
- Line 625: `await fs.promises.rename(fallbackVideoPath, exp.videoOnlyPath)` — replaces video path
- Fallback itself has `Promise.race` timeout (lines 613-615)
- Error message: `'Video encode failed: ' + exp.encoder + ' error. CPU fallback also failed. Try disabling GPU acceleration.'`

**Verification commands**:
```
grep -A 3 "GPU encoder fallback" electron/main.js
grep "libx264" electron/main.js | grep -c fallback
```

---

### SC-4: Frame retry loop has max retry guard

**Status**: ✅ PASS

**Evidence**: `src/utils/electronExport.js`:
- Line 201: `const RETRY_LIMIT = 20;`
- Line 202: `let retries = 0;`
- Line 240: `retries++;` — increments on each backpressure retry
- Line 241: `if (retries > RETRY_LIMIT)` — cap check
- Line 242: `throw new Error('Frame ' + i + ' retry limit exceeded. FFmpeg may have crashed.');` — escalates to error
- Line 248: `retries = 0;` — resets on non-backpressure failures (separate error type)

**Verification command**:
```
grep -n "RETRY_LIMIT\|retries" src/utils/electronExport.js
```
Expected: `RETRY_LIMIT` at line 201, `retries` at lines 202, 240, 241, 248

---

### SC-5: npm test passes with zero failures

**Status**: ✅ PASS

**Evidence**:
```
✓ src/editor/__tests__/undoStack.test.js (26 tests) 3ms
✓ src/editor/__tests__/jsonAdapters.test.js (20 tests) 5ms
✓ src/editor/__tests__/tokenTransforms.test.js (50 tests) 7ms

Test Files  3 passed (3)
     Tests  96 passed (96)
  Duration  264ms
```

**Verification command**:
```
npm test
```
Expected: exit code 0, 3 files passed, 96 tests passed

---

### SC-6: Code builds without errors

**Status**: ✅ PASS

**Evidence**:
```
✓ 1744 modules transformed.
✓ built in 1.60s
```

**Verification command**:
```
npm run build
```
Expected: exit code 0, build completes

---

## Invariant Verification Commands

| # | Invariant | Command |
|---|-----------|---------|
| 1 | No CPU regressions | `npm test` (all 3 suites pass) |
| 2 | No rendering changes | `git diff --name-only` → no karaokeDrawerGL.js, karaokeDrawer.js, gpuCapabilities.js |
| 3 | IPC contract unchanged | `grep "ipcMain.handle" electron/main.js` → same handler names |
| 4 | UI unchanged | `git diff --name-only` → no useKaraokeExport.js |
| 5 | Error paths preserved | All `catch` blocks remain, no `try` blocks removed |
| 6 | Race fixed | `grep -A 2 "encodePromise" electron/main.js` → listener before stdin.end() |

---

## Files Modified (Complete List)

| File | Change Summary |
|------|---------------|
| `electron/main.js` | Race fix (listener before stdin.end), 3 timeout guards (encode/mix/combine), GPU→CPU encoder fallback |
| `src/utils/electronExport.js` | Retry cap (RETRY_LIMIT=20) on backpressure loop |

## Files Confirmed Untouched

- `src/utils/karaokeDrawerGL.js`
- `src/utils/karaokeDrawer.js`
- `src/utils/gpuCapabilities.js`
- `src/hooks/useKaraokeExport.js`
- `src/utils/fastExport.js`
- All `src/editor/__tests__/` files

---

## Known Gaps (for manual/integration testing)

1. The race condition fix cannot be unit-tested without an Electron+FFmpeg integration environment
2. The GPU encoder fallback path cannot be verified without an NVIDIA GPU with NVENC
3. Manual verification scripts (`test_gpu_split.js`, `test_parity.js`) require audio files and a Python/Demucs venv
4. `verify-rendering.js` requires a running dev server for visual inspection
