---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260603-094920
context_saturation_estimate: "~22%"
---

# Plan: Fix Widget Lifecycle Bug in /orchestrate Command Handler

## Task Statement

Fix the widget lifecycle bug in `src/index.ts` where the orchestrate dashboard widget persists indefinitely after `/orchestrate` completes, breaking Pi text input in subsequent sessions. The fix replaces fragile `setTimeout`-based cleanup with a `try/finally` guard that guarantees synchronous widget removal on all exit paths (success, error, abort, crash-recovery). Only `src/index.ts` is modified — no changes to shapes or substrate.

---

## Invariants

- `setWidget("orchestrate", ...)` and `setStatus("orchestrate", ...)` must always be paired with cleanup via `setWidget("orchestrate", undefined)` and `setStatus("orchestrate", undefined)`
- No widget state must survive between Pi sessions
- The command handler must clean up even if it throws, is aborted (AbortSignal), or Pi crashes
- Optional chaining (`?.`) must be preserved throughout — the extension must remain compatible with RPC/headless Pi
- Orchestration flow (planner/executor/verifier shapes) must not be altered
- No changes to `src/substrate.ts`, `src/shapes/plan-execute-verify.ts`, or `src/shapes/multi-verify-vote.ts` — they contain zero UI calls

---

## Success Criteria

1. **Widget cleared on all exit paths:** success, thrown error, AbortSignal abort, any uncaught exception
2. **No setTimeout window:** widget cleanup is synchronous in the `finally` block — no 8s/12s delay during which Pi session replacement could break
3. **Session-start defense:** `pi.on("session_start", ...)` clears any stale "orchestrate" widget that survived a prior Pi crash
4. **All 6 setWidget/setStatus call sites are covered:** publishProgress (x2), success path (x2), error path (x2) — all naturally cleaned by a single `finally`
5. **Pi editor input not blocked:** widget placement changed to `belowEditor` to avoid pushing editor down; primary fix (cleanup) renders placement secondary
6. **Existing tests pass:** `npm test` succeeds with no regressions

---

## Implementation Steps

All changes are in a single file: `C:/Users/doner/pi-orchestrator-extension/src/index.ts`

---

### Step 1: Add `pi.on("session_start")` safety net (at line 138, after `export default`)

**Rationale:** Defense-in-depth. If Pi crashes during orchestration, the `finally` block in the command handler never runs. The next Pi session would start with a stale widget. A `session_start` handler clears any leftover "orchestrate" widget before the user sees it.

**Exact change:** Insert after line 138 (`export default function (pi: ExtensionAPI) {`):

```typescript
  // Belt-and-suspenders: clear any stale orchestrate widget that may have
  // survived a prior session crash. The try/finally in the command handler
  // is the primary cleanup; this handles the crash-recovery case.
  pi.on?.("session_start", () => {
    // If Pi SDK provides a way to clear extension widgets from session lifecycle
    // hooks (e.g. pi.ui?.setWidget), use it here.  If not available, this is a
    // no-op and the try/finally remains the sole cleanup mechanism.
  });
```

**Note for Executor:** Confirm Pi SDK API surface on `pi` object inside `session_start` callback. If `pi.ui?.setWidget("orchestrate", undefined)` exists, use it. If not, document the limitation and rely on try/finally.

---

### Step 2: Restructure main orchestration try/catch into try/catch/finally wrapper

**Rationale:** This is the primary fix. A `finally` block guarantees widget cleanup regardless of how the try block exits (success, error, AbortSignal abort, or any uncaught exception). Eliminates both fragile `setTimeout` callbacks.

**Exact change:** Replace the block from line 246 (`try {`) through line 295 (`throw error;`) with a wrapped try/catch/finally structure.

**OLD (lines 246-295):**
```typescript
      try {
        const result = await runFromParams(commandParams, ctx.signal, (update) => {
          const text = extractProgressText(update);
          if (text) publishProgress(text);
        }, ctx);
        dashboard.status = "complete";
        dashboard.phase = "complete";
        const finalStatus = String((result.details as Record<string, unknown>)?.status ?? "done");
        ctx.ui.setStatus?.("orchestrate", `Orchestration complete: ${finalStatus}`);
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `complete: ${finalStatus}; final report inserted into editor/session.`),
        );
        // Clear the dashboard widget after a brief pause so the user sees the final
        // status, then normal Pi input is restored. Without this, the widget persists
        // indefinitely and can interfere with the editor.
        setTimeout(() => {
          ctx.ui.setWidget?.("orchestrate", undefined);
          ctx.ui.setStatus?.("orchestrate", undefined);
        }, 8000);
        ctx.ui.notify(
          `Orchestration complete: ${(result.details as Record<string, unknown>)?.status}`,
          (result.details as Record<string, unknown>)?.status === "pass" ? "info" : "warning",
        );
        pi.sendMessage({
          customType: "orchestrate-result",
          content: result.markdown,
          display: true,
          details: result.details,
        });
        if (ctx.hasUI) ctx.ui.setEditorText(result.markdown);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        dashboard.status = "failed";
        dashboard.phase = "failed";
        dashboard.lastMessage = message;
        appendDashboardMilestone(dashboard, `Failed: ${message}`);
        ctx.ui.setStatus?.("orchestrate", `Orchestration failed: ${message}`);
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `failed: ${message}`),
        );
        // Clear the dashboard widget after a brief pause so the user sees the error
        // status, then normal Pi input is restored.
        setTimeout(() => {
          ctx.ui.setWidget?.("orchestrate", undefined);
          ctx.ui.setStatus?.("orchestrate", undefined);
        }, 12000);
        ctx.ui.notify(`Orchestration failed: ${message}`, "error");
        throw error;
      }
```

