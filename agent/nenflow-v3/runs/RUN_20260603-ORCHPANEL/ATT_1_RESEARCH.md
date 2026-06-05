---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RESEARCH_PREP
context_saturation_estimate: "~10%"
sources_consulted:
  - "~/.pi/agent/skills/nenflow-v3/SKILL.md"
  - "~/.pi/agent/extensions/subagent/index.ts + agents.ts"
  - "{pi-pkg}/docs/tui.md"
  - "{pi-pkg}/docs/extensions.md"
  - "{pi-pkg}/examples/extensions/overlay-qa-tests.ts"
  - "{pi-pkg}/examples/extensions/custom-footer.ts"
  - "{pi-pkg}/examples/extensions/widget-placement.ts"
  - "{pi-pkg}/examples/extensions/plan-mode/index.ts"
  - "~/.pi/agent/nenflow-v3/context-policy.js"
  - "~/.pi/agent/nenflow-v3/validator.js"
---

# ATT_1 — Research: NenFlow v3 Orchestration Status Panel Integration Points

## Research Scope

Investigate the NenFlow v3 orchestration codebase to map all components, event hooks, and state tracking points relevant to building a right-side orchestration status panel.

---

## 1. NenFlow v3 Orchestration Flow

### 1.1 Skill Architecture

**File:** `~/.pi/agent/skills/nenflow-v3/SKILL.md`

The NenFlow v3 skill runs as a **prompt-template + skill workflow** in the visible Pi session. The orchestrator (current model) performs INTAKE itself and spawns subagents for RESEARCH, PLAN, EXECUTE, and VERIFY.

**Orchestration phases (linear chain):**
```
INTAKE → RESEARCH (optional) → PLAN → EXECUTE → VERIFY → [retry if FAIL]
```

**Subagents spawned via the `subagent` tool:**
- `pev-researcher` — lightweight discovery agent
- `pev-planner` — produces structured implementation plan
- `pev-executor` — implements the plan, produces Execution Report + Verifier Brief
- `pev-verifier` — independently confirms PASS or FAIL

**Key invocation pattern (from the skill):**
- Each subagent call must include: run_id, INTAKE path, active upstream artifacts, `RUN_CONFIG.json` path, `context_handoff_threshold_percent`, exact output paths, exact continuation path

### 1.2 Run State Tracking

**`RUN_CONFIG.json`** (stored at `~/.pi/agent/nenflow-v3/runs/{run_id}/RUN_CONFIG.json`):
```json
{
  "schema_version": 1,
  "run_id": "RUN_...",
  "context_handoff": {
    "handoff_threshold_percent": 40,
    "threshold_source": "user_prompt|intake|default",
    "warning_threshold_percent": 35,
    "hard_risk_threshold_percent": 45
  }
}
```

**`.nenflow_context_health.json`** (global shared health file at `~/.pi/agent/nenflow-v3/.nenflow_context_health.json`):
```json
{
  "run_id": "RUN_...",
  "phase": "INTAKE|RESEARCH|PLAN|EXECUTE|VERIFY|ERROR",
  "measured_at": "ISO-8601",
  "orchestrator_session": "current-visible-session"
}
```

**Artifact naming:**
- `ATT_0_INTAKE.md`, `ATT_1_RESEARCH.md`, `ATT_1_PLAN.md` or `ATT_2_PLAN.md`, `ATT_n_EXECUTION.md`, `ATT_n_VERIFIER_BRIEF.md`, `ATT_n_VERIFICATION.md`
- `LATEST_*` aliases for each artifact type

### 1.3 Route D — Context Handoff Continuation

When a subagent hits the context threshold, it writes a `CONTINUATION_CONTRACT` instead of its normal artifact. The orchestrator validates and spawns a fresh same-role subagent. Contracts follow strict format with `Work Completed`, `Work Remaining`, `Critical Context`, and `Resume Instruction` sections.

### 1.4 Context Policy

**File:** `~/.pi/agent/nenflow-v3/context-policy.js`

```javascript
DEFAULT_HANDOFF_THRESHOLD_PERCENT = 65;
VALID_ROLES = ["RESEARCHER", "PLANNER", "EXECUTOR", "VERIFIER", "ORCHESTRATOR"];
```

Functions: `buildContextPolicy()`, `buildRunConfig()`, `validateRunConfig()`, `readRunConfig()`, `writeRunConfig()`, `findContinuation()`, `buildContinuationResumePrompt()`, `validateContinuationContract()`

Parses context threshold from user prompt looking for `%` near keywords: `context`, `handoff`, `threshold`, `saturation`, `window`, `past`, `above`, `exceed`, `cross`, `health`, `rot`, `continuation`.

