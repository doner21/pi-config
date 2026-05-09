---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260509-011600
---

# Verifier Brief — Pi Config Harness Hardening Sprint

## Success Criteria with Evidence and Verification Commands

### SC1: CLI path in subagent.ts resolves on Linux/macOS without hardcoded AppData/Roaming/npm path

- **Evidence**: `resolveCliPath()` function added at lines 33-53 of `extensions/subagent.ts`. Uses `process.env.PI_CLI_PATH` first, then `process.platform === "win32"` branching with Unix candidates (`.npm-global`, `/usr/local/lib`, `/usr/lib`).
- **Verification command**: `grep -n "resolveCliPath\|platform === \"win32\"\|PI_CLI_PATH" C:/Users/doner/.pi/agent/extensions/subagent.ts`
- **Functional verification**: Read `extensions/subagent.ts` and confirm the `resolveCliPath()` function exists, checks `process.platform`, and does NOT contain any hardcoded `C:/Users/doner/` path.

### SC2: Playwright MCP profiles path does not fall back to C:/Users/doner/... literal

- **Evidence**: Line 46-48 of `extensions/playwright-mcp.ts` now reads: `env["LOCALAPPDATA"] ?? join(homedir(), "AppData", "Local")`. Import `homedir` from `node:os` added at line 28.
- **Verification command**: `grep -c "C:/Users/doner" C:/Users/doner/.pi/agent/extensions/playwright-mcp.ts` — expected: 0
- **Alternative**: Read the file and confirm `C:/Users/doner` does not appear; confirm `homedir` is imported from `node:os`.

### SC3: All 5 NenFlow skill files use portable paths (~/.pi/agent/...)

- **Evidence**: All occurrences of `C:/Users/doner/nenflow_v3/` replaced with `~/.pi/agent/nenflow-v3/`; all occurrences of `C:/Users/doner/.pi/agent/nenflow-v3/` replaced with `~/.pi/agent/nenflow-v3/`.
- **Verification command**: `grep -rc "C:/Users/doner" C:/Users/doner/.pi/agent/skills/nenflow-pev-executor/SKILL.md C:/Users/doner/.pi/agent/skills/nenflow-pev-planner/SKILL.md C:/Users/doner/.pi/agent/skills/nenflow-pev-researcher/SKILL.md C:/Users/doner/.pi/agent/skills/nenflow-pev-verifier/SKILL.md C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md` — expected: all 0s
- **Additional check**: Verify `nenflow-v3` (hyphen) appears in all PEV skill files (the old underscore `nenflow_v3` should be gone for directory references).

### SC4: Both prompt files use portable paths

- **Evidence**: Single occurrence in each file replaced.
- **Verification command**: `grep -c "C:/Users/doner" C:/Users/doner/.pi/agent/prompts/pev.md C:/Users/doner/.pi/agent/prompts/nenflow_v3.md` — expected: 0,0
- **Additional check**: Read both files and confirm `~/.pi/agent/skills/nenflow-v3/SKILL.md` appears.

### SC5: brainContextForCwd() checks safeToInject and verifiedStatus before injecting full report

- **Evidence**: Lines 348-379 in `extensions/graphify.ts` contain gating logic. `safeToInject` and `verifiedStatus` are read from `run-meta.json`, and `skipReport` guard variable controls GRAPH_REPORT injection.
- **Verification command**: `grep -n "safeToInject\|verifiedStatus\|skipReport" C:/Users/doner/.pi/agent/extensions/graphify.ts`
- **Functional verification**: Read `extensions/graphify.ts` around the `if (!match) continue;` line in `brainContextForCwd()`. Confirm the run-meta reading block exists, the safety checks are present, and `if (!skipReport)` wraps the GRAPH_REPORT reading.

### SC6: A run with safeToInject: false does not get its GRAPH_REPORT content injected

- **Evidence**: Code-path at lines 361-366: when `safeToInject === false`, a warning is appended and `skipReport = true`. Line 379: `if (!skipReport) {` gates the report reading. The GRAPH_REPORT is skipped.
- **Verification**: Read the code path in `extensions/graphify.ts`. Trace from `safeToInject = runMeta.safeToInject !== false` → `if (safeToInject === false)` → `skipReport = true` → `if (!skipReport)` ⏭️ skips report reading. Confirm the wiki injection is NOT gated by skipReport.

### SC7: Git checkpoint extension uses git add -u instead of git add -A

- **Evidence**: Line 22 of `extensions/git-checkpoint.ts`: `execSync("git add -u", ...)`.
- **Verification command**: `grep "git.add" C:/Users/doner/.pi/agent/extensions/git-checkpoint.ts` — expected: shows `git add -u` and NOT `git add -A`.

### SC8: Subagent result includes structured metadata field alongside text

- **Evidence**: `metadata` field present in both success return (lines 430-440) and error return (line 445) of `extensions/subagent.ts`. Success metadata includes: `agent`, `agencyLevel`, `model`, `provider`, `sourceFile`, `resultLength`, `cwd`. Error metadata includes: `agent`, `sourceFile`.
- **Verification command**: `grep -A 12 "metadata:" C:/Users/doner/.pi/agent/extensions/subagent.ts | head -20`
- **Functional verification**: Read the execute callback and confirm `metadata:` is a sibling of `details:` in the return value. Confirm `details` field is preserved (backward compatibility).

## Global Health Check

**Recommended**: Run a global grep to confirm no remaining hardcoded paths (excluding the known comment in `extensions/nenflow-v3.ts`):

```bash
grep -rn "C:/Users/doner" C:/Users/doner/.pi/agent/extensions/ C:/Users/doner/.pi/agent/skills/ C:/Users/doner/.pi/agent/prompts/ --include="*.ts" --include="*.md"
```

Expected: Only `extensions/nenflow-v3.ts:10://   C:/Users/doner/.pi/agent/prompts/` (a comment line, not functional).
