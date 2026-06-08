# Pi Config Harness Hardening — Sprint Report

**Run ID**: `RUN_20260509-011600`
**Verdict**: **PASS** — all 8 success criteria met
**Date**: 2026-05-09
**NenFlow artifacts**: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260509-011600/`

---

## What Was Done

Applied 4 categories of improvements across 11 files, based on the architectural review of the pi-config harness (formerly `push_pi_to_git` review of `doner21/pi-config`).

### 1. Fixed Hardcoded Windows Paths → Portable (SC1-SC4)

**7 files** no longer contain hardcoded `C:/Users/doner/` paths:

| File | Change |
|------|--------|
| `extensions/subagent.ts` | CLI path now resolves via `PI_CLI_PATH` env var → `process.platform` branching → npm global paths |
| `extensions/playwright-mcp.ts` | Fallback from `"C:/Users/doner/AppData/Local"` to `join(homedir(), "AppData", "Local")` |
| `skills/nenflow-v3/SKILL.md` | 10× `C:/Users/doner/.pi/agent/nenflow-v3/` → `~/.pi/agent/nenflow-v3/` |
| `skills/nenflow-pev-executor/SKILL.md` | 4× `C:/Users/doner/nenflow_v3/` → `~/.pi/agent/nenflow-v3/` (also fixed underscore → hyphen) |
| `skills/nenflow-pev-planner/SKILL.md` | Same |
| `skills/nenflow-pev-researcher/SKILL.md` | Same |
| `skills/nenflow-pev-verifier/SKILL.md` | Same |
| `prompts/pev.md` | 1× path → `~/.pi/agent/skills/nenflow-v3/SKILL.md` |
| `prompts/nenflow_v3.md` | 1× same |

**Global grep result**: 0 functional hardcoded paths remain (1 comment-only hit in `nenflow-v3.ts` — benign).

### 2. Added Graphify Memory Safety Gates (SC5-SC6)

`extensions/graphify.ts` — `brainContextForCwd()` now checks run metadata before injecting graph content:

- Reads `run-meta.json` for `safeToInject` and `verifiedStatus`
- If `safeToInject === false`: **skips GRAPH_REPORT injection entirely** (wiki still injected)
- If `verifiedStatus` is present but not `"verified"`: injects with a warning note
- All new filesystem reads wrapped in try/catch (failures degrade gracefully)

Previously, the metadata fields existed in the data model but were never consulted during injection.

### 3. Tightened Git Checkpoints (SC7)

`extensions/git-checkpoint.ts`: Changed `git add -A` → `git add -u`

- `-u` only stages tracked files, preventing unrelated untracked human changes from being absorbed into agent checkpoints
- Agent operations are never blocked (checkpoint failures are non-fatal)

### 4. Added Subagent Run Metadata (SC8)

`extensions/subagent.ts`: Subagent tool results now include a `metadata` field alongside the existing `details`:

```json
{
  "content": [...],
  "details": { ... },
  "metadata": {
    "agent": "pev-executor",
    "agencyLevel": "write-enabled",
    "model": "...",
    "provider": "...",
    "sourceFile": "...",
    "resultLength": 1234,
    "cwd": "..."
  }
}
```

Backward-compatible: `details` and `content` are unchanged.

---

## What Was NOT Done (Intentionally)

These items from the review were deferred:

- **Bash read-only enforcement** — requires pi-core changes (can't reliably classify bash commands as read/write from an extension)
- **Full run ledger infrastructure** — the metadata field is a first step; full transcript logging needs deeper integration
- **Progressive-disclosure MCP** — needs pi-core API support for dynamic tool registration
- **Capability registry / policy engine** — needs pi-core middleware architecture
- **Evidence-based verification enforcement in validator.js** — the verifier skill already mandates independent evidence; validator format enforcement is sufficient for now
- **Architecture wiki** — Graphify already generates wiki output; manual wiki belongs in a separate sprint

---

## Verification Evidence

| SC | Criterion | Evidence | Result |
|----|-----------|----------|--------|
| SC1 | CLI path platform-aware | `resolveCliPath()` with `process.platform` branching, Unix candidates | PASS |
| SC2 | Playwright no hardcoded path | `homedir()` import, 0 `C:/Users/doner` hits | PASS |
| SC3 | 5 skill files portable | 0 hardcoded paths, correct counts of `~/.pi/agent/...` replacements | PASS |
| SC4 | 2 prompt files portable | 0 hardcoded paths, `~/.pi/agent/skills/nenflow-v3/SKILL.md` present | PASS |
| SC5 | Graphify safety gating | `safeToInject`/`verifiedStatus` read from run-meta; `skipReport` guard | PASS |
| SC6 | safeToInject:false bail-out | Code-path: `safeToInject===false` → `skipReport=true` → GRAPH_REPORT skipped | PASS |
| SC7 | git add -u | Uses `-u`; 0 occurrences of `-A` | PASS |
| SC8 | Subagent metadata | 7-field success metadata + 2-field error metadata; backward-compatible | PASS |

All 8 invariants confirmed intact. Full verification report at `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260509-011600/ATT_3_VERIFICATION.md`.

---

## Recommendations for Next Sprint

1. **Test on Linux/macOS** — clone `doner21/pi-config` onto a non-Windows machine and verify `/subagents spawn` works
2. **Expand destructive command patterns** in `confirm-destructive.ts` (add `git reset --hard`, `git clean -fdx`, `curl | sh`, etc.)
3. **Persist subagent transcripts** — write the full JSONL transcript to disk alongside the summary result
4. **Add gitleaks/trufflehog** to CI or pre-commit hooks for the public repo
