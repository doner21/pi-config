---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260505-200732
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~5%"
---

## Task Summary
The user says the current Graphify setup does not work and asks to delete it and update it with `https://github.com/doner21/memory_research`.

## Task Type
Repository/workspace repair and replacement/update, with potentially destructive filesystem changes.

## User Intent
Replace the broken local setup with the contents or setup from the named GitHub repository, restoring a working `memory_research`/Graphify-related project state.

## Goal Attractor
A local workspace that reflects `https://github.com/doner21/memory_research` and no longer contains the broken current Graphify setup. Prefer safe replacement with backups over irreversible deletion.

## Constraints
- Stay in the current visible Pi session as ORCHESTRATOR.
- Use NenFlow v3 artifacts under the global NenFlow runs directory.
- Do not fabricate Capati memory context; current cwd was checked and no linked project matched.
- Avoid irreversible destructive deletion where a backup can satisfy the user's intent.
- Verify the result with direct filesystem/git evidence.

## Invariants
- Preserve recoverability for any existing local files/config if deletion/replacement is needed.
- Do not run `graphify update .` automatically unless explicitly required; existing global instructions say humans decide when to invoke `/graphify` after changes.
- Keep the final local workspace aligned with the requested GitHub repository URL.

## Success Criteria
- Determine the current workspace state and what Graphify artifacts/config are present.
- Determine availability/default branch of `https://github.com/doner21/memory_research`.
- Replace or update the local workspace safely from the GitHub repository.
- Remove or quarantine the broken current Graphify setup if present.
- Final verification shows expected repository files and git remote/branch status.

## Ambiguities
- "delete this" could mean delete only broken Graphify artifacts/config, or replace the entire current workspace.
- The current working directory is named `memory reaserch` (misspelled with a space) while the repository is `memory_research`.
- If the remote repository is private or inaccessible, authentication may be required.

## Routing Decision
Use RESEARCH first because the task involves external repository state and local workspace discovery before planning safe deletion/replacement. Then PLAN, EXECUTE, VERIFY.