**NEW:**
```typescript
      try {
        // Inner try/catch: handles success/failure display and re-throws errors.
        // Outer finally: guarantees widget cleanup on ALL exit paths.
        try {
          const result = await runFromParams(commandParams, ctx.signal, (update) => {
            const text = extractProgressText(update);
            if (text) publishProgress(text);
          }, ctx);
          dashboard.status = "complete";
          dashboard.phase = "complete";
          const finalStatus = String((result.details as Record<string, unknown>)?.status ?? "done");
          ctx.ui.setStatus?.("orchestrate", `Orchestration complete: ${finalStatus}`);
          ctx.ui.setWidget?.(
            "orchestrate",
            buildDashboardLines(dashboard, `complete: ${finalStatus}; final report inserted into editor/session.`),
          );
          ctx.ui.notify(
            `Orchestration complete: ${(result.details as Record<string, unknown>)?.status}`,
            (result.details as Record<string, unknown>)?.status === "pass" ? "info" : "warning",
          );
          pi.sendMessage({
            customType: "orchestrate-result",
            content: result.markdown,
            display: true,
            details: result.details,
          });
          if (ctx.hasUI) ctx.ui.setEditorText(result.markdown);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          dashboard.status = "failed";
          dashboard.phase = "failed";
          dashboard.lastMessage = message;
          appendDashboardMilestone(dashboard, `Failed: ${message}`);
          ctx.ui.setStatus?.("orchestrate", `Orchestration failed: ${message}`);
          ctx.ui.setWidget?.(
            "orchestrate",
            buildDashboardLines(dashboard, `failed: ${message}`),
          );
          ctx.ui.notify(`Orchestration failed: ${message}`, "error");
          throw error;
        }
      } finally {
        // GUARANTEED synchronous cleanup on all exit paths:
        // success, error, AbortSignal abort, any uncaught exception.
        // No setTimeout -- widget clears immediately after orchestration ends.
        ctx.ui.setWidget?.("orchestrate", undefined);
        ctx.ui.setStatus?.("orchestrate", undefined);
      }
```

**Key deltas:**

| What | Old | New |
|------|-----|-----|
| Cleanup mechanism | setTimeout(8000) / setTimeout(12000) | Synchronous finally block |
| Error re-throw | throw error at end of catch | throw error at end of catch (preserved) |
| Success display (notify, sendMessage, setEditorText) | After setTimeout reservation | Before finally (runs immediately, then finally cleans) |
| Widget peeking window | 8-12s (user sees final status) | ~0s (widget visible only while block executes, then cleared) |
| Coverage of publishProgress calls (line 233-234) | No cleanup pairing | Covered by finally (publishProgress sets widget; finally clears it) |

---

### Step 3: Add `placement: "belowEditor"` to all setWidget calls

**Rationale:** The default `aboveEditor` placement pushes the Pi text-editor down visually when the widget is present. `belowEditor` places the widget below the editor, reducing visual interference. This is a secondary fix — the `finally` block makes the placement largely irrelevant since the widget no longer persists. Still, it is the safer placement during active orchestration.

**Change 3a — Line 234 (publishProgress):**

OLD:
```typescript
        ctx.ui.setWidget?.("orchestrate", buildDashboardLines(dashboard));
```
NEW:
```typescript
        ctx.ui.setWidget?.("orchestrate", buildDashboardLines(dashboard), { placement: "belowEditor" });
```

**Change 3b — Lines 255-258 (success path):**

OLD:
```typescript
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `complete: ${finalStatus}; final report inserted into editor/session.`),
        );
```
NEW:
```typescript
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `complete: ${finalStatus}; final report inserted into editor/session.`),
          { placement: "belowEditor" },
        );
```

**Change 3c — Lines 284-286 (error path):**

OLD:
```typescript
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `failed: ${message}`),
        );
```
NEW:
```typescript
        ctx.ui.setWidget?.(
          "orchestrate",
          buildDashboardLines(dashboard, `failed: ${message}`),
          { placement: "belowEditor" },
        );
```

---

### Step 4: Verify all changes with npm test

**Command:**
```bash
cd C:/Users/doner/pi-orchestrator-extension && npm test
```