---

## 2. Subagent Tool Implementation

### 2.1 Architecture

**Files:**
- `~/.pi/agent/extensions/subagent/index.ts` — main tool registration and execution
- `~/.pi/agent/extensions/subagent/agents.ts` — agent discovery

The subagent tool spawns a **separate `pi` process** per subagent invocation with `--mode json --no-session`. This gives each subagent an isolated context window.

### 2.2 Execution Modes

| Mode | Parameter | Concurrency | Max |
|------|-----------|-------------|-----|
| Single | `{ agent, task }` | 1 | - |
| Parallel | `{ tasks: [...] }` | MAX_CONCURRENCY = 4 | MAX_PARALLEL_TASKS = 8 |
| Chain | `{ chain: [...] }` | Sequential | - |

### 2.3 Agent Configuration

Agents discovered from:
- `~/.pi/agent/agents/*.md` — user-level (always loaded)
- `.pi/agents/*.md` — project-level (with `agentScope: "project"` or `"both"`)

**AgentConfig interface:**
```typescript
interface AgentConfig {
  name: string;           // e.g., "planner", "coder", "reviewer"
  description: string;
  tools?: string[];       // e.g., ["read", "bash", "edit", "write"]
  model?: string;         // e.g., "deepseek-v4-pro"
  systemPrompt: string;   // From markdown body after frontmatter
  source: "user" | "project";
  filePath: string;
}
```

### 2.4 Per-Subagent State Tracking

**SingleResult interface:**
```typescript
interface SingleResult {
  agent: string;
  agentSource: "user" | "project" | "unknown";
  task: string;
  exitCode: number;        // -1 = still running, 0 = success, non-zero = error
  messages: Message[];
  stderr: string;
  usage: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    cost: number;
    contextTokens: number;  // totalTokens from last usage — context saturation proxy
    turns: number;
  };
  model?: string;           // Actual model used (may differ from config)
  stopReason?: string;
  errorMessage?: string;
  step?: number;            // Chain mode step index
}
```

**Streaming updates:** `onUpdate` callback emits `AgentToolResult<SubagentDetails>` with live `results` array. For parallel mode, the `allResults[index]` array is updated per-task and re-emitted via `emitParallelUpdate()`.

### 2.5 Process Invocation

```javascript
// Spawns: pi --mode json --no-session --model <agentModel> --tools <tools> "Task: <task>"
// Parses JSON lines from stdout: message_end, tool_result_end events
// Tracks usage from message_end's message.usage (input, output, cacheRead, cacheWrite, cost.total, totalTokens)
// exitCode from process close
```

---

## 3. Pi TUI Integration Points

### 3.1 setWidget (Simple Persistent Display)

**File:** `docs/tui.md` — Pattern 5

```typescript
// Simple string array (above editor by default)
ctx.ui.setWidget("my-widget", ["Line 1", "Line 2"]);

// Below editor
ctx.ui.setWidget("my-widget", ["Line 1", "Line 2"], { placement: "belowEditor" });

// Component factory (more dynamic)
ctx.ui.setWidget("my-widget", (tui, theme) => ({
  render: () => lines,
  invalidate: () => {},
}));

// Clear
ctx.ui.setWidget("my-widget", undefined);
```

**WidgetPlacement:** `"aboveEditor"` | `"belowEditor"`

**Limitations:** No keyboard input, no interactive elements. Purely display. Does NOT support right-side anchoring — always above or below the editor horizontally.

### 3.2 setFooter (Custom Footer Component)

**File:** `docs/tui.md` — Pattern 6, `examples/extensions/custom-footer.ts`

```typescript
ctx.ui.setFooter((tui, theme, footerData) => ({
  invalidate() {},
  render(width: number): string[] {
    const branch = footerData.getGitBranch();
    const statuses = footerData.getExtensionStatuses();
    return [`${ctx.model?.id} (${branch || "no git"})`];
  },
  dispose: footerData.onBranchChange(() => tui.requestRender()),
}));

ctx.ui.setFooter(undefined); // restore default
```

**FooterDataProvider:** `getGitBranch()`, `getExtensionStatuses()`, `getAvailableProviderCount()`, `onBranchChange(callback)`

Limitations: Only one footer. Replaces entire footer line. Not right-side panel.

### 3.3 setStatus (Footer Status Indicator)

```typescript
ctx.ui.setStatus("my-ext", theme.fg("accent", "● active"));
ctx.ui.setStatus("my-ext", undefined); // clear
```

Simple key-value status shown in footer area. Lightweight but limited to short text.

