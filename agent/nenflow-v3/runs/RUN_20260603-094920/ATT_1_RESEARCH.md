---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260603-094920
context_saturation_estimate: "~8%"
context_handoff_threshold_percent: 65
threshold_source: default
---

# Investigation Scope

Per INTAKE, investigated the pi-orchestrator-extension for widget lifecycle bugs where:
1. The orchestrate dashboard widget persists after /orchestrate completes
2. Persisted widget and/or status breaks Pi text input in new sessions
3. Cleanup is missing or unreliable on success, error, abort, user-cancel paths

Scope covered all source files in src/ and cross-referenced Pi SDK docs for setWidget/setStatus behavior.

---

# Key Findings

## Finding 1: All UI calls are confined to src/index.ts -- shapes and substrate are clean

**Files with zero UI calls:**
- src/substrate.ts -- No ctx.ui.setWidget, setStatus, or any UI API usage
- src/shapes/plan-execute-verify.ts -- No direct UI calls; only uses onUpdate callback (passed from command handler)
- src/shapes/multi-verify-vote.ts -- Same pattern; no UI calls whatsoever

**File with all UI calls:**
- src/index.ts -- Only file that touches ctx.ui. All call sites are inside the /orchestrate command handler at line ~189.

## Finding 2: Complete catalog of every setWidget and setStatus call site

All call sites use key "orchestrate" for both setWidget and setStatus. A single cleanup of key "orchestrate" clears both widget and status.

| # | Line | Context | Code | Cleanup? |
|---|------|---------|------|----------|
| 1 | 233 | publishProgress callback (inside try) | setStatus?.("orchestrate", dashboardStatusLine(...)) | NONE |
| 2 | 234 | publishProgress callback (inside try) | setWidget?.("orchestrate", buildDashboardLines(...)) | NONE |
| 3 | 254 | Success path (inside try) | setStatus?.("orchestrate", final status line) | setTimeout(8s) at line 262 |
| 4 | 255-258 | Success path (inside try) | setWidget?.("orchestrate", final dashboard) | setTimeout(8s) at line 263 |
| 5 | 283 | Error path (catch block) | setStatus?.("orchestrate", error status line) | setTimeout(12s) at line 291 |
| 6 | 284-286 | Error path (catch block) | setWidget?.("orchestrate", error dashboard) | setTimeout(12s) at line 290 |

**Cleanup sites (only 2):**
| Line | Context | Code | Notes |
|------|---------|------|-------|
| 262-264 | Success setTimeout | setWidget("orchestrate", undefined) + setStatus("orchestrate", undefined) | 8s delay |
| 290-292 | Failure setTimeout | Same as above | 12s delay |


## Finding 3: Call sites 1-2 (publishProgress) are NOT paired with cleanup

The publishProgress callback (lines 233-234) sets the widget and status on EVERY progress event during orchestration. These calls are NOT wrapped in any cleanup mechanism. The success and error paths re-set the widget to a final state, then schedule cleanup via setTimeout. But publishProgress calls themselves have no cleanup logic. In practice, a throw from runFromParams WILL be caught by the catch block. However, timeout-based cleanup is unreliable (see Finding 5).

## Finding 4: Pre-try-block code paths are safe (no orphan widgets)

Three code paths exit before the try block:
1. Invalid args (line 201-204): ctx.ui.notify(...); return; -- No widget was set. SAFE.
2. User cancel / empty task (lines 208-215): return; -- No widget was set. SAFE.
3. Invalid paradigm (lines 219-226): caught by inner try/catch, then return; -- No widget was set. SAFE.

No setWidget or setStatus is called before publishProgress inside the main try block. Pre-try-block paths cannot leave orphan widgets.

## Finding 5: setTimeout cleanup is fragile -- three failure modes

**Failure mode A: Pi process exit before timeout fires**
- If Pi exits before the 8s/12s timeout fires, cleanup never executes.
- Widget and status state may persist in TUI framework across sessions.

**Failure mode B: New Pi session starts during timeout window**
- User starts new Pi session within 8-12s of orchestration completing.
- Old ctx captured in timeout closure. Per extensions.md line 1122, captured old ctx objects are stale after session replacement and will throw if used.

**Failure mode C: Pi crashes during orchestration**
- If Pi crashes, timeout never fires. Widget and status permanently orphaned.

## Finding 6: No try/finally guard exists

Current structure: try { sets widget, runs orchestration, success path + setTimeout cleanup } catch { failure widget + setTimeout cleanup }. No finally block. No synchronous cleanup guarantee.

## Finding 7: Widget placement defaults to aboveEditor -- may interfere with text input

