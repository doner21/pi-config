---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260603-ORCHPANEL
context_saturation_estimate: "~3%"
---

[PLANNER CONTEXT — START]
self_estimate: ~3%
context_handoff_threshold_percent: 65
threshold_source: default
health: HEALTHY
[PLANNER CONTEXT — END]

## Task Statement

Add a right-side orchestration status panel to the NenFlow v3 skill that displays: max-subagents N, max-retries N, concurrency N, paradigm `nenflow-v3`, per-LLM model assignments with task labels, and context window percentage of currently-working sub-agents. The panel is additive only — it must not break existing orchestration flow. Implementation uses Pi's public TUI API only (right-anchored overlay).

## Invariants

- **Do not break existing orchestration flow**: All NenFlow v3 phases (INTAKE → RESEARCH → PLAN → EXECUTE → VERIFY → retry) must execute exactly as before.
- **Do not modify core Pi TUI internals**: Use only public Pi TUI and extension APIs — `ctx.ui.custom()` with overlay options, `pi.events` event bus, `ctx.ui.setWidget()`, `fs` for shared-state files. Do not patch or monkey-patch the Pi TUI or subagent tool internals.
- **The panel is additive only**: Adding the panel must not alter subagent behavior, model routing, artifact naming, continuation handling, or any other orchestration logic.
- **No new npm dependencies**: All implementation uses Node.js built-in modules and Pi SDK imports (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`).
- **Must render within terminal width constraints**: Panel must degrade gracefully — hide when terminal width < 90 columns via the overlay `visible` callback.
- **The panel belongs on the right side**: Use overlay anchor `"right-center"`. Do not use `setWidget` (above/below only) or `setFooter` (bottom only).
- **Do not touch the run directory structure**: `RUN_CONFIG.json`, artifact paths, and continuation paths remain unchanged.
- **Model routing requirements from intake must be preserved**: deepseek/deepseek-v4-pro for planner, executor; deepseek/deepseek-v4-flash for verifier (from intake's routing requirements).

## Success Criteria

1. **Panel displays on right side**: Overlay panel renders at anchor `"right-center"` with correct width constraints during active NenFlow v3 runs.
2. **All required fields rendered**:
   - `max-subagents: N` — shows the max subagent count (1 for NenFlow v3 sequential mode)
   - `max-retries: N` — shows the Route D continuation retry limit (5)
   - `concurrency: N` — shows the concurrency level (1 for NenFlow v3 sequential)
   - `paradigm: nenflow-v3` — shows the paradigm name
   - Per-LLM model assignments — shows each subagent role tag paired with its model/provider
   - Context % — shows context window percentage for currently-running subagents, or "--" when idle
3. **Existing NenFlow v3 runs complete normally**: A full INTAKE → PLAN → EXECUTE → VERIFY run produces all expected artifacts with identical behavior and outputs regardless of panel presence.
4. **Panel updates in real-time**: When a subagent spawns, the panel reflects "working" state. When it completes, the panel updates to show the result and tally.
5. **Panel degrades gracefully on narrow terminals**: When terminal width < 90 columns, the overlay's `visible` callback returns `false`, hiding the panel. No errors or broken rendering.
6. **Only public Pi TUI APIs used**: No `require()` of internal Pi modules, no patching of `@earendil-works/pi-tui` internals. Only `ctx.ui.custom({ overlay: true, ... })` and `pi.events`.
7. **DeepSeek model routing intake compliance**: Planning model is deepseek/deepseek-v4-pro (planner agent). Execution model is deepseek/deepseek-v4-pro (coder agent). Verification model is deepseek/deepseek-v4-flash (reviewer agent as specified in intake contract).

## Implementation Steps

### Overview

The implementation has two parts: a **shared-state mechanism** (files + events) that bridges the NenFlow orchestrator → subagent → panel, and a **TUI panel extension** that renders the right-side overlay. These are additive and require no changes to core Pi internals.

**Architecture:**
```
[Orchestrator model]                      [OrchestrationPanel extension]
  |  writes ORCHESTRATION_HEADER.json         |  reads ORCHESTRATION_HEADER.json
  |                                           |  reads ORCHESTRATION_STATE.json
  v                                           |  listens to subagent:* events
[Subagent tool extension]  ── pi.events ──>  |  
  |  emits subagent:spawn                     |  renders overlay panel
  |  emits subagent:exit                       |
  v
[pi subprocess]  (isolated)
```

### Step 1: Add subagent lifecycle events to the subagent extension

**File:** `~/.pi/agent/extensions/subagent.ts`

Add three `pi.events.emit()` calls to the subagent tool's `execute()` handler:

1. **Before spawning** (after agent validation, before `runSubagent()`): emit `"subagent:spawn"` with payload `{ agentName, task, model, provider, startTime: ISO-8601 }`
2. **On success** (after `runSubagent()` resolves): emit `"subagent:exit"` with payload `{ agentName, exitCode: 0, endTime: ISO-8601, contextTokens }`
3. **On failure** (in catch block): emit `"subagent:exit"` with payload `{ agentName, exitCode: 1, endTime: ISO-8601, errorMessage }`

**Exact change points in `subagent.ts`:**
- Import `pi.events` is already available via the `pi: ExtensionAPI` parameter in the factory function.
- In the `execute` method, after `const agent = agents.find(...)` validation succeeds and before `const result = await runSubagent(...)`:

```typescript
// ADD: emit spawn event
pi.events.emit("subagent:spawn", {
  agentName: agent.name,
  task: params.task,
  model: agent.model ?? ctx.model?.id,
  provider: agent.provider ?? ctx.model?.provider,
  startTime: new Date().toISOString(),
});
```

- After `const result = await runSubagent(...)` succeeds (lines ~204-230 in current code), ADD:

```typescript
// ADD: emit exit event on success
pi.events.emit("subagent:exit", {
  agentName: agent.name,
  exitCode: 0,
  endTime: new Date().toISOString(),
  model: result.metadata?.model || agent.model,
  provider: result.metadata?.provider || agent.provider,
});
```

- In the `catch` block (lines ~231-243), ADD before the return:

```typescript
// ADD: emit exit event on failure
pi.events.emit("subagent:exit", {
  agentName: params.agent,
  exitCode: 1,
  endTime: new Date().toISOString(),
  errorMessage: error?.message,
});
```

**Validation:** After adding these events, run any existing NenFlow v3 test that uses subagents and verify the events are emitted in the extension console (add `console.error("[subagent event]", event)` if needed during development; remove after verification).

### Step 2: Create shared state file definitions

Create two schema files for the shared state:

**File:** `~/.pi/agent/nenflow-v3/schemas/ORCHESTRATION_HEADER.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["run_id", "paradigm", "maxSubagents", "maxRetries", "concurrency", "roles"],
  "properties": {
    "run_id": { "type": "string" },
    "paradigm": { "type": "string", "default": "nenflow-v3" },
    "maxSubagents": { "type": "integer" },
    "maxRetries": { "type": "integer" },
    "concurrency": { "type": "integer" },
    "roles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["agentName", "role", "model", "provider"],
        "properties": {
          "agentName": { "type": "string" },
          "role": { "type": "string" },
          "model": { "type": "string" },
          "provider": { "type": "string" }
        }
      }
    }
  }
}
```

**File:** `~/.pi/agent/nenflow-v3/schemas/ORCHESTRATION_STATE.schema.json` — (reference only; actual state file is written by the extension)

The state file tracks per-subagent runtime status:
```json
{
  "run_id": "RUN_...",
  "phase": "PLAN",
  "updated_at": "ISO-8601",
  "subagents": [
    {
      "agentName": "planner",
      "role": "planner",
      "model": "deepseek-v4-pro",
      "provider": "deepseek",
      "task": "Produce implementation plan...",
      "status": "running" | "completed" | "failed" | "pending",
      "startTime": "ISO-8601",
      "endTime": "ISO-8601 or null",
      "exitCode": null | 0 | 1,
      "contextTokens": null | number
    }
  ]
}
```

### Step 3: Update NenFlow v3 SKILL.md — add header-config writing step

**File:** `~/.pi/agent/skills/nenflow-v3/SKILL.md`

Add a new section **after** the `## Run Setup` section and **before** `## Artifact Rules`. Insert the following:

```markdown
## Orchestration Status Panel

When a run begins, the orchestrator must write an `ORCHESTRATION_HEADER.json` file in the run directory so that the right-side orchestration status panel can render static configuration. After `RUN_CONFIG.json` is written and BEFORE spawning the first role subagent, write:

```
~/.pi/agent/nenflow-v3/runs/{run_id}/ORCHESTRATION_HEADER.json
```

With this content:
```json
{
  "run_id": "{run_id}",
  "paradigm": "nenflow-v3",
  "maxSubagents": 1,
  "maxRetries": 5,
  "concurrency": 1,
  "roles": [
    {
      "agentName": "pev-researcher",
      "role": "researcher",
      "model": "deepseek-v4-pro",
      "provider": "deepseek"
    },
    {
      "agentName": "pev-planner",
      "role": "planner",
      "model": "deepseek-v4-pro",
      "provider": "deepseek"
    },
    {
      "agentName": "pev-executor",
      "role": "executor",
      "model": "deepseek-v4-pro",
      "provider": "deepseek"
    },
    {
      "agentName": "pev-verifier",
      "role": "verifier",
      "model": "deepseek-v4-flash",
      "provider": "deepseek"
    }
  ]
}
```

The orchestrator model uses the `write` tool to create this file. The `roles` array reflects the actual model routing defined in the intake contract for this run. If the user specifies different models, update the `roles` array accordingly.

After the run completes (after VERIFY phase), delete `ORCHESTRATION_HEADER.json` and `ORCHESTRATION_STATE.json` from the run directory (or write `{ "completed": true }` to the state file so the panel hides itself).
```