**Expected result:** All existing tests pass with zero failures. No test should fail due to these changes — the fix is purely a control-flow restructuring that does not alter orchestration semantics.

---

### Step 5: Write LATEST_PLAN.md alias

Path: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260603-094920/LATEST_PLAN.md`

Copy ATT_2_PLAN.md content to LATEST_PLAN.md (identical content, the alias for tooling convenience).

---

## Coverage Audit

All 6 call sites from Research Finding 2 are covered by the single `finally` block:

| # | Line | Call site | Covered by finally? |
|---|------|-----------|---------------------|
| 1 | 233 | setStatus (publishProgress) | YES |
| 2 | 234 | setWidget (publishProgress) | YES |
| 3 | 254 | setStatus (success path) | YES |
| 4 | 255-258 | setWidget (success path) | YES |
| 5 | 283 | setStatus (error path) | YES |
| 6 | 284-286 | setWidget (error path) | YES |

The `finally` block runs after success (covers 3,4), after error re-throw from catch (covers 5,6), and after abort/exception (covers 1,2 which would otherwise be orphaned). One cleanup pair clears ALL outstanding calls — widget key "orchestrate" is the same for every call site.

---

## Exit Path Analysis

| Exit path | Old behavior | New behavior |
|-----------|-------------|--------------|
| **Success** | setWidget then setTimeout(8s) cleanup | setWidget then finally clears immediately |
| **Error (throw in runFromParams)** | setWidget then setTimeout(12s) cleanup | setWidget in catch then throw then finally clears immediately |
| **AbortSignal abort** | Possible orphan widget (timeout may not fire) | finally clears immediately |
| **Uncaught exception in handler** | Orphan widget (no catch) | finally clears immediately |
| **Pi crash during orchestration** | Orphan widget (timeout never fires) | session_start handler clears on next Pi launch (defense-in-depth) |
| **Pre-try exits (invalid args, cancel, bad paradigm)** | No widget set (safe) | No change (still safe) |

---

## Handoff Notes

### Files changed
- **Only file:** `C:/Users/doner/pi-orchestrator-extension/src/index.ts`
- **Files NOT changed:** `src/substrate.ts`, `src/shapes/plan-execute-verify.ts`, `src/shapes/multi-verify-vote.ts` (zero UI calls — confirmed by Research Finding 1)

### Exact line ranges modified
- **Addition after line 138:** `pi.on("session_start", ...)` safety net (6 lines of comment + handler stub)
- **Replace lines 246-295:** try/catch to try/catch/finally (delete 50 lines, insert ~45 lines)
- **Line 234:** add `{ placement: "belowEditor" }` option to setWidget
- **Lines 255-258:** add `{ placement: "belowEditor" }` option to setWidget
- **Lines 284-286:** add `{ placement: "belowEditor" }` option to setWidget

### Deleted code (must be removed, not just commented out)
1. `setTimeout(() => { ctx.ui.setWidget?.("orchestrate", undefined); ctx.ui.setStatus?.("orchestrate", undefined); }, 8000);` (lines 262-265)
2. `setTimeout(() => { ctx.ui.setWidget?.("orchestrate", undefined); ctx.ui.setStatus?.("orchestrate", undefined); }, 12000);` (lines 290-293)
3. The comments "Clear the dashboard widget after a brief pause..." (lines 259-261 and 289)

### Preserved behavior
- `ctx.ui.notify(...)` — still fires on success and error (runs before finally cleanup)
- `pi.sendMessage(...)` — still persists orchestration result into session
- `ctx.ui.setEditorText(...)` — still replaces editor content with result markdown
- `throw error` — error is still re-thrown from catch block (finally runs after throw but before propagation)
- `publishProgress` callback — unchanged; sets widget repeatedly during orchestration (finally cleans it)

### Tradeoff accepted
- **Widget disappears immediately** after orchestration ends — no 8-12s "peek" at final status. The final result is still visible via `pi.sendMessage({ display: true })` (persisted into session) and `ctx.ui.notify(...)` (notification toast). This is a deliberate tradeoff: correctness (guaranteed cleanup) beats cosmetic delay.

### Unknowns
1. **Pi SDK `pi.on("session_start")` API surface:** The exact API for accessing UI context from session lifecycle hooks is not confirmed in the current codebase. The plan stubs the handler; the Executor must check Pi SDK docs (docs/extensions.md) for the correct API. If `pi.ui` is not available from session hooks, document the limitation.
2. **`setWidget` placement option:** The `{ placement: "belowEditor" }` option should be verified against Pi docs — it may be `"belowEditor"`, `"below_editor"`, or another string. The Executor should cross-reference Pi SDK docs before implementing.

### Reference: Pi SDK widget lifecycle
Per extensions.md: `ctx.ui.setWidget("name", lines)` shows widget; `ctx.ui.setWidget("name", undefined)` clears it. No automatic framework cleanup. Cleanup is the extension's responsibility.