### 3.4 Overlay Component (Best Fit for Side Panel)

**File:** `docs/tui.md` — Overlays section, `examples/extensions/overlay-qa-tests.ts`

```typescript
const result = await ctx.ui.custom<T>(
  (tui, theme, keybindings, done) => new MyComponent({ onClose: done }),
  {
    overlay: true,
    overlayOptions: {
      anchor: "right-center",        // KEY: right-side positioning
      width: "25%",                  // percentage or fixed columns
      minWidth: 30,                  // minimum width
      maxHeight: "80%",              // max height
      margin: { right: 1 },          // margins
      offsetX: -2,                   // offset from anchor
      // Responsive visibility
      visible: (termWidth, termHeight) => termWidth >= 80,
    },
    onHandle: (handle) => {
      // handle.setHidden(true/false) - toggle visibility
      // handle.hide() - permanently remove
    },
  }
);
```

**All 9 anchor positions:** `"top-left"`, `"top-center"`, `"top-right"`, `"left-center"`, `"center"`, `"right-center"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"`

**OverlayOptions:**
- `width`: number | string (e.g., "50%")
- `minWidth`: number
- `maxHeight`: number | string
- `anchor`: OverlayAnchor
- `offsetX`, `offsetY`: number
- `row`, `col`: number | string percentage
- `margin`: number | { top, right, bottom, left }
- `visible`: (termWidth, termHeight) => boolean

**Sidepanel example from overlay-qa-tests.ts (line 702):**
```typescript
class SidepanelComponent extends BaseOverlay {
  private tui: TUI;
  private items = [...];
  private selectedIndex = 0;
  private done: () => void;

  handleInput(data: string): void {
    if (matchesKey(data, "escape")) this.done();
    // ... navigation
  }

  render(width: number): string[] {
    // Box-drawing borders + themed content
  }
}
```

Invoked with:
```typescript
overlayOptions: {
  anchor: "right-center",
  width: "25%",
  minWidth: 30,
  margin: { right: 1 },
  visible: (termWidth) => termWidth >= 100,
}
```

### 3.5 Component Interface

```typescript
interface Component {
  render(width: number): string[];    // Each line ≤ width
  handleInput?(data: string): void;   // Keyboard input
  wantsKeyRelease?: boolean;
  invalidate(): void;                 // Clear render cache, called on theme change
}
```

---

## 4. Context Window Percentage and Working State APIs

### 4.1 getContextUsage()

**File:** `dist/core/extensions/types.d.ts` (line 192-198)

```typescript
interface ContextUsage {
  /** Estimated context tokens, or null if unknown (e.g., right after compaction) */
  tokens: number | null;
  /** Model's context window size */
  contextWindow: number;
  /** Context usage as percentage of context window, or null if tokens unknown */
  percent: number | null;
}
```

Available via `ctx.getContextUsage()` in any extension event handler.

### 4.2 Compaction-Level Context Estimation

**File:** `dist/core/compaction/compaction.d.ts`

```typescript
interface ContextUsageEstimate {
  tokens: number;
  usageTokens: number;
  trailingTokens: number;
  lastUsageIndex: number | null;
}

function estimateContextTokens(messages: AgentMessage[]): ContextUsageEstimate;
function calculateContextTokens(usage: Usage): number;
```

`calculateContextTokens()` uses the `totalTokens` field from usage when available.

### 4.3 Subagent Context Token Tracking

The subagent tool captures `currentResult.usage.contextTokens = usage.totalTokens` from each `message_end` event. This is the closest available proxy for subagent context saturation. However, this is per-turn usage, not real-time context window saturation.

### 4.4 Footer Data Provider

```typescript
interface ReadonlyFooterDataProvider {
  getGitBranch(): string | null;
  getExtensionStatuses(): ReadonlyMap<string, string>;
  getAvailableProviderCount(): number;
  onBranchChange(callback: () => void): () => void;
}
```

Token stats for current model are accessed via `ctx.sessionManager.getBranch()` and `ctx.model`.

---

## 5. Orchestration State Tracking Gaps

### 5.1 No Shared Subagent State Registry

The biggest gap is that **the subagent tool runs subprocesses and reports results back to the parent model's context, but does not expose subagent lifecycle state to Pi extensions or the TUI in a structured, queryable way.**

- Subagent state lives in the tool's `execute()` closure and the `onUpdate` callback stream
- No shared state between the subagent tool and an orchestration-panel extension
- Extensions cannot directly observe subagent spawn/exit/streaming events

### 5.2 NenFlow v3 Runs in a Prompt Skill, Not a Structured Extension

