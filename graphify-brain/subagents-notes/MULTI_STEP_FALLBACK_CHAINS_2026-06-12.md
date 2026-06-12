# Multi-Step Fallback Chains & Anthropic Model Aliases — Implemented 2026-06-12

Companion to `F3_F4_SUBAGENT_PROVIDER_PARITY_2026-06-12.md`.
Adds multi-step fallback chains and Anthropic model alias recognition to the
orchestrate extension.

## What changed

**File:** `C:\Users\doner\.pi\pi-orchestrator-extension\src\index.ts`
(synced to `C:\Users\doner\pi-orchestrator-extension\src\index.ts`)

### Multi-step fallback chains

`runProviderPreflight()` now supports comma-separated fallback chains instead
of a single fallback per role. The new `parseFallbackChain()` function splits
comma-separated model/provider strings into ordered fallback entries.

**Example:** `plannerFallbackModel: "claude-opus-4-20250514,deepseek-v4-pro,deepseek-v4-flash"`
with `plannerFallbackProvider: "anthropic,deepseek,deepseek"` produces a 3-step chain:

1. anthropic / claude-opus-4-20250514
2. deepseek / deepseek-v4-pro
3. deepseek / deepseek-v4-flash

The preflight loop tries each fallback in order until one succeeds.
Failed fallbacks are logged with their chain index.
Single-value fallback params still work (backward-compatible — produce a
1-element chain).

### Anthropic model alias recognition

Both `modelAliasFromText()` and `findModelAliases()` now recognize:

| Natural language | Resolved to |
|---|---|
| "Opus 4.8", "Claude Opus" | provider: anthropic, model: claude-opus-4-20250514 |
| "Sonnet", "Claude Sonnet" | provider: anthropic, model: claude-sonnet-4-20250514 |
| "Haiku", "Claude Haiku" | provider: anthropic, model: claude-3-5-haiku-20241022 |
| "Fable", "Claude Fable" | provider: anthropic, model: fable |
| "GPT 5.5 Fast" | provider: openai-codex, model: gpt-5.5-fast |

The GPT 5.5 Fast check was placed BEFORE the generic GPT 5.5 check in
`modelAliasFromText()` to prevent "gpt 5.5 fast" from matching the broader
pattern first.

### Prompt-based routing — how it works

The orchestrate system already supports natural-language model routing through
`inferModelRoutingFromTask()`. The routing precedence is:

1. **Explicit tool params** (`plannerModel`, `plannerProvider`, etc.) — strongest
2. **Inferred from prompt** (natural language → `inferModelRoutingFromTask()`)
3. **Agent profile** (from `~/.pi/agent/agents/*.json`)
4. **Inherited model** (parent session) — weakest

This means you can write prompts like:
- "use GPT 5.5 Codex for planning, use DeepSeek V4 Pro for execution"
- "plan with Opus 4.8, execute with DeepSeek V4 Pro, verify with Sonnet"
- "route the planner to anthropic/fable"

And the system will resolve the correct model routing automatically.

### Help text updates

- TypeBox schema descriptions now mention comma-separated fallback chains
- `/orchestrate` command description now mentions fallback chain params
- Error message for unknown flags lists fallback chain format

## Verification

Verified via `orchestrate verify-only` with GPT 5.5 Codex verifier: **6/6 PASS**.

## Files also updated

- `C:\Users\doner\.pi\agent\model-router.json` — routes updated:
  - planner → openai-codex/gpt-5.5
  - planner-alt → anthropic/claude-opus-4-20250514
  - executor → deepseek/deepseek-v4-pro
  - verifier → openai-codex/gpt-5.5
  - orchestrator → deepseek/deepseek-v4-pro
