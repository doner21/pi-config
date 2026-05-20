---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260505-205658
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~6%"
---

## Task Summary
User clarifies they want the current Graphify/Capati memory system and associated Pi extensions removed/replaced, then rebuild the Graphify memory system from scratch using updated repositories:
- `https://github.com/doner21/memory_research` for the proposed graphify brain / memory system and updated extensions
- `https://github.com/safishamsi/graphify` for Graphify installation for Pi code

The user specifically says to use NenFlow v3 and to ask for clarification if `invoke.md` has ambiguities.

## Task Type
Destructive local environment rebuild / extension replacement / memory system installation.

## User Intent
Replace the active broken/current Graphify + Capati memory setup in `.pi` with a rebuilt graphify-brain memory system based on the updated `memory_research` repo and the `safishamsi/graphify` Pi installation repository.

## Goal Attractor
A clean, working Pi Graphify memory/brain installation under the correct `.pi` locations, with obsolete current memory-system/extension artifacts removed or quarantined, and installation source aligned to the two requested GitHub repositories.

## Constraints
- Run NenFlow v3 visibly in this session.
- Do not spawn intake subagent.
- Research `invoke.md` before execution; if ambiguous, stop and ask the user.
- This touches destructive paths under `C:/Users/doner/.pi`; prefer quarantine/backup over irreversible deletion unless the plan establishes exact safe targets.
- Avoid deleting unrelated Pi configuration, unrelated extensions, or unrelated user memory unless specifically confirmed.
- Validate all NenFlow artifacts.
- Verify installation with direct filesystem/git/package evidence.

## Invariants
- Do not fabricate project memory context.
- Preserve recoverability of old `.pi` memory/extension state via timestamped quarantine/backups where practical.
- Do not run broad recursive delete against `.pi`.
- Only remove/replace scoped Graphify/Capati-memory-related targets identified by research.
- Ask for clarification if `invoke.md` or repo instructions create incompatible target paths, install commands, or deletion scope.

## Success Criteria
- Updated `memory_research` repo is fetched/refreshed from GitHub.
- `safishamsi/graphify` repo availability and installation instructions are inspected.
- Relevant `invoke.md` files are found/read and ambiguities identified.
- Current `.pi` Graphify/Capati memory extension/data locations are inventoried.
- A safe plan exists for deleting/quarantining current Graphify/Capati memory system and installing the new one.
- If no ambiguity blocks execution, executor performs the rebuild and verifier confirms active files/commands align with requested repos.

## Ambiguities
- Exact meaning of "current graphify capatti memory system": may include `.pi/extensions/graphify`, `.pi/graphify-brain`, `.pi/agent` Capati package hooks, `capati-memory-system` repo, Capati vault, or only Graphify integration artifacts.
- Exact destination for `memory_research` extension content is unknown until repo/invoke docs are inspected.
- Whether to remove Capati memory package entirely or only Graphify-related Capati memory integration is unknown.
- Whether runtime brain data should be deleted permanently or archived/quarantined is destructive and should be resolved by instructions or clarification.

## Routing Decision
Use RESEARCH first to inspect current install, clone/fetch updated repos, locate/read `invoke.md`, and identify whether clarification is required before any destructive execution. Then PLAN if safe; if research finds ambiguity in `invoke.md` or deletion scope, ask user before execution.
