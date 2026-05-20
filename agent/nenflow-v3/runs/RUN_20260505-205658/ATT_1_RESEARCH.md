---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260505-205658
context_saturation_estimate: "~18%"
---

## Investigation Scope
Read intake and inspected the local/remote `memory_research`, upstream `safishamsi/graphify`, and current Pi/Capati/Graphify paths. No destructive changes, package installs, or deletes were performed. Safe actions performed: `git fetch --prune origin` in `C:/Users/doner/memory reaserch`; temp shallow clones under `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-205658/research_tmp/`.

## Key Findings

### `memory_research` local vs remote
- Command: `git -C "C:/Users/doner/memory reaserch" fetch --prune origin` fetched `origin/main` from `d97a09a` to `bc293b0`.
- Current local status: `## main...origin/main [ahead 1, behind 2]`.
- Local ahead commit is `9dbf844 checkpoint: pre-op auto-commit [pi]`; remote-only commits are `c6dd2a7` and `bc293b0 Add extension source, skills, tests + comprehensive README update`.
- Remote `origin/main` adds the requested extension content: `extensions/graphify.ts`, `extensions/git-checkpoint.ts`, `extensions/package*.json`, `skills/graphify/SKILL.md`, `test/graphify-test-bundle.js`.
- Because the local checkout diverged, I did **not** merge/reset it. A safe executor should preserve/backup the local branch first, then update to `origin/main` if confirmed.

### `invoke.md` / `INVOKE.md`
- Commands:
  - `find "C:/Users/doner/memory reaserch" -maxdepth 8 \( -iname 'invoke.md' -o -iname 'INVOKE.md' \)`
  - `git -C ".../research_tmp/memory_research" ls-tree -r --name-only HEAD | grep -Ei '(^|/)invoke\.md$'`
  - `git -C ".../research_tmp/graphify" ls-tree -r --name-only HEAD | grep -Ei '(^|/)invoke\.md$'`
- Result: no `invoke.md` / `INVOKE.md` found in local `memory_research`, remote `memory_research`, or upstream `safishamsi/graphify` clone.
- Decisive replacement instructions are in `memory_research/README.md`, not `invoke.md`. Key quotes:
  - “This repo contains the **source of truth**. To install into a Pi harness” with install table mapping `extensions/graphify.ts` → `~/.pi/agent/extensions/graphify.ts`, `skills/graphify/SKILL.md` → `~/.pi/agent/skills/graphify/SKILL.md`, test bundle → `~/.pi/agent/graphify-test-bundle.js`.
  - Runtime brain data “is created automatically at: `~/.pi/graphify-brain/`”.
  - Setup says copy extension files, then `cd ~/.pi/agent/extensions && npm install`, install graphify skill, restart Pi, verify `/memory list`.
  - Non-negotiable invariant: “**Never delete directly**: All destructive operations go through archive first (`.archive/` → 30-day grace period → delete).”

### Upstream `safishamsi/graphify`
- Remote available. Command: `git ls-remote --symref https://github.com/safishamsi/graphify HEAD` → `refs/heads/v7`, HEAD `48888a7c...`.
- Temp clone path: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify`.
- Top-level files: `.github`, `AGENTS.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `LICENSE`, `README.md`, `SECURITY.md`, `docs`, `graphify`, `pyproject.toml`, `tests`, `worked`.
- `pyproject.toml`: package name `graphifyy`, version `0.7.7`, CLI script `graphify = graphify.__main__:main`, includes `skill-pi.md`.
- README decisive install quote: `uv tool install graphifyy && graphify install` (or `pipx install graphifyy && graphify install`, or `pip install graphifyy && graphify install`). Platform table says: “Pi coding agent | `graphify install --platform pi`”.
- Code decisive path: `graphify/__main__.py` maps `pi` to `Path.home() / ".pi" / "agent" / "skills" / "graphify" / "SKILL.md"`; `graphify pi uninstall` removes that skill and `.graphify_version` only.
- Current installed local Graphify is old: `python` imports `graphifyy version: 0.4.23`; current `graphify --help` does not list `pi` in `install --platform`, so a Graphify upgrade/install would be needed before using `graphify install --platform pi`.