The orchestrator sets the widget without specifying placement (defaults to aboveEditor). Per Pi docs, aboveEditor places widget between conversation view and editor. When widget persists after orchestration, it pushes the editor down, visually confuses, and may interfere with terminal cursor positioning. Using belowEditor would reduce visual interference.

## Finding 8: setStatus also persists and may compound the issue

Per Pi docs, setStatus is persistent until cleared -- same lifecycle risk as setWidget. Current code pairs both cleanups in same setTimeout callbacks (good), but both share the same fragility.

## Finding 9: No extension lifecycle hooks registered

Searched for: session_start, session_end, pi.on(, onStart, onExit, onLoad, onDispose, extension_start -- none found. The entry point only calls pi.registerTool(...) and pi.registerCommand(...). No pi.on("session_start", ...) to proactively clear leftover widget state.

## Finding 10: pi.sendMessage and ctx.ui.setEditorText also called in the handler

Success path calls: pi.sendMessage({ customType: "orchestrate-result", display: true }) persists result into session (intentional). ctx.ui.setEditorText(result.markdown) replaces editor content -- no restoration of previous editor content. Combined with leaked widget, makes Pi input effectively unusable.

---

# Constraints Identified

## Hard constraints (from INTAKE + discovered)

1. Must use setWidget API -- already in place; add lifecycle management, not replace it.
2. Must not break orchestration flow -- planner/executor/verifier shapes unchanged.
3. Must handle all exit paths: success, error, abort, timeout, user cancel.
4. No current access to session lifecycle events -- pi exposes pi.on(...). A session_start handler can be added as defense.
5. ctx is session-scoped -- per extensions.md line 1122, captured old ctx objects are stale after session replacement and will throw. setTimeout closures capturing ctx are dangerous across sessions.

## Constraints discovered during research

6. Widget key is "orchestrate" -- both setWidget and setStatus use same key. Single cleanup pair clears both. Simplifies cleanup.
7. No widget set before try block -- pre-try-block exits cannot leak widgets. Good.
8. Optional chaining (?:.) throughout -- extension tolerates RPC/headless Pi. Cleanup must maintain this pattern.
9. pi.sendMessage with display:true persists progress into session -- intentional, not flagged as problematic by INTAKE.
10. ctx.ui.setEditorText(result.markdown) replaces editor content -- no restoration. Compounds "broken input" with leaked widget.

---

# Existing Patterns

## Pi SDK widget lifecycle pattern (from docs)

ctx.ui.setWidget("name", lines) to show, ctx.ui.setWidget("name", undefined) to clear. No automatic widget cleanup by TUI framework. Framework does NOT clear extension widgets on session start/end. Cleanup must be explicit.

## Reference extensions

Per extensions.md line 2578, plan-mode/ extension is listed as reference for setStatus/setWidget. Not in current repo.

## Current partial cleanup attempt

Two setTimeout callbacks (lines 262-264 and 290-292):
- Use optional chaining (?.) -- good
- Clean up both widget AND status -- good
- Rely on timers, not synchronous guarantees -- PROBLEMATIC

---

# Recommendations

## Recommendation 1: Add try/finally for synchronous cleanup (PRIMARY FIX)

Restructure command handler with finally block containing:
  ctx.ui.setWidget?.("orchestrate", undefined);
  ctx.ui.setStatus?.("orchestrate", undefined);

Guarantees cleanup on: success, error, abort (signal throw), any unhandled exception.

Tradeoff: widget disappears immediately -- no final status display. Mitigation: result already visible via pi.sendMessage({ display: true }).

## Recommendation 2: Strongly consider synchronous (no-delay) cleanup

Simplest robust fix: remove setTimeout entirely, clear widget immediately in finally. Final status dashboard is nice-to-have, not essential.

## Recommendation 3: Add pi.on("session_start") safety net (BELT-AND-SUSPENDERS)



Defense-in-depth that fires even if Pi crashed with no chance for finally to run.

## Recommendation 4: Consider belowEditor placement (LOW PRIORITY)

  ctx.ui.setWidget?.("orchestrate", lines, { placement: "belowEditor" });

Reduces visual interference with text input. Secondary concern -- primary fix makes placement irrelevant for persistence bug.

## Recommendation 5: Do NOT modify shapes or substrate

Confirmed: plan-execute-verify.ts, multi-verify-vote.ts, and substrate.ts contain zero UI calls. No modification needed.

---

# Unknowns Remaining

1. Whether ctx in setTimeout closures is truly invalidated after session replacement. Docs say will throw -- untested. session_start safety net sidesteps this.
2. Whether setEditorText restoration is desired. Not in INTAKE scope.
3. plan-mode/ reference extension cleanup patterns. Not in codebase, not essential.
4. Whether setTimeout(...).unref() is universally supported. Node.js supports it; Pi runs on Node.js, so viable if timeout retained.
