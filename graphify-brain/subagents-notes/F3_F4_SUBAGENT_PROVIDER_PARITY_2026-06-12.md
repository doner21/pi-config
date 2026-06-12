# F3/F4 Subagent Provider Parity — Implemented 2026-06-12

Companion intake to `ORCHESTRATE_HARDENING_IMPLEMENTED_2026-06-12.md`.
Fixes the two subagent-tool findings that were intentionally left out of scope
for the orchestrate hardening intake.

## What changed

**File:** `C:\Users\doner\.pi\agent\extensions\subagent.ts`

### F3 — Silent-empty result under openai-codex OAuth (HIGH)

Root cause: `runSubagent()` lacked the event-tracking machinery that
`substrate.ts` has in the orchestrate extension. No `agent_end` awareness,
no `stopReason`/`errorMessage` extraction, and no explicit "exit 0 + no
assistant text = failure" check.

Changes in `runSubagent()`:
1. Added `agentEnded: boolean` flag (mirrors `substrate.ts:296`)
2. Added `assistantFailures: string[]` to collect stopReason/errorMessage
   from assistant `message_end` events before `agent_end`
3. Updated `parseLine()` to extract `stopReason` and `errorMessage` from
   both `event.message` and the raw event levels, matching the
   `substrate.ts` extraction chain
4. Added explicit rejection: exit code 0 + empty finalText + empty stderr
   → `"produced no output despite exit code 0"` error (catches the
   silent-empty OAuth case that cost 3 dispatches to diagnose)
5. Added explicit rejection: `assistantFailures.length > 0` despite exit
   code 0 → `"reported assistant failure despite exit code 0"` error

### F4 — No model/provider/thinkingLevel params on subagent tool (HIGH)

Root cause: the `subagent` tool's TypeBox schema had only `agent`, `task`,
`cwd`, `allowLocalModel` — no per-call model/provider overrides. Users had
to persistently edit `~/.pi/agent/agents/*.json` to route subagents.

Changes:
1. Added `SubagentOverride` interface (`model?`, `provider?`, `thinkingLevel?`)
2. Updated `resolveModelSelection()` to accept `overrides?: SubagentOverride`
   with precedence: overrides > agent config > parent ctx
3. Updated `runSubagent()` to accept `modelOverride?: SubagentOverride`,
   pass `--thinking` flag when `thinkingLevel` is set
4. Updated `ResolvedModelSelection` to include `thinkingLevel?`
5. Added TypeBox schema params: `model` (Optional String), `provider`
   (Optional String), `thinkingLevel` (Optional String)
6. Updated `promptGuidelines` to document override params
7. Updated execute handler: builds `modelOverride` from params, calls
   `resolveModelSelection` inside try/catch (so local-model blocking
   errors use the structured error path), uses `resolvedModel` in
   `subagent:spawn`/`subagent:exit` events, success details/metadata,
   and failure-path `subagent:exit` event now includes model/provider

### Model router update

**File:** `C:\Users\doner\.pi\agent\model-router.json`

Updated routes to match the routing requirements from the orchestration
feedback session:
- `planner` → `openai-codex/gpt-5.5` (GPT 5.5 Codex for planning)
- `planner-alt` → `anthropic/claude-opus-4-20250514` (Opus 4.8 fallback)
- `executor` → `deepseek/deepseek-v4-pro` (DeepSeek V4 Pro for execution)
- Added `verifier` → `openai-codex/gpt-5.5`
- Added `orchestrator` → `deepseek/deepseek-v4-pro`

## Verification

Verified via `orchestrate verify-only` with GPT 5.5 Codex verifier.
All 12 checklist items PASSED:
- F3-1 through F3-5: agentEnded flag, assistantFailures array, parseLine
  stopReason/errorMessage extraction, silent-empty rejection, assistant-
  failure rejection
- F4-1 through F4-8: SubagentOverride interface, resolveModelSelection
  overrides, runSubagent modelOverride + --thinking, ResolvedModelSelection
  thinkingLevel, TypeBox schema params, promptGuidelines, execute handler
  (modelOverride building, resolveModelSelection in try/catch, failure-path
  events with model/provider)

Preflight: openai-codex/gpt-5.5 healthy (prior F3 silent-empty issue
confirmed resolved — the preflight ping succeeded where the same
provider previously produced empty results via the subagent tool path).

## Open items
- The `verify-only` paradigm's default executor model resolution appears
  to produce the literal string "resolvedModel" when no explicit
  executorModel/executorProvider is set — this is a routing bug in the
  orchestrate extension, not the subagent tool.
