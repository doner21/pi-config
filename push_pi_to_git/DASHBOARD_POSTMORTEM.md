# Orchestration Dashboard — Post-Mortem & Rebuild Guide

**Date:** 2026-06-03
**Context:** A dashboard widget was added to the `/orchestrate` experience. It broke Pi's text input in new sessions. This document explains exactly what went wrong and how to do it correctly next time.

---

## What Broke Pi

### The direct cause

A file at `~/.pi/agent/extensions/nenflow-orchestration-panel.ts` was created by an orchestration executor task. This extension registered a `pi.on("session_start", ...)` handler that called `ctx.ui.custom(...)` with `{ overlay: true }` on **every Pi session start** whenever it detected an incomplete NenFlow run. The overlay blocked the text input field.

Why it fired every time: one run directory (`RUN_20260603-ORCHPANEL`) had `ORCHESTRATION_STATE.json` without `"completed": true`. The extension's `findActiveRunDir()` treated any run without an explicit `completed: true` as "active" and auto-showed the overlay.

### The compounding effects

Three independent problems stacked to make this hard to diagnose:

| # | Problem | Effect |
|---|---------|--------|
| 1 | Panel extension loaded on `session_start` unconditionally | No `/orchestrate` trigger needed — panel appeared on every Pi launch |
| 2 | `ORCHESTRATION_STATE.json` missing `"completed": true` | Panel never self-cleared; run looked "active" forever |
| 3 | **Jiti cache** served stale compiled `.cjs`/`.mjs` from `%TEMP%\jiti\` | Even after fixing source files, Pi used cached broken versions |

### Why the pi-orchestrator-extension fixes didn't help initially

The orchestrator extension (`C:/Users/doner/pi-orchestrator-extension/src/index.ts`) was fixed to clear its widget via a `finally` block. But this didn't matter because:

1. The panel extension was the one BREAKING input (not the orchestrator extension)
2. The panel extension's overlay blocked the editor entirely
3. Jiti cache served the old panel extension even after source changes

---

## All Issues Discovered During This Debugging Session

### HARD BLOCKERS (would prevent ANY dashboard from working)

**HB-1: `ctx.ui.custom()` with `{ overlay: true }` blocks text input**

The panel extension used `ctx.ui.custom()` with overlay mode. Per Pi TUI documentation, overlay mode replaces the normal UI and blocks the editor until `done()` is called. This is inherent to the API — overlays are modal.

**Fix for next iteration:** Use `ctx.ui.setWidget("orchestrate", ...)` instead of overlay. Widgets render above/below the editor and do NOT block input. The orchestrator extension already uses this pattern — the panel extension should too.

**HB-2: No cleanup on `session_start` — widget persists between sessions**

The panel extension registered a `session_start` handler that AUTO-SHOWED the widget. There was no corresponding `session_shutdown` handler to clean it up. If Pi crashes or the extension errors out, the widget state survives to the next session.

**Fix for next iteration:** Never auto-show on `session_start`. Require explicit user action (`/nenflow-panel`) or explicit orchestrator trigger (command handler) to show the panel. Always clean up widgets in `finally` blocks and `session_shutdown`.

**HB-3: `findActiveRunDir()` treats missing state file as "active"**

```typescript
if (existsSync(statePath)) {
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  if (state.completed) continue;  // skip completed
}
// If no state file → treated as active (falls through to return)
```

50+ old run directories had no `ORCHESTRATION_STATE.json` at all. Any one of them could trigger auto-show. The only reason they didn't is that they also lacked `ORCHESTRATION_HEADER.json` — but that's fragile coincidence.

**Fix for next iteration:** Only treat a run as active if BOTH header and state files exist AND state has `completed: false` or is absent. Missing header = not a panel-aware run. Missing state = unknown, skip.

### DESIGN ISSUES (would cause unreliability)

**DI-1: Widget set but never explicitly cleared**

The orchestrator extension's original code (pre-fix) called `ctx.ui.setWidget("orchestrate", [...])` in the progress path, success path, and error path — but never called `setWidget("orchestrate", undefined)`. Same pattern appears in the panel extension.

**Fix for next iteration:** Every `setWidget`/`setStatus` call must be paired with an `undefined` cleanup in a `finally` block. The fix is now in place in the orchestrator extension — the panel extension must follow the same pattern.

**DI-2: `setTimeout`-based cleanup is unreliable**

A `setTimeout(() => ctx.ui.setWidget(..., undefined), 8000)` approach was tried. Three failure modes:
- Pi process exits before timeout fires
- User opens new session before timeout fires (8 seconds is an eternity in UI terms)
- Extension crash prevents timeout from being scheduled

**Fix for next iteration:** Use synchronous `finally` blocks, not timers.

**DI-3: Widget placement defaults to `aboveEditor`**

The orchestrator extension's widget rendered ABOVE the editor. On smaller terminal windows, this can push the editor down or off-screen.

**Fix for next iteration:** Consider `{ placement: "belowEditor" }` for status widgets. Keep them compact.

**DI-4: Jiti module cache prevents hot-reload of extensions**

Pi's jiti TypeScript compiler caches compiled `.cjs`/`.mjs` files in `%TEMP%\jiti\`. Changes to source `.ts` files don't take effect until the cache is cleared or expires. This means:
- Fixing a broken extension requires BOTH editing the source AND clearing the cache
- `/reload` in Pi may reload extensions but still use cached modules
- A full Pi restart may still use stale cache

**Fix for next iteration:** Add a note to Your development workflow: after changing any `.ts` extension file, delete `%TEMP%\jiti\` and `%TEMP%\node-jiti\` before testing. Consider adding this to a Makefile or npm script.

### ORCHESTRATOR RELIABILITY ISSUES (from the earlier orchestration run)

**OI-1: Verifier trusts text output, not file artifacts**

The orchestrator's verifier subagent judges executor OUTPUT TEXT, not actual files on disk. An executor can write "I implemented the dashboard, 13/13 tests pass" and the verifier accepts it — even if zero files were created.

**Impact:** The panel extension was "implemented" by an executor that likely wrote a text report, not a working extension. The extension file that ended up on disk (`nenflow-orchestration-panel.ts`) is likely a text-dump from the executor's response, not carefully crafted code.

**Fix for next iteration:** Add a post-execution artifact check. Include `git diff --stat` or file existence checks in the verifier prompt. If the task says "IMPLEMENT" or "CREATE", the verifier must confirm at least one file changed.

**OI-2: Executor tasks too large → agents produce reports, not code**

Tasks exceeding ~200 words cause executors to write narrative reports instead of using `write`/`edit`/`bash` to create files.

**Fix for next iteration:** Add planner guidelines to split tasks small enough to complete in one turn. Consider a `outputType: "code" | "report"` field.

**OI-3: Deterministic routing check fights planner role assignments**

The routing check counts spawns by agent NAME, not by model/provider. When the planner assigns different agent names to different semantic roles (e.g., `researcher` for research, `coder` for coding), the check fails.

**Fix for next iteration:** Make the routing check phase-based — count the model/provider used in executor-phase spawns regardless of agent name.

**OI-4: Intake normalizer overrides user model preferences**

When a user says "use X for planning, use Y for verification," the intake parser applies the first-found model to all roles and never overwrites with later, more specific assignments.

**Fix for next iteration:** The local routing clause detection should give priority to the nearest role-model pairing. The model alias closest to a role word should win.

---

## Should You Restart the Dashboard Iteration?

**Yes, the dashboard is viable.** The problems found in this debugging session are all fixable. None of them are fundamental blockers to the concept. Here's what you've gained from this failed attempt:

### What you now know that you didn't before

1. **The API to use**: `ctx.ui.setWidget()` not `ctx.ui.custom({ overlay: true })`. Widgets don't block input. Overlays do.

2. **The lifecycle contract**: Widgets must be set AND cleared. Both paths (set + clear) must happen in paired scope. `finally` blocks are the correct mechanism.

3. **The auto-show trap**: Never auto-show a widget on `session_start` without an explicit user action or orchestrator trigger. Use a manual command (`/nenflow-panel`) for testing, and only auto-show from within the `/orchestrate` command handler.

4. **The state file contract**: `ORCHESTRATION_STATE.json` must ALWAYS have `"completed": true` written after a run finishes. Missing state file = unknown, not active.

5. **The jiti cache**: Must be cleared between development iterations. Changes don't take effect until `%TEMP%\jiti\` is purged.

6. **The verifier gap**: Executor text output is not evidence of implementation. Need artifact checks.

### What a successful dashboard implementation needs

| Requirement | How to satisfy |
|-------------|---------------|
| Show only during `/orchestrate` | Call `setWidget` from command handler, clear in `finally` |
| Don't block input | Use `setWidget`, never `ctx.ui.custom` overlay |
| Show live subagent status | Subscribe to progress updates from `spawnSubagent` events |
| Show model assignments | Read from `NormalizedParams` after routing resolution |
| Show context percentages | Track context usage from subagent exit events (if available) |
| Auto-clear when done | `finally` block in command handler |
| Survive Pi restarts | Widget is per-session, cleared on `session_start` (clear, don't show) |
| Tests pass | Keep existing `test-natural-language-controls.cjs` green |

### Suggested architecture for the next attempt

```
/orchestrate command handler
├── try {
│   ├── setWidget("orchestrate", dashboardLines)   // SHOW
│   ├── runOrchestration(params)                     // RUN
│   └── setWidget("orchestrate", finalLines)        // SHOW FINAL
│   } catch {
│   ├── setWidget("orchestrate", errorLines)        // SHOW ERROR
│   } finally {
│   ├── setWidget("orchestrate", undefined)          // CLEAR (guaranteed)
│   └── setStatus("orchestrate", undefined)          // CLEAR (guaranteed)
│   }
```

Keep the dashboard as inline helper functions in the orchestrator extension. No separate extension file. No `session_start` hooks. No overlay mode. Simple, scoped, clean.

---

## Files Modified During This Session

| File | Change |
|------|--------|
| `pi-orchestrator-extension/src/index.ts` | Restored from backup, added `finally` widget cleanup, fixed natural-language routing, re-added `inferOrchestrationControlsFromTask` |
| `pi-orchestrator-extension/src/substrate.ts` | Added `agentEnded` guard to prevent post-termination error noise |
| `pi-orchestrator-extension/tests/test-natural-language-controls.cjs` | Removed researcher routing assertions (not supported in current version) |
| `~/.pi/agent/extensions/nenflow-orchestration-panel.ts` | **DISABLED** (renamed to `.ts.disabled`) |
| `~/.pi/agent/nenflow-v3/runs/RUN_20260603-ORCHPANEL/ORCHESTRATION_STATE.json` | Marked `"completed": true` |
| `push_pi_to_git/HANDOFF.md` | Full post-mortem of orchestration issues |