The NenFlow v3 skill is a markdown prompt template, not a TypeScript extension. It instructs the orchestrator model to call the subagent tool with specific parameters. It does not:
- Register Pi event handlers
- Track subagent lifecycle
- Expose run state to the TUI
- Write a structured run state file

### 5.3 RUN_CONFIG.json Only Has Context Config

`RUN_CONFIG.json` contains only context handoff thresholds. It does not track:
- Which subagents are running/completed/failed
- Model assignments per role
- Current orchestration phase
- Max-subagents, max-retries, concurrency settings
- Paradigm name

### 5.4 .nenflow_context_health.json Is Minimal

Only tracks `run_id`, `phase`, `measured_at`, and `orchestrator_session`. No subagent-level detail.

### 5.5 No Standard "Run Paradigm" Concept

"NenFlow v3" is the paradigm, but there's no struct defining it. Max-subagents (`MAX_PARALLEL_TASKS=8`), max-retries (Route D: 5 continuation attempts), and concurrency (`MAX_CONCURRENCY=4`) are hardcoded in the subagent tool, not exposed as configurable constants.

---

## 6. Available TUI Integration Points (Ranked by Fit)

| # | Integration Point | Right-Side? | Interactive? | Dynamic? | Fit for Panel |
|---|-------------------|-------------|--------------|----------|---------------|
| 1 | **Overlay (right-center)** | ✅ Native | ✅ Yes | ✅ Yes | **Best fit** |
| 2 | setFooter | ❌ Bottom bar | ✅ Component | ✅ Limited | Poor — wrong position |
| 3 | setWidget | ❌ Above/below editor | ❌ No | ✅ Yes | Wrong position |
| 4 | setStatus | ❌ Footer inline | ❌ No | Minimal | Too small |
| 5 | setWorkingIndicator | ❌ Inline spinner | ❌ No | Spinner only | Not suitable |

**Note on setWidget:** `ExtensionWidgetOptions` only has `placement: "aboveEditor" | "belowEditor"`. There is no right-side widget placement. Only overlays support right-side anchoring.

### 6.1 Recommended: Overlay with `anchor: "right-center"`

**Advantages:**
- Native right-side positioning
- Full component API (render, handleInput, invalidate)
- Responsive — `visible` callback hides on narrow terminals
- Non-capturing option for passive display
- Percentage width for terminal-relative sizing
- `onHandle` for programmatic visibility control
- Can be updated dynamically via `tui.requestRender()` + state changes

**Pattern from overlay-qa-tests.ts (line 232):**
```typescript
ctx.ui.custom<void>((tui, theme, _kb, done) => 
  new OrchestrationPanel(tui, theme, done, runState), {
  overlay: true,
  overlayOptions: {
    anchor: "right-center",
    width: "30%",
    minWidth: 35,
    margin: { right: 1 },
    visible: (termWidth) => termWidth >= 90,
  },
});
```

### 6.2 Non-Capturing Overlays (Passive Panels)

The overlay QA tests also demonstrate **non-capturing overlays** (`/overlay-passive` command at line 299). These are passive info panels that don't steal focus — perfect for an orchestration status panel that should remain visible but not block interaction with the main Pi session.

### 6.3 Alternative: setWidget with Theme Component

If an overlay is too intrusive, `setWidget` with the component-factory form provides a lighter persistent display. But it **cannot** be right-anchored — only above or below the editor (`WidgetPlacement = "aboveEditor" | "belowEditor"`). This limits its usefulness for a side panel.

---

## 7. Extension-to-Extension Communication (Event Bus)

### pi.events (Shared Event Bus)

**File:** `docs/extensions.md` (line 1536)

Extensions can communicate via a shared event bus:

```typescript
pi.events.on("my:event", (data) => { ... });
pi.events.emit("my:event", { ... });
```

**This is the primary mechanism for the subagent tool (or a wrapper extension) to broadcast subagent lifecycle events to an orchestration panel extension.**

Event bus is available in `ExtensionAPI` and also via `createEventBus()` for SDK consumers.

### Shared State Files

A simpler approach for cross-extension state: write to a shared JSON file in the run directory (e.g., `ORCHESTRATION_STATE.json`). The panel extension reads it on each render cycle.

**Recommended hybrid approach:**
1. Subagent lifecycle events emitted via `pi.events` for real-time updates
2. `RUN_CONFIG.json` extended with orchestration metadata (max-subagents, max-retries, concurrency, paradigm)
3. `ORCHESTRATION_STATE.json` as shared subagent state ledger (agent name, model, task, exitCode, context%, start time)

---

## 8. Model/Agent Configuration Access Points

### 7.1 Current Session Model