Also add this instruction to the `## User-Facing Behavior` section:

```markdown
- When the orchestration panel extension is active, the orchestrator writes `ORCHESTRATION_HEADER.json` and updates `ORCHESTRATION_STATE.json` at phase transitions (use the `write` tool with the files in the run directory).
```

### Step 4: Create the orchestration panel extension

**File:** `~/.pi/agent/extensions/nenflow-orchestration-panel.ts`

Create a Pi extension that:

1. **On `session_start`**, checks for active NenFlow runs by scanning `~/.pi/agent/nenflow-v3/runs/` for the most recent `ORCHESTRATION_HEADER.json` that has no associated completion marker
2. **Reads `ORCHESTRATION_HEADER.json`** to populate the static panel header (max-subagents, max-retries, concurrency, paradigm, role-to-model mapping)
3. **Listens to `pi.events`** for `"subagent:spawn"` and `"subagent:exit"` events, updating `ORCHESTRATION_STATE.json` in the active run directory
4. **Renders a right-side overlay panel** via `ctx.ui.custom()` with `{ overlay: true, overlayOptions: { anchor: "right-center", ... } }`
5. **Registers a command `/nenflow-panel`** to manually show/hide the panel

**Component structure:**

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container, Spacer, Text } from "@earendil-works/pi-tui";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

interface OrchestrationHeader {
  run_id: string;
  paradigm: string;
  maxSubagents: number;
  maxRetries: number;
  concurrency: number;
  roles: Array<{ agentName: string; role: string; model: string; provider: string }>;
}

interface SubagentState {
  agentName: string;
  role: string;
  task: string;
  status: "running" | "completed" | "failed" | "pending";
  model?: string;
  provider?: string;
  startTime?: string;
  endTime?: string;
  exitCode?: number | null;
  contextTokens?: number | null;
}

