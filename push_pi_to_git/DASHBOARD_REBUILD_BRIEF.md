# Dashboard Rebuild — Agent Brief

**Context:** You are taking over the implementation of a live orchestration-status dashboard for the Pi `/orchestrate` command. A previous iteration broke Pi's text input and had to be completely reverted. This brief captures everything learned from that failure so your implementation succeeds.

---

## What the dashboard should do

When a user runs `/orchestrate`, display a compact status panel on screen showing:

| Field | Source |
|-------|--------|
| `max-subagents N` | from normalized params (explicit or natural-language) |
| `max-retries N` | from normalized params |
| `concurrency N` | from normalized params |
| `paradigm <name>` | e.g. `plan-execute-verify` or `multi-verify-vote` |
| Model for each LLM role | `planner → provider/model`, `executor → provider/model`, `verifier → provider/model` |
| Task assigned to each LLM | task ID and description for each subagent |
| Context / working % | X of Y subagents active, context usage if available |

The dashboard must:
- **Appear only during active `/orchestrate` runs** — never on session start
- **Clear automatically** when orchestration finishes (success, failure, or abort)
- **Not block Pi's text input field** — the editor must remain usable

---

## API to use: `ctx.ui.setWidget()`

Use `ctx.ui.setWidget(name, lines)` to render the dashboard. This API renders content above or below the editor without blocking input.

**Do NOT use `ctx.ui.custom()` with `{ overlay: true }`.** Overlays are modal — they block the entire editor including text input. This was the direct cause of Pi becoming unusable in the previous attempt.

Example pattern:
```typescript
// During orchestration — update live
ctx.ui.setWidget("orchestrate", buildDashboardLines(state));

// When done — CLEAR (this is mandatory)
ctx.ui.setWidget("orchestrate", undefined);
ctx.ui.setStatus("orchestrate", undefined);
```

## Lifecycle contract (non-negotiable)

Every `setWidget` must be paired with a cleanup. Use this pattern:

```typescript
try {
    ctx.ui.setWidget("orchestrate", buildDashboardLines(state));   // SHOW
    await runOrchestration(params);                                  // RUN
    ctx.ui.setWidget("orchestrate", buildFinalLines(state));        // SHOW FINAL
} catch (error) {
    ctx.ui.setWidget("orchestrate", buildErrorLines(state, error)); // SHOW ERROR
    throw error;
} finally {
    ctx.ui.setWidget("orchestrate", undefined);                     // CLEAR (guaranteed)
    ctx.ui.setStatus("orchestrate", undefined);                     // CLEAR (guaranteed)
}
```

The `finally` block guarantees cleanup on ALL exit paths: success, thrown error, abort signal, early return.

**Do NOT use `setTimeout` for cleanup.** It fails if Pi exits before the timer fires, if the user opens a new session, or if the extension crashes.

## Architecture: inline in the command handler

Keep the dashboard as inline helper functions in `src/index.ts`, within the `/orchestrate` command handler. Do NOT create a separate extension file. A separate extension file auto-loads on every Pi session and can break input if it sets widgets on `session_start`.

Functions to implement (all in `src/index.ts`):
- `createOrchestrateDashboard(task: string): DashboardState` — initialize state
- `updateDashboardFromProgress(state: DashboardState, message: string): void` — parse progress messages to update agent statuses
- `buildDashboardLines(state: DashboardState, footer?: string): string[]` — render lines for setWidget
- `dashboardStatusLine(state: DashboardState): string` — single status line for setStatus

## Development workflow

After changing any `.ts` extension file, you MUST clear Pi's jiti module cache before testing:

```bash
rm -rf %TEMP%\jiti %TEMP%\node-jiti
```

Without this, Pi will serve stale compiled `.cjs`/`.mjs` files and your changes won't take effect. This caused hours of confusion in the previous attempt — the source was fixed but Pi was running cached broken code.

Always run `npm test` after changes:
```bash
cd C:/Users/doner/pi-orchestrator-extension && npm test
```

---

## Issues resolved during the previous iteration

These are already fixed and must NOT be re-broken:

### 1. `agentEnded` guard in `src/substrate.ts`
Subagent Pi processes emit `agent_end` to signal completion, then can emit additional `message_end` events with `stopReason=error` during internal shutdown. The substrate now ignores post-`agent_end` error events. Do not remove this guard.

### 2. Widget cleanup via `finally` block
The `/orchestrate` command handler now has a `finally` block that clears `setWidget("orchestrate", undefined)` and `setStatus("orchestrate", undefined)`. Preserve this pattern.

### 3. Disabled panel extension
`~/.pi/agent/extensions/nenflow-orchestration-panel.ts` has been renamed to `.ts.disabled`. This extension was the DIRECT cause of Pi becoming unusable — it auto-showed an overlay on `session_start`. Do not re-enable it without fixing the auto-show behavior.

### 4. Natural-language controls restored
Functions `inferOrchestrationControlsFromTask`, `firstNumberMatch`, `parseNaturalNumber`, and `extractNamedPerspectives` were restored to `src/index.ts` after a backup restoration. Do not remove them — the test suite depends on them.

---

## Files you will modify

| File | What to change |
|------|---------------|
| `C:/Users/doner/pi-orchestrator-extension/src/index.ts` | Add dashboard helper functions to the `/orchestrate` command handler |
| `C:/Users/doner/pi-orchestrator-extension/tests/test-natural-language-controls.cjs` | May need test updates |

## Files you must NOT modify

| File | Reason |
|------|--------|
| `C:/Users/doner/pi-orchestrator-extension/src/substrate.ts` | Contains `agentEnded` guard — critical fix |
| `C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts` | Shape logic — no dashboard code belongs here |
| `C:/Users/doner/pi-orchestrator-extension/src/shapes/multi-verify-vote.ts` | Shape logic — no dashboard code belongs here |
| `C:/Users/doner/.pi/agent/extensions/nenflow-orchestration-panel.ts.disabled` | Stay disabled |

## Key source locations in index.ts

- Line ~198: `runFromParams()` — called by both tool and command
- Line ~235-290: `/orchestrate` command handler — **this is where dashboard code goes**
- Line ~445: `normalizeParams()` — normalized params available here
- Line ~1001: `buildRoutingRequirements()` — model assignments per role

## Testing

After implementation, verify:
1. `npm test` passes (natural-language controls regression)
2. Normal Pi session (no `/orchestrate`): no dashboard visible, input works
3. Run `/orchestrate "test task"`: dashboard appears during run, clears after completion
4. Run `/orchestrate` with invalid args: dashboard clears, error shown
5. Abort `/orchestrate` mid-run: dashboard clears