```typescript
ctx.model?.id          // e.g., "deepseek-v4-pro"
ctx.model?.provider    // e.g., "deepseek"
ctx.model?.context_window  // e.g., 128000
```

### 7.2 Subagent Agent Definitions

Agents are markdown files with YAML frontmatter in `~/.pi/agent/agents/*.md`. The subagent tool's `discoverAgents()` parses them. AgentConfig has `model` field.

### 7.3 RUN_CONFIG.json

Read with `JSON.parse(fs.readFileSync(...))`. Contains `context_handoff` thresholds. Could be extended with orchestration metadata.

### 7.4 NenFlow SKILL.md Implicit Configuration

The skill hardcodes:
- Role sequence: INTAKE → RESEARCH → PLAN → EXECUTE → VERIFY
- Retry policy: 1 retry on FAIL (2 exec+verif attempts max)
- Subagent names: pev-researcher, pev-planner, pev-executor, pev-verifier
- Artifact naming conventions

---

## 9. Context Saturation Measurement APIs

### 8.1 Extension-Level

```typescript
// Returns current model's context usage
const usage = ctx.getContextUsage();
// usage.tokens — estimated tokens (null if unknown)
// usage.contextWindow — model's max tokens
// usage.percent — percentage (null if unknown)
```

### 8.2 Session-Level (for current model)

```typescript
// Aggregate token usage from session entries
for (const e of ctx.sessionManager.getBranch()) {
  if (e.type === "message" && e.message.role === "assistant") {
    input += e.message.usage.input;
    output += e.message.usage.output;
  }
}
```

### 8.3 Subagent-Level (from subagent tool)

```typescript
// Captured from subprocess message_end events
currentResult.usage.contextTokens = usage.totalTokens;
// This is the subagent's own context token usage from its last message
```

**Gap:** There's no real-time subagent context saturation API. The subagent tool captures `totalTokens` from each message, but this is an after-the-fact per-turn value, not a live stream of context saturation.

---

## 10. Implementation Gaps to Address

For the orchestration panel to work, we need:

1. **Subagent lifecycle events:** Hook into subagent spawn/exit/streaming to collect per-agent state (agent name, model, task, exitCode, start time). Currently only accessible inside the subagent tool's `runSingleAgent()` closure.

2. **Shared state channel:** A way to pass subagent state from the tool to an orchestration panel extension. Options: (a) shared file in run directory, (b) Pi event bus, (c) write state to RUN_CONFIG.json or a new ORCHESTRATION_STATE.json.

3. **Run metadata extraction:** Max-subagents, max-retries, concurrency, paradigm name need to be lifted from hardcoded constants to configurable values writable to a shared location.

4. **Context percentage for sub-agents:** Currently each subagent's context saturation is estimated by the subagent itself (self-estimate) and reported in continuation contracts, not captured by the parent process. The subagent tool captures `totalTokens` from the subprocess' last message, which is a proxy but not real-time.

5. **Component lifecycle:** The overlay panel needs to live across the entire orchestration run, not just one tool call. This means it should be spawned at orchestration start and closed at verification end.

---

## 11. File Paths to Reference

| Purpose | Path |
|---------|------|
| NenFlow v3 skill | `~/.pi/agent/skills/nenflow-v3/SKILL.md` |
| Subagent tool extension | `~/.pi/agent/extensions/subagent/index.ts` |
| Agent discovery | `~/.pi/agent/extensions/subagent/agents.ts` |
| Context policy | `~/.pi/agent/nenflow-v3/context-policy.js` |
| Validator | `~/.pi/agent/nenflow-v3/validator.js` |
| Continuation template | `~/.pi/agent/nenflow-v3/templates/CONTINUATION.md` |
| PeV Researcher skill | `~/.pi/agent/skills/nenflow-pev-researcher/SKILL.md` |
| PeV Executor skill | `~/.pi/agent/skills/nenflow-pev-executor/SKILL.md` |
| TUI docs | `{pi-pkg}/docs/tui.md` |
| Extensions docs | `{pi-pkg}/docs/extensions.md` |
| Overlay QA tests | `{pi-pkg}/examples/extensions/overlay-qa-tests.ts` |
| Custom footer example | `{pi-pkg}/examples/extensions/custom-footer.ts` |
| Widget placement example | `{pi-pkg}/examples/extensions/widget-placement.ts` |
| Plan mode example | `{pi-pkg}/examples/extensions/plan-mode/index.ts` |
| Model status example | `{pi-pkg}/examples/extensions/model-status.ts` |
| Status line example | `{pi-pkg}/examples/extensions/status-line.ts` |