interface OrchestrationState {
  run_id: string;
  phase: string;
  updated_at: string;
  totalSubagents: number;
  completedSubagents: number;
  workingSubagents: number;
  contextPercent: number | null;
  subagents: SubagentState[];
}
```

**Panel component class (OrchestrationPanel):**

```typescript
class OrchestrationPanel {
  private tui: any;
  private theme: any;
  private header: OrchestrationHeader;
  private state: OrchestrationState;
  private done: () => void;
  private cachedWidth?: number;
  private cachedLines?: string[];

  constructor(tui: any, theme: any, header: OrchestrationHeader, done: () => void) {
    this.tui = tui;
    this.theme = theme;
    this.header = header;
    this.done = done;
    this.state = this.buildInitialState();
  }

  // Read from ORCHESTRATION_STATE.json and update this.state
  refreshState(): void { /* ... fs.readFileSync ... */ }
  
  // Write current state to ORCHESTRATION_STATE.json
  persistState(): void { /* ... fs.writeFileSync ... */ }

  handleInput(data: string): void {
    // Escape closes the panel (but keeps state file)
    if (matchesKey(data, "escape")) { this.done(); return; }
    // 'r' refreshes from disk
    if (data === "r") { this.refreshState(); this.invalidate(); this.tui.requestRender(); }
  }

  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;
    
    const theme = this.theme;
    const h = this.header;
    const s = this.state;
    const lines: string[] = [];
    
    // ── Title bar ──
    lines.push(theme.fg("accent", theme.bold(" NenFlow v3 Orchestration ")));
    lines.push(theme.fg("dim", "─".repeat(Math.min(width - 2, 40))));
    
    // ── Config section ──
    lines.push("");
    lines.push(theme.fg("accent", theme.bold("Config")));
    lines.push(`  max-subagents : ${h.maxSubagents}`);
    lines.push(`  max-retries   : ${h.maxRetries}`);
    lines.push(`  concurrency   : ${h.concurrency}`);
    lines.push(`  paradigm      : ${h.paradigm}`);
    
    // ── Model Assignments ──
    lines.push("");
    lines.push(theme.fg("accent", theme.bold("Model Assignments")));
    for (const role of h.roles) {
      const modelStr = `${role.provider}/${role.model}`;
      const color = role.role === "executor" ? "success" : 
                    role.role === "verifier" ? "warning" : "accent";
      lines.push(`  ${theme.fg(color, role.agentName.padEnd(16))} ${theme.fg("dim", "→")} ${theme.fg("muted", role.role.padEnd(10))} ${modelStr}`);
    }
    
    // ── Status section ──
    lines.push("");
    lines.push(theme.fg("accent", theme.bold("Status")));
    const phaseColor = s.phase === "ERROR" ? "error" : "success";
    lines.push(`  phase         : ${theme.fg(phaseColor, s.phase)}`);
    
    const workingPct = s.totalSubagents > 0 
      ? `${Math.round((s.completedSubagents / s.totalSubagents) * 100)}%`
      : "--";
    const ctxPct = s.contextPercent !== null ? `${s.contextPercent}%` : "--";
    lines.push(`  progress      : ${s.completedSubagents}/${s.totalSubagents} (${workingPct})`);
    lines.push(`  context       : ${ctxPct}`);
    
    // ── Per-subagent status ──
    lines.push("");
    lines.push(theme.fg("accent", theme.bold("Subagents")));
    if (s.subagents.length === 0) {
      lines.push(theme.fg("dim", "  (none yet)"));
    } else {
      for (const agent of s.subagents) {
        const statusIcon = agent.status === "running" ? theme.fg("warning", "◌") :
                           agent.status === "completed" ? theme.fg("success", "✓") :
                           agent.status === "failed" ? theme.fg("error", "✗") :
                           theme.fg("dim", "○");
        const shortTask = agent.task.length > 30 ? agent.task.slice(0, 27) + "..." : agent.task;
        lines.push(`  ${statusIcon} ${theme.fg("accent", agent.agentName)} ${theme.fg("dim", shortTask)}`);
        if (agent.model) {
          lines.push(`    ${theme.fg("muted", `${agent.provider || "?"}/${agent.model}`)}`);
        }
        if (agent.contextTokens && agent.status === "running") {
          lines.push(`    ${theme.fg("warning", `ctx: ~${agent.contextTokens} tokens`)}`);
        }
      }
    }
    