## Current Pi/Capati/Graphify Inventory
- `C:/Users/doner/.pi/extensions/graphify`: missing.
- `C:/Users/doner/.pi/extensions`: missing.
- `C:/Users/doner/.pi/graphify-brain`: missing.
- `C:/Users/doner/.pi/agent/skills/graphify`: missing.
- `C:/Users/doner/.pi/agent/extensions`: exists, ~28M. Contains current Pi extensions including `git-checkpoint.ts`, `nenflow-v3.ts`, etc.; no current `graphify.ts`.
- `C:/Users/doner/.pi/agent/settings.json`: contains package entry `..\..\capati-memory-system\pi-package` plus `npm:@ollama/pi-web-search`.
- `C:/Users/doner/.pi/agent/AGENTS.md`: global policy says “Capati memory is first-class context” and instructs agents to consult Capati/Graphify memory.
- `C:/Users/doner/capati-memory-system`: exists, ~208M, not a git repo. Contains vault, registry, graphify mirrors, and `pi-package`.
- `C:/Users/doner/capati-memory-system/pi-package/package.json`: Pi package with extensions `./extensions`, skills `./skills`, prompts `./prompts`; keywords include `graphify`.
- Current Capati package registers `/memory-project`, `/memory-resume`, `/memory-save`, `/memory-wiki`, `/graphify`, and tools `capati_graphify_context`, `capati_graphify_publish` from `pi-package/extensions/capati-memory/index.ts`.
- Obvious `.pi` Capati path found: `C:/Users/doner/.pi/agent/sessions/--C--Users-doner-capati-memory-system--` (~972K session logs). This is history, not an active extension.
- `.pi/agent` git status has existing modifications to `settings.json` and `mcp-registry.json`, plus current NenFlow run artifacts.

## Candidate Paths

### Candidate removal/quarantine targets (no deletion performed)
- Active Capati load hook: edit `C:/Users/doner/.pi/agent/settings.json` to remove package entry `..\..\capati-memory-system\pi-package`.
- Active Capati policy text: edit/quarantine the Capati/Graphify policy block in `C:/Users/doner/.pi/agent/AGENTS.md` if user wants Capati removed as global context.
- Capati package source/vault: `C:/Users/doner/capati-memory-system` or narrower `C:/Users/doner/capati-memory-system/pi-package` (high-risk; contains vault/project memory and is not git-backed).
- Potential old/new Graphify brain data: `C:/Users/doner/.pi/graphify-brain` (currently missing; if created later, archive/quarantine rather than delete).
- Potential Pi skill dir: `C:/Users/doner/.pi/agent/skills/graphify` (currently missing; will be created by install).
- Extension overwrite targets: `C:/Users/doner/.pi/agent/extensions/graphify.ts` (missing), `git-checkpoint.ts` (exists; content differs only line endings from remote source), `package.json`, `package-lock.json`.
- Preserve unless user explicitly wants history purged: `C:/Users/doner/.pi/agent/sessions/--C--Users-doner-capati-memory-system--`.

### Candidate install sources
- `memory_research` remote source clone: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-205658/research_tmp/memory_research/` (or refreshed local `C:/Users/doner/memory reaserch` after resolving divergence).
  - `extensions/graphify.ts` → `C:/Users/doner/.pi/agent/extensions/graphify.ts`
  - `extensions/git-checkpoint.ts` → `C:/Users/doner/.pi/agent/extensions/git-checkpoint.ts`
  - `extensions/package.json`, `package-lock.json` → `C:/Users/doner/.pi/agent/extensions/`
  - `test/graphify-test-bundle.js` → `C:/Users/doner/.pi/agent/graphify-test-bundle.js`
- Graphify upstream source: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/` or PyPI `graphifyy==0.7.7`; Pi skill source is `graphify/skill-pi.md`, normally installed by `graphify install --platform pi` to `C:/Users/doner/.pi/agent/skills/graphify/SKILL.md`.

## Ambiguity Assessment
ASK_USER is recommended before destructive execution.

Blocking ambiguities found:
1. No `invoke.md` exists, so there are no authoritative deletion/update instructions despite the user specifically naming `invoke.md`.
2. `memory_research` README says to install its bundled `skills/graphify/SKILL.md` (`.graphify_version` is `0.6.7`), while upstream `safishamsi/graphify` is `0.7.7` and says `graphify install --platform pi`. This creates a “which Graphify skill wins?” conflict. User wording suggests 
upstream `safishamsi/graphify` should win for Graphify, but README’s setup guide conflicts.
3. “Remove current Graphify/Capati memory system” could mean only disabling the Capati Pi package entry, or quarantining/deleting the whole `C:/Users/doner/capati-memory-system` vault. The latter is destructive and not git-backed.
4. Current local `C:/Users/doner/memory reaserch` is diverged from `origin/main`; safe update needs a backup/reset/merge choice.

## Recommended Next Step
**ASK_USER**: confirm deletion/quarantine scope for `C:/Users/doner/capati-memory-system` and confirm whether the Graphify skill should come from upstream `safishamsi/graphify` `v7`/`graphifyy 0.7.7` instead of the `memory_research` bundled `0.6.7` skill. After that, planning is straightforward.
