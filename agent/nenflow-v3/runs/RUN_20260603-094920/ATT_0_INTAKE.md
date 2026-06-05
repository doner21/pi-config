---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260603-094920
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~3%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
---

# Task Summary

The pi-orchestrator-extension's `/orchestrate` command handler was recently modified to show a live dashboard widget via `ctx.ui.setWidget("orchestrate", ...)`. After the orchestration completes, the widget persists indefinitely and breaks Pi's text input in new sessions. The widget must ONLY appear during active `/orchestrate` runs and must clear after completion, including on error/abort/timeout paths.

# Task Type

Bug fix — widget lifecycle management in a Pi TUI extension.

# User Intent

Make Pi usable again. The dashboard is helpful during orchestration but must not leak into normal Pi operation. Fix all cleanup paths so the widget is guaranteed to be removed after `/orchestrate` finishes.

# Goal Attractor

A PASS result where:
1. Normal Pi sessions (no orchestration running) show NO dashboard widget
2. `/orchestrate` shows the dashboard widget only during the run
3. Dashboard clears promptly after orchestration completes (success, failure, or abort)
4. Pi text input works normally before, during, and after orchestration

# Constraints

- Make minimal changes — do not rewrite the extension architecture
- Widget must use `setWidget` API (already implemented), but with proper lifecycle
- Must not break the orchestration flow (planner/executor/verifier shapes)

# Invariants

- `setWidget` and `setStatus` calls must always be paired with cleanup
- No widget state must survive between Pi sessions
- The command handler must clean up even if it throws

# Success Criteria

1. Widget cleared on all exit paths: success, failure, abort, timeout
2. No `setWidget`/`setStatus` called during extension loading
3. Pi editor input is not blocked by the widget
4. Tests still pass (`npm test`)

# Failure Criteria

- Widget remains visible after `/orchestrate` exits
- Pi text input is broken in a session that never ran `/orchestrate`

# Ambiguities

- Whether the `ctx.ui.setStatus` persistent footer status also contributes to breaking input
- Whether the widget's `placement` (default: aboveEditor) is safe or should be `belowEditor`
- Whether the `setTimeout` cleanup approach is sufficient or a `try/finally` wrapper is needed

# Routing Decision

- RESEARCH: spawn `pev-researcher` to inspect all source files for widget lifecycle issues, `setWidget`/`setStatus` call sites, and extension load hooks
- PLAN: spawn `pev-planner` with research findings
- EXECUTE: spawn `pev-executor` to implement fixes
- VERIFY: spawn `pev-verifier` to confirm all cleanup paths work

**Model routing (from user):** researcher uses deepseek-v4-pro, planner uses gpt-5.5, executor uses deepseek-v4-pro, verifier uses deepseek-v4-flash.

# Known Issues (from prior investigation)

1. **Widget never cleared:** The `ctx.ui.setWidget("orchestrate", ...)` calls in both success and failure paths of the command handler set widget content but never call `ctx.ui.setWidget("orchestrate", undefined)`.
2. **Timeout cleanup added but unverified:** A `setTimeout(..., 8000)` call was added to clear the widget in the success path, and `setTimeout(..., 12000)` in the failure path. This is fragile — if Pi exits before the timeout fires, cleanup doesn't happen.
3. **No try/finally guard:** If the command handler throws between setting the widget and the cleanup timeout, the timeout still fires but there's no synchronous cleanup guarantee.
4. **setStatus also persists:** `ctx.ui.setStatus("orchestrate", ...)` sets a footer status that may also survive between sessions.