    // ── Footer ──
    lines.push("");
    lines.push(theme.fg("dim", "─".repeat(Math.min(width - 2, 40))));
    lines.push(theme.fg("dim", " esc:close  r:refresh"));
    
    this.cachedWidth = width;
    this.cachedLines = lines.map(l => l.slice(0, width)); // truncate to width
    return this.cachedLines;
  }

  invalidate(): void {
    this.cachedWidth = undefined;
    this.cachedLines = undefined;
  }

  private buildInitialState(): OrchestrationState {
    return {
      run_id: this.header.run_id,
      phase: "INTAKE",
      updated_at: new Date().toISOString(),
      totalSubagents: this.header.roles.length,
      completedSubagents: 0,
      workingSubagents: 0,
      contextPercent: null,
      subagents: this.header.roles.map(r => ({
        agentName: r.agentName,
        role: r.role,
        task: "",
        status: "pending",
        model: r.model,
        provider: r.provider,
      })),
    };
  }
}
```

**Extension factory function:**

```typescript
export default function (pi: ExtensionAPI) {
  const NENFLOW_HOME = path.join(os.homedir(), ".pi", "agent", "nenflow-v3");
  const RUNS_DIR = path.join(NENFLOW_HOME, "runs");
  
  function findActiveRunDir(): string | null {
    if (!fs.existsSync(RUNS_DIR)) return null;
    const dirs = fs.readdirSync(RUNS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(RUNS_DIR, d.name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs); // newest first
    for (const dir of dirs) {
      const headerPath = path.join(dir, "ORCHESTRATION_HEADER.json");
      const statePath = path.join(dir, "ORCHESTRATION_STATE.json");
      if (fs.existsSync(headerPath)) {
        // Check if completed
        if (fs.existsSync(statePath)) {
          try {
            const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
            if (state.completed) continue; // skip completed runs
          } catch {}
        }
        return dir;
      }
    }
    return null;
  }

  // Listen for subagent lifecycle events
  pi.events.on("subagent:spawn", (data: any) => {
    const runDir = findActiveRunDir();
    if (!runDir) return;
    const statePath = path.join(runDir, "ORCHESTRATION_STATE.json");
    let state: OrchestrationState;
    try {
      state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
      return; // no state file yet, nothing to update
    }
    
    // Update the matching subagent
    for (const agent of state.subagents) {
      if (agent.agentName === data.agentName) {
        agent.status = "running";
        agent.task = data.task || "";
        agent.startTime = data.startTime;
        agent.model = data.model || agent.model;
        agent.provider = data.provider || agent.provider;
        break;
      }
    }
    
    // Recalculate working count
    state.workingSubagents = state.subagents.filter(s => s.status === "running").length;
    state.updated_at = new Date().toISOString();
    
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  });

  pi.events.on("subagent:exit", (data: any) => {
    const runDir = findActiveRunDir();
    if (!runDir) return;
    const statePath = path.join(runDir, "ORCHESTRATION_STATE.json");
    let state: OrchestrationState;
    try {
      state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
      return;
    }
    
    for (const agent of state.subagents) {
      if (agent.agentName === data.agentName) {
        agent.status = data.exitCode === 0 ? "completed" : "failed";
        agent.exitCode = data.exitCode;
        agent.endTime = data.endTime;
        agent.contextTokens = data.contextTokens || null;
        break;
      }
    }
    
    state.workingSubagents = state.subagents.filter(s => s.status === "running").length;
    state.completedSubagents = state.subagents.filter(
      s => s.status === "completed" || s.status === "failed"
    ).length;
    
    // Estimate context percent from latest running agent
    const runningAgent = state.subagents.find(s => s.status === "running");
    state.contextPercent = runningAgent?.contextTokens || null;
    
    state.updated_at = new Date().toISOString();
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  });

  // Register the /nenflow-panel command
  pi.registerCommand("nenflow-panel", {
    description: "Show or hide the NenFlow v3 orchestration status panel",
    handler: async (_args, ctx) => {
      const runDir = findActiveRunDir();
      if (!runDir) {
        ctx.ui.notify("No active NenFlow v3 run found.", "info");
        return;
      }
      
      const headerPath = path.join(runDir, "ORCHESTRATION_HEADER.json");
      const statePath = path.join(runDir, "ORCHESTRATION_STATE.json");
      
      let header: OrchestrationHeader;
      try {
        header = JSON.parse(fs.readFileSync(headerPath, "utf8"));
      } catch {
        ctx.ui.notify("ORCHESTRATION_HEADER.json not found or invalid.", "error");
        return;
      }
      
      // Show the overlay panel
      ctx.ui.custom((tui, theme, _kb, done) => {
        const panel = new OrchestrationPanel(tui, theme, header, done);
        
        // Try to load existing state
        const statePath_ = path.join(runDir, "ORCHESTRATION_STATE.json");
        if (fs.existsSync(statePath_)) {
          try {
            const s = JSON.parse(fs.readFileSync(statePath_, "utf8"));
            (panel as any).state = s;
          } catch {}
        } else {
          // Write initial state file
          const initialState = (panel as any).buildInitialState();
          fs.writeFileSync(statePath_, JSON.stringify(initialState, null, 2));
          (panel as any).state = initialState;
        }
        
        // Set up periodic refresh for live state file updates
        const refreshInterval = setInterval(() => {
          if (fs.existsSync(statePath_)) {
            try {
              const s = JSON.parse(fs.readFileSync(statePath_, "utf8"));
              (panel as any).state = s;
              panel.invalidate();
              tui.requestRender();
            } catch {}
          }
        }, 1000);
        
        // Original done wraps cleanup
        const originalDone = done;
        const wrappedDone = () => {
          clearInterval(refreshInterval);
          originalDone();
        };
        (panel as any).done = wrappedDone;
        
        return {
          render: (w: number) => panel.render(w),
          invalidate: () => panel.invalidate(),
          handleInput: (data: string) => { panel.handleInput(data); tui.requestRender(); },
        };
      }, {
        overlay: true,
        overlayOptions: {
          anchor: "right-center",
          width: "32%",
          minWidth: 35,
          maxHeight: "90%",
          margin: { right: 1, top: 1, bottom: 1 },
          visible: (termWidth: number) => termWidth >= 90,
        },
      });
    },
  });

  // On session start with an active run, update the state file's phase
  pi.on("session_start", async (_event, ctx) => {
    const runDir = findActiveRunDir();
    if (runDir) {
      const statePath = path.join(runDir, "ORCHESTRATION_STATE.json");
      if (fs.existsSync(statePath)) {
        try {
          const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
          state.phase = "INTAKE";
          state.updated_at = new Date().toISOString();
          fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        } catch {}
      }
    }
  });
}
```

### Step 5: Update NenFlow v3 SKILL.md to update ORCHESTRATION_STATE.json phase

**File:** `~/.pi/agent/skills/nenflow-v3/SKILL.md`

In the `## Required Orchestration Shape` section, add after each phase step an instruction to update `ORCHESTRATION_STATE.json`:

After "1. ORCHESTRATOR INTAKE in current session":
```markdown
   - After writing ATT_0_INTAKE.md, update ORCHESTRATION_STATE.json phase to "INTAKE" (use write tool)
```

After "3. PLAN":
```markdown
   - After PLAN subagent returns, update ORCHESTRATION_STATE.json phase to "PLAN_COMPLETE" (use write tool)
```

After "4. EXECUTE":
```markdown
   - After EXECUTE subagent returns, update ORCHESTRATION_STATE.json phase to "EXECUTE_COMPLETE" (use write tool)
```

After "5. VERIFY":
```markdown
   - After VERIFY subagent returns, update ORCHESTRATION_STATE.json phase to "COMPLETE" (use write tool)
   - Write `{ "completed": true }` to ORCHESTRATION_STATE.json so the panel knows to hide
```

**Important:** The orchestrator model uses the `edit` or `write` tool to update the JSON file. The phase field is a single string — overwriting the entire file via `write` is simplest.

### Step 6: Write unit tests for the panel component

**File:** `~/.pi/agent/nenflow-v3/tests/orchestration-panel.test.ts`

Create a standalone Node.js test (not a Pi extension test) that imports the panel component and verifies:

```typescript
// Test 1: Panel renders all required fields
//   - Verify render output contains "max-subagents", "max-retries", "concurrency", "paradigm"
//   - Verify model assignments are rendered for each role
//   - Verify context percentage is "--" when no agents are working

// Test 2: Panel updates when state changes
//   - Set a subagent to "running" status, verify render shows "◌" indicator
//   - Set a subagent to "completed" status, verify render shows "✓" indicator
//   - Set contextTokens, verify render shows context token count

// Test 3: Panel handles empty state gracefully
//   - Render with no subagents, verify "(none yet)" is shown

// Test 4: Panel respects width constraints
//   - Render at width 30, verify no line exceeds 30 characters
//   - Render at width 80, verify all content fits

// Test 5: Overlay visibility callback
//   - At termWidth 85, visible() returns false
//   - At termWidth 95, visible() returns true
```

The test file uses `require("assert")` only. Since the panel component is a TypeScript class in an extension, the test imports the component class directly (or a stripped-down copy for testing).

Run tests with:
```bash
node ~/.pi/agent/nenflow-v3/tests/orchestration-panel.test.ts
```

### Step 7: Manual integration test

After all changes are in place:

1. Start a NenFlow v3 run: in a Pi session, invoke the nenflow-v3 skill with a simple test task
2. Run `/nenflow-panel` to show the panel — verify it appears on the right side
3. As each subagent is spawned (visible in the main chat), verify the panel updates:
   - Subagent status icon changes from ○ to ◌ to ✓
   - Model info is shown
   - Phase updates at each orchestration step
4. After the run completes, verify the panel shows "COMPLETE" phase
5. Test with a narrow terminal: resize to 80 columns, verify panel auto-hides without errors
6. Run the same test without the panel: verify identical behavior and outputs

## Handoff Notes

### Key Facts

- **Files to create** (4 files):
  1. `~/.pi/agent/extensions/nenflow-orchestration-panel.ts` — Panel extension with overlay component, event listeners, `/nenflow-panel` command
  2. `~/.pi/agent/nenflow-v3/schemas/ORCHESTRATION_HEADER.schema.json` — Schema for the orchestrator-written header config
  3. `~/.pi/agent/nenflow-v3/schemas/ORCHESTRATION_STATE.schema.json` — Schema for the extension-managed subagent state
  4. `~/.pi/agent/nenflow-v3/tests/orchestration-panel.test.ts` — Unit tests for the panel component
- **Files to modify** (2 files — additive changes only):
  1. `~/.pi/agent/extensions/subagent.ts` — Add 3 `pi.events.emit()` calls (spawn, exit-success, exit-failure)
  2. `~/.pi/agent/skills/nenflow-v3/SKILL.md` — Add `ORCHESTRATION_HEADER.json` writing instruction + phase update steps
- **Run directory**: `~/.pi/agent/nenflow-v3/runs/RUN_20260603-ORCHPANEL/` — existing research at `ATT_1_RESEARCH.md`
- **Research artifact**: `~/.pi/agent/nenflow-v3/runs/RUN_20260603-ORCHPANEL/ATT_1_RESEARCH.md` — comprehensive analysis of TUI integration points and gaps
- **TUI integration point**: `ctx.ui.custom()` with `{ overlay: true, overlayOptions: { anchor: "right-center", width: "32%", minWidth: 35, visible: (termWidth) => termWidth >= 90 } }`

### Decisions

1. **Overlay over widget/footer**: Overlay is the only TUI API that supports right-side anchoring. Widgets only support above/below editor. Footer is bottom-bar only and single-instance.

2. **File-based state sharing over event-only**: `pi.events` are ephemeral (lost on restart, not available before extension loads). File-based state in `ORCHESTRATION_STATE.json` provides durability and allows the panel extension to pick up state even if started mid-run.

3. **Hybrid update mechanism**: `pi.events` for real-time subagent lifecycle (fast, in-process) + `ORCHESTRATION_STATE.json` written by the event listeners (durable, file-based) + periodic 1-second file polling in the panel component (catches state written between panel activation). This triple mechanism ensures robustness.

4. **NenFlow v3 is sequential by design**: `maxSubagents: 1`, `concurrency: 1`. This is correct — the skill spawns subagents one at a time. The panel reflects this accurately.

5. **Context percentage is best-effort**: The subagent tool's `contextTokens` field from `usage.totalTokens` on the last `message_end` is the best available proxy for subagent context saturation. There is no real-time stream of context usage from subprocesses. The panel shows `"--"` when no context data is available.

6. **Model routing from intake contract**: The `roles` array in `ORCHESTRATION_HEADER.json` captures the model-to-role mapping. For this run: planner=deepseek/deepseek-v4-pro, executor=deepseek/deepseek-v4-pro, verifier=deepseek/deepseek-v4-flash, researcher=deepseek/deepseek-v4-pro. The orchestrator writes these when creating the header file.

### Unknowns / Risks

- **Subagent extension may not be loaded**: If the user's Pi configuration doesn't include the subagent extension, `pi.events` for subagent lifecycle won't fire. The panel will still work but won't get real-time subagent state updates — it will rely on the 1-second file polling to detect phase transitions written by the orchestrator model.
- **File write contention**: The orchestrator model writes `ORCHESTRATION_STATE.json` for phase updates while the extension writes it for subagent state. These writes should not overlap in practice (phase updates happen between subagent spawns), but a `writeFileSync` could theoretically clobber the other. Mitigation: the panel extension always reads the latest state file before appending new subagent state.
- **Terminal width auto-hide**: The `visible: (termWidth) => termWidth >= 90` callback hides the panel on narrow terminals. If a user resizes during a run, the panel disappears but state tracking continues. The panel can be re-shown with `/nenflow-panel`.
- **No IPC between extension and subprocess**: Subagent subprocesses run as separate `pi` processes. The extension can only observe them through `pi.events` emitted by the subagent tool in the parent process. Subprocess context saturation is approximated from the last message_end usage data, not live-telemetered.

### For the Executor

- Read `ATT_0_INTAKE.md` (from orchestrator) for full context before starting — this plan's scope is only the orchestration status panel addition.
- Read `ATT_1_RESEARCH.md` at this run directory for detailed TUI API reference, subagent architecture analysis, and existing state tracking gaps.
- The implementation order should be: Step 1 (subagent extension events) → Step 4 (panel extension) → Step 2 (schemas — while coding the extension) → Step 3 (SKILL.md update) → Step 5 (SKILL.md phase updates) → Step 6 (tests) → Step 7 (integration test).
- Produce `ATT_3_EXECUTION.md` (Execution Report) and `ATT_3_VERIFIER_BRIEF.md` after implementation.
- Model routing: Executor runs as deepseek/deepseek-v4-pro (coder agent) per intake contract.
- All TUI code must use Pi's public API only: imports from `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui`.

[PLANNER CONTEXT — END]
self_estimate: ~3%
