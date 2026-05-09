---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260509-011600
context_saturation_estimate: "~22%"
---

# PLAN — Pi Config Harness Hardening Sprint

## Task Statement

Harden the pi-config harness for cross-platform portability, memory safety, git hygiene, and subagent observability by surgically fixing hardcoded Windows paths across 4 TypeScript extensions, 6 NenFlow skill markdown files, and 2 prompt markdown files; adding safeToInject/verifiedStatus gating to graphify brain injection; switching git checkpoints to git add -u; and adding structured run metadata to subagent results.

## Invariants

- subagent tool returns valid content that parent agents can consume (backward-compatible)
- Graphify brain injection continues to work for projects with valid, safe graphs
- Git checkpoint never blocks agent operations
- Destructive command confirmation still fires
- All existing /memory, /subagents, /graphify, /nenflow_v3 commands still work
- No breaking changes to the subagent API contract
- Windows support is preserved while adding macOS/Linux support
- Pi extension API boundaries are not crossed (no pi-core changes)

## Success Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| SC1 | CLI path in subagent.ts resolves on Linux/macOS without hardcoded AppData/Roaming/npm path | grep -c AppData extensions/subagent.ts must return 0 |
| SC2 | Playwright MCP profiles path does not fall back to C:/Users/doner/... literal | grep -c C:/Users/doner extensions/playwright-mcp.ts must return 0 |
| SC3 | All 6 NenFlow skill files use portable paths (~/.pi/agent/...) | grep -rc C:/Users/doner skills/nenflow-pev-*/SKILL.md skills/nenflow-v3/SKILL.md returns all 0 |
| SC4 | Both prompt files (pev.md, nenflow_v3.md) use portable paths | grep -c C:/Users/doner prompts/pev.md prompts/nenflow_v3.md returns 0,0 |
| SC5 | brainContextForCwd() checks safeToInject and verifiedStatus before injecting full report | grep safeToInject extensions/graphify.ts shows usage in brainContextForCwd |
| SC6 | A run with safeToInject: false does not get its GRAPH_REPORT content injected | Code-path review confirms bail-out |
| SC7 | Git checkpoint extension uses git add -u instead of git add -A | grep git add -A returns 0; grep git add -u returns 1 |
| SC8 | Subagent result includes structured metadata field alongside text | grep metadata: extensions/subagent.ts shows metadata key in tool result |

## Implementation Steps

### Phase 1 â Independent, No-Dependency Changes

---

**Step 1: Fix git-checkpoint.ts â replace git add -A with git add -u** (SC7)

- **File**: C:/Users/doner/.pi/agent/extensions/git-checkpoint.ts
- **Change**: On line 22, change git add -A to git add -u
- **Why first**: Standalone one-line change, no other file depends on it.
- **Verification**: grep git add -u on the file finds the line; grep git add -A returns nothing.

---

**Step 2: Fix playwright-mcp.ts â remove hardcoded user-path fallback** (SC2)

- **File**: C:/Users/doner/.pi/agent/extensions/playwright-mcp.ts
- **Change**: Lines 60-65. Replace the hardcoded fallback string C:/Users/doner/AppData/Local with join(homedir(), AppData, Local). Add import { homedir } from node:os at the top of the file.
- **Verification**: grep C:/Users/doner on the file returns 0.

**Step 3: Fix subagent.ts â platform-aware CLI path and metadata field** (SC1, SC8)

- **File**: C:/Users/doner/.pi/agent/extensions/subagent.ts

**Part A â CLI path (SC1)**: Replace lines 31-44 (cliPath constant and ensureCliPath function) with:

  - A resolveCliPath() function that checks process.env.PI_CLI_PATH first
  - On win32: uses process.env.APPDATA || join(homedir(), AppData, Roaming) + npm/node_modules path
  - On Unix: tries ~/.npm-global/lib/node_modules, /usr/local/lib/node_modules, /usr/lib/node_modules
  - Throws with PI_CLI_PATH hint if nothing found
  - ensureCliPath() becomes: return resolveCliPath();

**Part B â metadata field (SC8)**: In the execute callback, add a metadata field as sibling to details in the successful return statement:

  metadata: { agent: agent.name, agencyLevel: agent.agencyLevel, model: agent.model ?? ctx.model?.id ?? unknown, provider: agent.provider ?? ctx.model?.provider ?? unknown, sourceFile: agent.sourceFile, resultLength: result.length, cwd: params.cwd ?? ctx.cwd }

  Also add minimal metadata to the error return: metadata: { agent: agent.name, sourceFile: agent.sourceFile }

- **Verification SC1**: grep -c AppData extensions/subagent.ts returns 0.
- **Verification SC8**: grep -A 12 metadata: on subagent.ts shows keys: agent, agencyLevel, model, provider, sourceFile, resultLength, cwd.

### Phase 2 â graphify.ts Memory Safety Gate

---

**Step 4: Fix graphify.ts â add safeToInject/verifiedStatus gating to brainContextForCwd()** (SC5, SC6)

- **File**: C:/Users/doner/.pi/agent/extensions/graphify.ts
- **Change**: In brainContextForCwd(), after the if (!match) continue; line and BEFORE const reportPath = ..., insert run-meta gating:

  1. Read project-level meta.json to get lastRunId
  2. Read run-meta.json from runs/<lastRunId>/
  3. If safeToInject === false: append notice to parts, set skipReport = true
  4. Else if verifiedStatus exists and !== verified: append notice to parts (do NOT skip report)
  5. Wrap the existing GRAPH_REPORT reading block in if (!skipReport) { ... }
  6. Wiki injection remains unconditional
  7. All new filesystem reads wrapped in try/catch

