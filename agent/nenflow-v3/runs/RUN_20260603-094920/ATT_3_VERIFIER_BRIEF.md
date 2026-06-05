---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260603-094920
for_role: VERIFIER
---

# Verifier Brief — Widget Lifecycle Fix

## What the Executor Changed

**Single file modified:** `C:/Users/doner/pi-orchestrator-extension/src/index.ts`

Three targeted edits:

1. **Lines 141–147:** Added `pi.on?.("session_start", ...)` handler that clears "orchestrate" widget+status on session start (crash-recovery safety net).

2. **Lines 254–302:** Restructured the command handler's try/catch into try/catch/finally:
   - `finally` block synchronously calls `ctx.ui.setWidget?.("orchestrate", undefined)` and `ctx.ui.setStatus?.("orchestrate", undefined)`
   - Deleted both `setTimeout(..., 8000)` and `setTimeout(..., 12000)` cleanup calls
   - Added `{ placement: "belowEditor" }` to setWidget in both success and error paths

3. **Line 243:** Added `{ placement: "belowEditor" }` to publishProgress's setWidget call.

**Files NOT changed:** `src/substrate.ts`, `src/shapes/plan-execute-verify.ts`, `src/shapes/multi-verify-vote.ts`

## Verification Checklist

### Correctness Checks

- [ ] `finally` block contains exactly `setWidget?.("orchestrate", undefined)` and `setStatus?.("orchestrate", undefined)` — no other side effects
- [ ] Both old `setTimeout` cleanup calls (8s and 12s) are completely removed from the source
- [ ] `throw error` is preserved at end of inner catch block (line 294)
- [ ] `ctx.ui.notify(...)` in success path runs BEFORE `finally` cleanup (inside inner try)
- [ ] `pi.sendMessage(...)` in success path runs BEFORE `finally` cleanup
- [ ] `ctx.ui.setEditorText(...)` in success path runs BEFORE `finally` cleanup
- [ ] `pi.on?.("session_start", ...)` uses optional chaining for RPC/headless Pi compatibility
- [ ] Session_start handler clears both widget AND status for key "orchestrate"
- [ ] All three setWidget calls use `{ placement: "belowEditor" }` (line 243, 271, 293)
- [ ] No `setWidget`/`setStatus` calls remain unpaired with cleanup (all 6 call sites covered by finally)

### Non-Regression Checks

- [ ] `npm test` exits 0 — do not take the Executor's word; run it yourself
- [ ] Pre-try exit paths (invalid args, empty task, bad paradigm) remain unchanged — they call `return` before any widget is set

### Scope Checks

- [ ] `src/substrate.ts` — untouched
- [ ] `src/shapes/plan-execute-verify.ts` — untouched
- [ ] `src/shapes/multi-verify-vote.ts` — untouched
- [ ] `runFromParams()` function body — untouched
- [ ] `registerTool` callback — untouched

### Edge Case Checks

- [ ] What if `ctx.ui` is undefined (RPC mode)? All calls use `?.`, so they no-op safely
- [ ] What if `pi.on` is undefined? Uses `pi.on?.(...)`, so it no-ops safely
- [ ] Does `finally` block run if `runFromParams` throws before the inner try? (No — runFromParams is inside the inner try, which is inside the outer try, so finally always fires)
- [ ] Does `finally` block run if AbortSignal fires during `runFromParams`? (Yes — the thrown AbortError propagates through inner try→catch→finally)

## Verdict Criteria

- **PASS:** All correctness checks pass AND `npm test` exits 0 AND no file beyond src/index.ts was modified
- **FAIL:** Any correctness check fails, test regression, or unexpected file modification