- **Verification**: grep safeToInject extensions/graphify.ts shows usage in brainContextForCwd. grep verifiedStatus same. grep skipReport shows guard variable. Code-path: safeToInject===false causes GRAPH_REPORT skip.

### Phase 3 â Portable Paths in All Skill and Prompt Files

---

**Step 5: Fix all 6 NenFlow skill files** (SC3)

For each file, read content, replace ALL occurrences of old path with ~/.pi/agent/nenflow-v3/, write back.

| File | # | Old Pattern | New Pattern |
|------|---|---|-------------|
| skills/nenflow-pev-executor/SKILL.md | 4 | C:/Users/doner/nenflow_v3/ | ~/.pi/agent/nenflow-v3/ |
| skills/nenflow-pev-planner/SKILL.md | 4 | C:/Users/doner/nenflow_v3/ | ~/.pi/agent/nenflow-v3/ |
| skills/nenflow-pev-researcher/SKILL.md | 4 | C:/Users/doner/nenflow_v3/ | ~/.pi/agent/nenflow-v3/ |
| skills/nenflow-pev-verifier/SKILL.md | 4 | C:/Users/doner/nenflow_v3/ | ~/.pi/agent/nenflow-v3/ |
| skills/nenflow-v3/SKILL.md | 10 | C:/Users/doner/.pi/agent/nenflow-v3/ | ~/.pi/agent/nenflow-v3/ |

**Critical detail**: PEV skills use nenflow_v3 (underscore) for directory references. Must become nenflow-v3 (hyphen). The orchestrator skill already uses hyphen.

- **Method per file**: readFileSync -> replaceAll(old, new) -> writeFileSync
- **Verification**: grep -rc C:/Users/doner on all 5 skill files returns 0 for all.

---

**Step 6: Fix 2 prompt files** (SC4)

- **Files**: C:/Users/doner/.pi/agent/prompts/pev.md and C:/Users/doner/.pi/agent/prompts/nenflow_v3.md
- **Change**: Replace C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md with ~/.pi/agent/skills/nenflow-v3/SKILL.md (1 occurrence each, line 5)
- **Verification**: grep -c C:/Users/doner prompts/pev.md prompts/nenflow_v3.md returns 0,0.

### Phase 4 â Final Verification Sweep

---

**Step 7: Global grep for remaining hardcoded paths**

Command: grep -rn C:/Users/doner extensions/ skills/ prompts/ --include=*.ts --include=*.md

Expected: Zero results outside backups/ and nenflow-v3/runs/.

**Step 8: Full verification sweep**

Run these commands:
  SC1: grep -c AppData extensions/subagent.ts || echo PASS
  SC2: grep -c C:/Users/doner extensions/playwright-mcp.ts || echo PASS
  SC3: grep -rc C:/Users/doner skills/nenflow-pev-*/SKILL.md skills/nenflow-v3/SKILL.md || echo PASS
  SC4: grep -c C:/Users/doner prompts/pev.md prompts/nenflow_v3.md || echo PASS
  SC5: grep -n safeToInject extensions/graphify.ts
  SC7: grep git.add extensions/git-checkpoint.ts
  SC8: grep -A 12 metadata: extensions/subagent.ts | head -20

## Handoff Notes

### File Manifest (11 files total)

| # | File (under .pi/agent/) | Type | Fix Summary |
|---|------|------|-----|
| 1 | extensions/git-checkpoint.ts | TS | git add -A -> git add -u |
| 2 | extensions/playwright-mcp.ts | TS | Hardcoded home dir fallback -> os.homedir() |
| 3 | extensions/subagent.ts | TS | CLI path platform resolution + metadata field |
| 4 | extensions/graphify.ts | TS | safeToInject/verifiedStatus gating in brainContextForCwd() |
| 5 | skills/nenflow-pev-executor/SKILL.md | MD | 4x path replace: C:/Users/doner/nenflow_v3/ -> ~/.pi/agent/nenflow-v3/ |
| 6 | skills/nenflow-pev-planner/SKILL.md | MD | 4x path replace |
| 7 | skills/nenflow-pev-researcher/SKILL.md | MD | 4x path replace |
| 8 | skills/nenflow-pev-verifier/SKILL.md | MD | 4x path replace |
| 9 | skills/nenflow-v3/SKILL.md | MD | 10x path replace: C:/Users/doner/.pi/agent/nenflow-v3/ -> ~/.pi/agent/nenflow-v3/ |
| 10 | prompts/pev.md | MD | 1x path replace |
| 11 | prompts/nenflow_v3.md | MD | 1x path replace |

### Key Decisions

1. **Path style for skills/prompts**: ~/.pi/agent/... (tilde form, Pi resolves home directory). Not {PI_HOME} tokens.
2. **Path resolution for extensions**: os.homedir() + platform-specific subpaths (APPDATA on Windows, .npm-global and /usr/local on Unix).
3. **subagent metadata**: metadata field alongside existing details — does NOT change content shape (backward compatible).
4. **verifiedStatus behavior**: If verifiedStatus is present but not verified, inject the report with a note — do NOT block injection. Only safeToInject: false blocks report injection.
5. **nenflow_v3 vs nenflow-v3**: nenflow-v3 (hyphen) is canonical. All 4 PEV skills use the wrong underscore form for directory references; both the user prefix AND the underscore must be fixed.

### Risks

- **Risk 1**: resolveCliPath() may not cover all Unix npm global install paths (e.g., nvm-managed node). Mitigation: supports PI_CLI_PATH env var as override.
- **Risk 2**: brainContextForCwd() change adds filesystem reads (reading run-meta.json). Mitigation: wrapped in try/catch; failures fall through to existing behavior.
- **Risk 3**: Changing git add -A to git add -u means new untracked files in the working directory will not be committed by checkpoints. This is intentional (the goal is to not absorb unrelated changes). The Executor should note this behavioral change.
