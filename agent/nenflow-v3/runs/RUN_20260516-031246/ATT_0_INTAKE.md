---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260516-031246
created_at: "2026-05-16T03:25:00Z"
schema_version: 1
intake_mode: ecological-deep
skill: spec-driven-ecology
context_handoff_threshold_percent: 65
phases_completed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
human_gates_passed: [material_questions, q1_phase_boundary, q2_definition_of_built, q3_llm_dependency, human_approval]
---

# ATT_0_INTAKE — Fractal Memory System (Phases 4+5)

## Raw Prompt

```
lets build the fractal memory system use the /skill:spec-driven-ecology skill
```

## Task Summary

Implement **Phase 4 (Fractal Compression)** and **Phase 5 (Archetype Detection)** of the graphify-brain unified memory system, as specified in `03-unified-plan.md`. Extend the existing TypeScript extension (`extensions/graphify.ts`, 1781 lines) with:

1. `/memory compress <project>` — community detection + supernode collapse + LLM-generated summaries + compression state machine
2. `/memory expand <run-id>` — unfreeze a compressed run back to raw
3. `/memory zoom <run-id>` — alias for load with compression awareness
4. `/memory fuse <run-a> <run-b>` — diff/overlap summary between two runs
5. `/memory archetypes` — cross-project archetype detection (MinHash/LSH, ≥3 re-emergences → permanent)

The implementation must apply compression to the live graphify-brain (`~/.pi/graphify-brain/`) with **measurable savings and no knowledge loss**.

## Task Type

`implementation` — TypeScript extension development for the Pi coding agent harness.

## User Intent

The human wants to complete the fractal memory system that was designed in the "memory reaserch" project. Phases 1-2 (Tree memory: run-level storage, pruning, pinning, archive/GC, context injection) are already implemented and shipped. Phases 4 and 5 (Fractal compression and archetypes) are the next implementation targets. The human wants this built to completion: working commands, testable functions, and measurable compression with verified knowledge preservation.

## Goal Attractor

**Measurable compression with zero knowledge loss on the live graphify-brain at `~/.pi/graphify-brain/`.** The system should compress project runs from raw graphs to supernode-summarized graphs, detect cross-project archetypes, and produce evidence of: (a) storage reduction (node/edge count delta), (b) knowledge preservation (original graph recoverable via expand), and (c) no regressions in existing `/memory` commands.

---

## Phase 0: Intake Depth

**Selected depth:** Deep

**Rationale:** This task involves multi-phase implementation (4+5), architectural changes to an existing 1781-line TypeScript extension, irreversible data operations (compression), LLM integration for supernode summaries, and cross-project analytical features (archetypes). The system operates on the live graphify-brain at `~/.pi/graphify-brain/` — mistakes could corrupt stored memory. The intake must surface all invariants, failure modes, perturbation scenarios, and verification contracts.

---

## Phase 1: Raw Prompt Capture

### Raw Prompt (Verbatim)

```
lets build the fractal memory system use the /skill:spec-driven-ecology skill
```

### First Reading

The human wants to implement the fractal memory system — specifically Phases 4 (Fractal Compression) and 5 (Archetype Detection) from the unified plan — using the ecological spec-driven development intake methodology rather than jumping directly to code. The word "build" implies implementation, not further design.

### Immediate Unknowns

1. **Phase boundary:** Does "fractal memory system" mean Phase 4 only, Phase 5 only, or both?
2. **Definition of "built":** Does the human want design artifacts, functional code, end-to-end commands, or deployment to the live brain?
3. **LLM dependency:** The unified plan specifies "auto-generated summaries" for supernodes (Phase 4 compression). How should these be generated?

---

## Phase 2: Intent Clarification

### Clarified Intent

The human wants to implement the fractal compression and archetype detection subsystems of the graphify-brain memory extension. This means adding `/memory compress`, `/memory expand`, `/memory zoom`, `/memory fuse`, and `/memory archetypes` commands to the existing TypeScript extension. The implementation should produce working, testable, end-to-end functionality that operates on the live graphify-brain at `~/.pi/graphify-brain/`, with compression producing measurable storage savings and zero knowledge loss.

### Intent Confidence

High — the human explicitly answered three material questions and confirmed scope.

### Intent Corrections Needed

None. All three material questions have been answered with unambiguous direction.

---

## Phase 3: Purpose Clarification

### Purpose

Complete the fractal memory system to give Pi agents the ability to compress accumulated memory runs into compact, navigable summaries, and to detect recurring patterns across projects. Without compression, the brain grows unboundedly with every `/memory save`, making it progressively harder to find relevant context. Without archetypes, recurring cross-project patterns remain invisible.

### Underlying Need

The tree memory system (Phases 1-2) solved *storage management* (versioning, pruning, archiving). The fractal memory system solves *knowledge management* — compressing redundant information into higher-level summaries while preserving the ability to drill down, and detecting emergent structural patterns that span projects.

### Value Created

- `/memory compress`: Shrinks storage footprint while preserving all recoverable knowledge
- `/memory expand`: Restores full granularity when needed (no knowledge loss)
- `/memory zoom` / `/memory fuse`: Navigation and comparison across compressed states
- `/memory archetypes`: Surfaces cross-project patterns (e.g., "this API pattern appears in 5 projects") that would otherwise require manual inspection
- Measurable compression ratios provide evidence of system effectiveness

---

## Phase 4: Context Mapping

### Project

`memory reaserch` at `C:\Users\doner\memory reaserch` — design lifecycle and implementation source for graphify-brain.

### Current State

| Phase | What | Status |
|-------|------|--------|
| Phase 1 | Run-level storage (`/memory save`, `runs/` dir, `run-meta.json`) | ✅ DONE |
| Phase 2A-2H | Metadata hardening, HeatTracker, stats, pinning, pruning, archive/GC, context injection, verifier-aware metadata | ✅ DONE |
| Phase 3 | Temperature tracking (decay, state machine) | 📋 PLANNED |
| Phase 4 | Fractal compression (community detection, supernode collapse, summaries) | 📋 PLANNED |
| Phase 5 | Archetypes (MinHash/LSH, ≥3 re-emergences → permanent) | 📋 PLANNED |
| Phase 6 | WL isomorphism, semantic search | ⏸️ DEFERRED |

**Current graphify.ts state:** 1781 lines. Compression fields (`compressionState`, `archetypes`) exist in schema interfaces but have no implementation — only stub initialization to `"raw"` and empty arrays. The implementation surface is entirely greenfield within an established extension.

### Desired Future State

After implementation:
- `/memory compress <project>` works end-to-end: detects communities, generates LLM supernode summaries, collapses communities into representative nodes, writes frozen compressed state, reports compression ratio
- `/memory expand <run-id>` fully restores a compressed run to its raw graph
- `/memory zoom <run-id>` loads a specific run with compression-state awareness
- `/memory fuse <run-a> <run-b>` computes and displays diff/overlap between two runs
- `/memory archetypes` scans all projects, finds label-set patterns appearing ≥3 times, promotes to permanent archetypes in `brain-meta.json`
- Compression produces measurable savings (node count reduction, edge count reduction) with verified recoverability
- All existing `/memory` commands (save, load, list, runs, stats, prune, pin, unpin, gc, keep) continue to work without regression

### Source-of-Truth Materials

- `C:\Users\doner\memory reaserch\02-fractal-memory-proposal.md` — fractal memory design (494+ lines)
- `C:\Users\doner\memory reaserch\03-unified-plan.md` — unified architecture, Phase 4-5 specs, conflict resolutions, compression state machine
- `C:\Users\doner\memory reaserch\memory-system-improvement-handoff.md` — 6 non-negotiable invariants, 8 verification gates
- `C:\Users\doner\memory reaserch\extensions\graphify.ts` — main extension (1781 lines), existing codebase
- `C:\Users\doner\memory reaserch\README.md` — implementation status, command reference, invariants summary
- `C:\Users\doner\.pi\agent\skills\graphify\SKILL.md` — graphify skill, Step 5 community labeling pattern (LLM summary generation)
- `C:\Users\doner\memory reaserch\TUTORIAL.md` — user-facing command documentation
- `C:\Users\doner\memory reaserch\PHASE3A_USER_TESTS.md` — 11 existing test procedures

### Actors

- **Human requester:** Doner (project owner, Pi user)
- **Intake Agent:** Current Pi session (NenFlow v3 ORCHESTRATOR in ecological intake mode)
- **Planner:** `pev-planner` subagent (NenFlow v3) — converts this intake into staged tasks
- **Executor:** `pev-executor` subagent (NenFlow v3) — implements code changes in `graphify.ts`
- **Verifier:** `pev-verifier` subagent (NenFlow v3) — tests against success criteria, invariants, falsifiers
- **End user:** Doner (uses `/memory compress`, `/memory archetypes`, etc. in Pi)
- **Graphify skill consumer:** The graphify pipeline (Step 5 community labeling) — pattern to adapt for LLM summary generation

### Tools Available

- Pi coding agent harness (file read/write, bash, TypeScript execution)
- Existing graphify.ts extension (1781 lines, well-structured)
- Existing graphify Python package (community detection via Louvain/Leiden)
- Graphify skill's community labeling pattern (LLM-based summary generation)
- `~/.pi/graphify-brain/` live brain directory (for testing with real data)
- Git history and project documentation
- `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` (project knowledge graph)

### Tools Unavailable

- No direct access to run graphify Python package from TypeScript (cross-language boundary)
- No pre-built supernode summary generation infrastructure
- No LSH/MinHash library in the current TypeScript extension dependencies

### Known Limits

- Compression operates on `graph.json` node-link data structures — must work with existing graph schemas
- Community detection may require calling the graphify Python package from TypeScript (subprocess boundary)
- LLM summary generation requires the Pi agent to be active (not a standalone library call)
- The graphify-brain may contain multiple projects with real saved runs — implementation must not corrupt existing data
- Phase 3 (temperature tracking) is not yet fully implemented and may interact with compression state transitions

---

## Phase 5: Epistemic Separation

### Known (Facts Explicitly Provided or in Source-of-Truth)

1. The project is `C:\Users\doner\memory reaserch`
2. The extension lives at `extensions/graphify.ts` (1781 lines)
3. Phases 1+2 are implemented and shipped
4. Phases 4+5 are the target scope (confirmed by human: "Both compression AND archetypes")
5. The unified plan specifies: community detection (Louvain/Leiden), supernode collapse, `raw → communities → compressed → frozen` state machine, MinHash/LSH for archetypes, ≥3 re-emergences → permanent
6. `compressionState` and `archetypes` fields exist in TypeScript schema interfaces (lines 100, 120, 150 of graphify.ts) but are only stub-initialized
7. The graphify-brain live directory is `~/.pi/graphify-brain/` (on Windows: `C:\Users\doner\.pi\graphify-brain\`)
8. The existing graphify skill's Step 5 community labeling generates descriptive names/summaries from community node labels using the active LLM agent
9. `/memory-wiki:2` does not exist as a subcommand — the relevant pattern is Step 5 of graphify skill
10. The project knowledge graph has 213 nodes, 402 edges, 12 communities
11. Community 6 ("Fractal Compression" concepts) has cohesion 0.2 with 12 nodes including Compression State Machine, FractalNode Schema, Supernode Aggregation, FCA, HDC/VSA
12. Definition of "built" is D: functions exist and are testable, commands work end-to-end in the Pi harness, AND compression is applied to the live brain with measurable savings and no knowledge loss
13. The existing 6 non-negotiable invariants from `memory-system-improvement-handoff.md` apply to this work
14. The existing 8 verification gates are the baseline for regression testing

### Inferred (Reasonable Interpretations with Basis)

1. Phase 3 (Temperature tracking) implementation may need to be completed before or alongside Phase 4, since the compression state machine references temperature. *Basis: README lists Phase 3 as "PLANNED", unified plan shows temperature integration with compression state.*
2. Community detection will likely be performed by shelling out to the graphify Python package's `graphify.cluster` module. *Basis: The graphify Python package already implements Louvain/Leiden clustering. The project knowledge graph is built by this package. It would be wasteful to reimplement community detection in TypeScript.*
3. Supernode summary generation will use a pattern similar to graphify skill Step 5: read community node labels, present to the active LLM agent, receive 1-3 sentence descriptive summary. *Basis: Confirmed by human answer Q3.*
4. The implementation should be additive to graphify.ts, not a rewrite. *Basis: The existing codebase already has compression field stubs and the project convention is additive extension (runs/ was added under existing structure).*
5. The `communities.json` artifact specified in the unified plan will be written alongside existing run artifacts. *Basis: Unified plan data model shows `communities.json` in run directories for Phase 4.*
6. Compression will be reversible via `/memory expand` — the original graph is preserved in the run directory, not mutated in place. *Basis: Unified plan states "original preserved" and the state machine includes `expand` back to `raw`.*

### Assumed (Working Assumptions, Temporary)

1. The graphify Python package is installed and available at the path referenced in the graphify skill. *Basis: The project has been graphified successfully (graphify-out/ exists with 213 nodes).*
2. The existing graphify-brain at `~/.pi/graphify-brain/` contains sufficient real data for meaningful compression testing. *Basis: The human has been using graphify-brain across multiple projects (8.4 project graphs saved per global brain).*
3. MinHash/LSH for archetype detection can be implemented in pure TypeScript without external dependencies. *Basis: MinHash is algorithmically simple (shingling + hash functions + Jaccard estimation). The existing `@sinclair/typebox` dependency is for schema validation, not LSH.*
4. The human will perform the actual `/memory compress` and `/memory archetypes` commands on the live brain as part of acceptance testing. *Basis: Definition of "built" includes "compression is applied to the live brain."*
5. No new npm dependencies are needed beyond what's already in `extensions/package.json` (`@modelcontextprotocol/sdk`, `@sinclair/typebox`). *Basis: MinHash is implementable with standard crypto/string operations. Community detection is via external Python process.*

### Unknown (Missing Information)

1. **Phase 3 interaction:** Should temperature tracking (Phase 3) be implemented before, during, or after Phase 4 compression? The compression state machine (`raw → communities → compressed → frozen`) may need temperature data to decide freeze eligibility. *Not yet asked — deferred to Planner.*
2. **Community detection boundary:** Should community detection call the graphify Python package via subprocess, or should it be reimplemented in TypeScript? The unified plan says "simple label propagation" is an option. *Deferred to Planner — both approaches are viable.*
3. **Supernode summary storage:** Where exactly should LLM-generated summaries be persisted? In `communities.json`? In `run-meta.json`? In a new `supernodes.json`? *Deferred to Planner — unified plan doesn't specify exact artifact path.*
4. **Compression granularity:** Should `/memory compress <project>` compress ALL runs or only the LATEST run? The unified plan shows `compressionState` on individual runs, suggesting per-run compression. *Deferred to Planner for UX decision.*
5. **Archetype signature format:** The unified plan says "representative node label signature" as `string[]`. Should this be tokenized? MinHash requires shingling — shingle size (k-gram length) needs to be decided. *Deferred to Planner.*

### Material Unknowns (Could Change Scope, Risk, Architecture, or Verification)

1. ~~**Phase boundary:** Phases 4 only, 5 only, or both?~~ **RESOLVED:** Both Phase 4 (compression) AND Phase 5 (archetypes).
2. ~~**Definition of "built":** Design, code, commands, or live deployment?~~ **RESOLVED:** D — All of the above (functions exist and testable, commands work end-to-end, compression applied to live brain with measurable savings and no knowledge loss).
3. ~~**LLM dependency for supernode summaries:** How should agent-generated summaries be integrated?~~ **RESOLVED:** Adapt the graphify skill's Step 5 community labeling pattern. The Pi agent reads community node labels and generates 1-3 sentence summaries. No external API integration needed — leverages the active LLM session.

---

## Phase 6: Invariant Discovery

### 1. Zero Knowledge Loss Under Compression
- **Why it matters:** Compression must not destroy recoverable information. The original graph must be fully restorable via `/memory expand`.
- **Verification method:** Compress a run, expand it, compare node/edge/hyperedge counts to original. Diff graphs for structural equivalence.

### 2. Backward Compatibility (Existing Invariant #1)
- **Why it matters:** Project-root LATEST artifacts (`graph.json`, `GRAPH_REPORT.md`, `wiki/`, `obsidian/`, `meta.json`) must always reflect the latest run. New compression artifacts must be additive under `runs/`.
- **Verification method:** After `/memory compress`, confirm LATEST artifacts are intact. Run existing `/memory save`, `/memory load`, `/memory list` — all must work without modification.

### 3. Dry-Run Before Mutation (Existing Invariant #4)
- **Why it matters:** Compression mutates run state. The human must be able to preview what will happen before it happens.
- **Verification method:** `/memory compress <project> --dry-run` must show compression candidates, estimated savings, and which runs would be affected, without changing any files.

### 4. Never Delete Directly (Existing Invariant #2)
- **Why it matters:** Compressed runs must remain recoverable. The raw graph must not be overwritten — compression creates a new artifact alongside the original.
- **Verification method:** After compression, confirm the original `graph.json` still exists in the run directory. Confirm `/memory expand` restores the original fully.

### 5. Original Graph Immutability
- **Why it matters:** Compression produces a *derived view* — it must never mutate the original `graph.json` that was captured at save time. The original is the source of truth.
- **Verification method:** Compare SHA-256 hash of original `graph.json` before and after compression. They must be identical.

### 6. LLM Summary Audit Trail
- **Why it matters:** Supernode summaries are LLM-generated and may lose nuance. The system must preserve enough information (community node sets, summary provenance) for a human to audit and correct summaries.
- **Verification method:** `communities.json` must contain: community ID, node IDs, edge count, cohesion score, LLM-generated summary, and a `generatedBy: "llm-agent"` provenance marker.

### 7. Archetype Idempotency
- **Why it matters:** Running `/memory archetypes` twice must produce consistent results — no duplicate archetypes, no drift in occurrence counts. Archetype detection is deterministic, not stochastic.
- **Verification method:** Run `/memory archetypes` twice on the same brain. Compare output. Archetype IDs, counts, and project memberships must be identical.

### 8. Human Pinning Overrides Automation (Existing Invariant #3, Extended)
- **Why it matters:** Pinned runs must never be compressed without explicit human override. Compression is a transformation that could obscure detail — pinned runs are pinned because the human considers them important in their raw form.
- **Verification method:** Pin a run, attempt `/memory compress`. The pinned run must be excluded from compression candidates (unless `--include-pinned` flag is provided).

### 9. Measurable Savings
- **Why it matters:** The human's definition of "built" includes "measurable savings." The system must produce concrete numbers: nodes before/after, edges before/after, compression ratio, storage bytes saved.
- **Verification method:** `/memory compress` output must include a compression report with quantitative metrics. The Verifier must independently verify these numbers.

---

## Phase 7: Constraint Mapping

### Technical Constraints
1. **TypeScript, not Python:** Implementation must be in TypeScript within `extensions/graphify.ts`. Community detection may shell out to Python but the command handlers and compression logic live in TypeScript.
2. **Existing extension pattern:** Must follow the existing command handler pattern (`case "compress": await handleCompress(ctx, pi, rest); break;`).
3. **Existing data schemas:** Must extend (not replace) `RunMeta`, `ProjectMeta`, `BrainMeta` interfaces already in graphify.ts.
4. **Node.js runtime:** Runs within Pi's Node.js extension host. File system operations via `fs` module, paths via `path` module.
5. **Cross-language community detection:** If using graphify Python package, must handle subprocess invocation, error handling, and JSON parsing from stdout.

### Design Constraints
1. **Compression state machine:** Must implement `raw → communities → compressed → frozen` exactly as specified in unified plan.
2. **Compression naming:** Commands must use the agreed nomenclature: `compress`, `expand`, `zoom`, `fuse`, `archetypes`.
3. **Supernode schema:** Must follow the fractal node schema from `02-fractal-memory-proposal.md` (children, summary, level, parent).
4. **Summary format:** LLM-generated summaries should be 1-3 sentences, descriptive, grounded in actual community node labels.

### Human Constraints
1. **No silent mutations:** All state-changing operations must report what changed and offer dry-run.
2. **Pinned runs protected:** Human pinning intent must be respected — compression excludes pinned runs by default.
3. **Human-correctable summaries:** Supernode summaries must be editable by the human without re-running compression.

### Organisational Constraints
1. **Pi extension conventions:** Must follow the existing code structure — helper functions at module scope, handlers registered in the command switch, TUI notifications via `ctx.ui.notify()`.
2. **Git-tracked source:** Changes must be committed to the `memory reaserch` repo.

### Security and Privacy Constraints
1. **No external API calls for summaries:** LLM summary generation uses the active Pi agent session, not an external API. No data leaves the local environment.
2. **File system safety:** Compression must not follow symlinks or traverse outside `~/.pi/graphify-brain/`.

### Tooling Constraints
1. **Pi agent as LLM:** Supernode summaries must be generated by the Pi agent reading community data (graphify Step 5 pattern), not by a headless API call.
2. **graphify Python package:** If used for community detection, it must be invoked via `child_process` and the output parsed as JSON.
3. **No new npm packages:** Minimize dependency additions. MinHash can use built-in `crypto` module.

### Time and Cost Constraints
1. **Implementation is expected:** This intake produces a spec, not implementation. The Planner will estimate effort.
2. **No LLM token budget for summaries during development:** Summary generation happens at runtime when the human invokes `/memory compress`.

### Verification Constraints
1. **Live brain testing:** The Verifier must test against the real `~/.pi/graphify-brain/`, not a mock.
2. **Before/after evidence:** Compression must produce comparable before/after metrics.
3. **Regression gates:** All 8 existing verification gates must still pass.
4. **Evidence is runtime:** Screenshots, command output, and file hashes — not code review alone.

---

## Phase 8: Affordance Landscape

### For the Human
- Invoke `/memory compress <project>` to compress a project's runs
- Invoke `/memory compress <project> --dry-run` to preview without mutation
- Invoke `/memory expand <run-id>` to restore a compressed run
- Invoke `/memory archetypes` to see cross-project patterns
- Edit supernode summaries manually in the generated JSON artifact
- Pin runs to protect them from compression

### For the Intake Agent
- Read all source-of-truth design documents (fractal proposal, unified plan, handoff)
- Inspect the existing graphify.ts extension code
- Map the compression state machine to TypeScript function signatures
- Define the LLM summary generation protocol (graphify Step 5 pattern adaptation)

### For the Planner
- Derive staged implementation tasks from compression state machine stages
- Decide community detection implementation approach (Python subprocess vs pure TypeScript)
- Design the supernode schema and artifact paths
- Sequence Phase 4 work with any Phase 3 temperature-tracking prerequisites
- Produce task contracts with clear acceptance criteria per command

### For the Executor
- Extend graphify.ts with new command handlers following existing patterns
- Implement community detection invocation (subprocess or pure TS)
- Implement supernode collapse with LLM summary generation
- Implement MinHash/LSH archetype detection
- Add compression report output with quantitative metrics
- Wire up the compression state machine transitions

### For the Verifier
- Run `/memory compress` on a real project with multiple runs
- Verify pre/post compression node/edge counts
- Run `/memory expand` and diff against original graph
- Run `/memory archetypes` twice and compare for idempotency
- Run all 8 existing verification gates after implementation
- Verify pinned runs are excluded from compression
- Verify dry-run produces no file changes

### Actions That Should Be Difficult or Blocked
- Compressing a run that is already `frozen` (should warn, not double-compress)
- Expanding a run that was never compressed (should be a no-op or warn)
- Compressing the only run of a project (no community pattern to detect)
- Archetype detection when <3 projects exist (cannot meet ≥3 threshold)
- Modifying the original `graph.json` in a compressed run (immutability invariant)

---

## Phase 9: Attractor and Failure-Mode Analysis

### Useful Attractors to Strengthen
1. **Small, additive diffs:** Each command is a self-contained addition to graphify.ts. The extension already has a well-established handler pattern — follow it.
2. **Read before edit:** The existing codebase is well-documented. The Executor should read graphify.ts thoroughly before adding compression logic.
3. **Evidence before claims:** Every success criterion has a concrete verification method. The Verifier must produce runtime evidence, not code review.
4. **Dry-run culture:** The project already has `--dry-run` on prune and gc. Extend this pattern to compress.
5. **Preserve originals:** The project already preserves original run artifacts under `runs/`. Compression adds a derived artifact — never replaces the original.

### Bad Attractors to Counter
1. **Overbuilding community detection:** The unified plan explicitly says "simple label propagation is sufficient" and reserves WL isomorphism for Phase 6. Resist implementing advanced graph canonization.
2. **Inventing context during LLM summary generation:** The graphify Step 5 pattern is clear: read community node labels, generate from those labels only. Do not use broader project context or hallucinate connections.
3. **Compression without verification:** Implementing compression is satisfying — the system produces visibly smaller graphs. But without `/memory expand` verification, there's no proof of knowledge preservation.
4. **Scope creep into Phase 6:** WL isomorphism, semantic search, and sub-node expansion are explicitly deferred. Resist implementing them "while we're in there."
5. **Schema migration without backward compat:** Adding new fields to `RunMeta` or `BrainMeta` must be backward-compatible. Old runs without compression fields must load without error.
6. **Silent compression:** The Executor might compress and report success without showing the human what was changed. Every compression must display a before/after report.
7. **Treating LLM summaries as ground truth:** Supernode summaries are useful navigation aids, not authoritative knowledge. The system must preserve the original community node set alongside the summary.

### Counter-Constraints
- **Immutable original graph:** The `graph.json` in a run directory must never be modified after save. Compression writes to a separate artifact.
- **Summary provenance marker:** Every LLM-generated summary must include a `generatedBy` field and timestamp.
- **Expand-first verification:** Before shipping, the Executor must demonstrate that `expand` restores the original graph exactly.

### Early Warning Signs
- **Drift:** Compression code starts modifying `handleSave()` or `handleLoad()` behavior instead of adding new handlers.
- **Overbuild:** Community detection implementation exceeds 200 lines — the unified plan says "simple label propagation."
- **Weak verification:** The Verifier reports "code looks correct" without diffing expanded graphs against originals.
- **Summary hallucination:** Supernode summaries mention concepts not present in community node labels.

---

## Phase 10: Scope and Boundary Setting

### In Scope
1. `/memory compress <project>` — community detection, supernode collapse, LLM summary generation, compression state transitions
2. `/memory compress <project> --dry-run` — preview mode showing candidates and estimated savings
3. `/memory expand <run-id>` — full restoration from compressed state to raw graph
4. `/memory zoom <run-id>` — load a specific run with compression-state awareness (alias for `load --run` with temperature recording)
5. `/memory fuse <run-a> <run-b>` — diff/overlap summary between two runs
6. `/memory archetypes` — MinHash/LSH detection, ≥3 re-emergences promotion, `brain-meta.json` persistence
7. TypeScript implementation in `extensions/graphify.ts`
8. LLM summary generation via graphify Step 5 community labeling pattern
9. Compression report with quantitative metrics (nodes before/after, edges before/after, ratio)
10. Backward compatibility with all existing `/memory` commands
11. Pinned-run exclusion from compression (with `--include-pinned` override)

### Out of Scope
1. Phase 3 (Temperature tracking) — implementation, not design. If Phase 3 is needed as a prerequisite, this intake flags it for the Planner.
2. Phase 6 (WL isomorphism, semantic search, sub-node expansion) — explicitly deferred
3. Reimplementing community detection in TypeScript if the Python subprocess approach is chosen
4. Modifying the graphify Python package
5. UI/visualization for compressed graphs (separate concern)
6. Modifying `/memory save` or `/memory load` behavior (they should remain unchanged)
7. Documentation changes (TUTORIAL.md updates are separate from implementation)

### Deferred
1. Phase 3 completion — Planner decides sequencing relative to Phase 4
2. Phase 6 (WL isomorphism, semantic search) — future roadmap
3. Interactive compression exploration (zoom/fuse UX beyond basic command output)
4. Automatic periodic compression (cron-like background compression)

### Requires Human Gate
1. **Before irreversible compression:** The human must explicitly invoke `/memory compress` (or `--apply` if dry-run is default). No automatic compression.
2. **Pinned-run compression:** Must use explicit `--include-pinned` flag. Default is exclusion.
3. **Supernode summary correction:** Human can edit summaries in the generated artifact. System must not overwrite human-edited summaries.

---

## Phase 11: Representative Environment Design

### Real Use Context
- **Live brain:** `C:\Users\doner\.pi\graphify-brain\` — contains real project data from 8.4 projects
- **Pi harness:** The extension runs inside Pi's Node.js extension host on Windows
- **Real graph data:** Project graphs have 6-2138 nodes with 5-4245 edges (varying complexity)
- **Multiple runs:** Some projects have multiple saved runs (the `memory reaserch` project graph shows pruning infrastructure exists)

### Realistic Inputs
- **Small project:** `whisperlocal` — 6 nodes, 5 edges, 1 community — borderline compressible
- **Medium project:** `memory reaserch` — 213 nodes, 402 edges, 12 communities — ideal compression target
- **Large project:** `push_pi_to_git` — 2138 nodes, 4245 edges — stresses community detection performance
- **Multiple runs per project:** Projects may have 1-10+ runs in `runs/` directory

### Realistic Edge Cases
1. **Single-run project:** Compress fails or warns — no other runs to compare against for community patterns
2. **Already-frozen run:** Double-compress attempt — should warn, not error or corrupt
3. **Corrupted run (missing graph.json):** Compression must handle gracefully — skip, not crash
4. **Empty community (all isolated nodes):** Louvain may produce 1-node communities — supernode collapse is a no-op for these
5. **Very large community (50+ nodes):** Supernode summary must still fit in a reasonable token budget
6. **Archetype with identical label sets from same project:** Should not count as cross-project — must span ≥3 *distinct* projects
7. **Unicode project slugs:** `slugify()` produces safe directory names, but compression must handle any project name
8. **Concurrent access:** What if the human runs `/memory save` while compression is running? (Process-level serialization is acceptable — Pi runs commands sequentially.)

### Misleading Toy Conditions to Avoid
- **Synthetic 3-node graphs:** Too trivial to validate compression algorithm
- **Single-community graphs:** Real graphs have multiple communities — test with at least 5 communities
- **Empty brain:** Testing with no saved runs misses schema migration edge cases
- **All-hot runs:** Real brains have cold and warm runs — compression must handle the full temperature spectrum
- **Manually constructed identical graphs:** Archetype detection should find naturally recurring patterns, not detect artificially duplicated data

### Evidence Needed From Real or Representative Use
1. **Compression ratio on a real project:** `memory reaserch` with 213 nodes → N nodes after compression. N must be measurably smaller.
2. **Expand fidelity:** Diff between original graph.json and expanded graph.json — zero structural changes.
3. **Backward compat regression:** `/memory save`, `/memory load`, `/memory runs` all work after compression code is added.
4. **Archetype detection on live brain:** Running `/memory archetypes` on a brain with 8+ projects should detect at least one archetype (if patterns exist) or report zero correctly.
5. **Idempotent archetypes:** Second run produces identical output.

---

## Phase 12: Perturbation Tests

### 1. Vague Prompt Test
- **Perturbation:** Fresh agent receives: "add compression to the memory system"
- **Expected response:** Agent should consult this intake or the project's design docs before implementing. Should not invent a compression algorithm from scratch.
- **Failure condition:** Agent implements a novel compression scheme that doesn't match the unified plan's `raw → communities → compressed → frozen` state machine.

### 2. Overloaded Prompt Test
- **Perturbation:** Fresh agent receives: "implement phases 4, 5, and 6 of the unified plan including WL isomorphism and semantic search"
- **Expected response:** Agent should recognize Phase 6 is deferred and scope to 4+5 only, or flag the scope discrepancy.
- **Failure condition:** Agent attempts to implement WL isomorphism (Phase 6) without human approval.

### 3. Contradiction Test
- **Perturbation:** "Compress the graph but don't change any files" or "compress without using LLM-generated summaries"
- **Expected response:** Compression requires writing new artifacts — if the constraint is "no file changes," the agent should flag the contradiction. If "no LLM summaries," the agent should fall back to statistical summaries (node count, edge count, cohesion score) without LLM narrative.
- **Failure condition:** Agent silently drops requirements or produces misleading output.

### 4. Context Loss Test (Fresh Agent Handoff)
- **Perturbation:** A fresh Pi agent session receives only this ATT_0_INTAKE.md and the path to `extensions/graphify.ts`. No conversation history.
- **Expected response:** Agent can locate the extension, understand the compression state machine, identify where to add new handlers, and begin implementation without needing to ask what "fractal memory system" means.
- **Failure condition:** Agent asks the human to restate the requirements or cannot find the source files.

### 5. Verification Weakness Test
- **Perturbation:** Compression appears to work (nodes reduced, no errors) but the expanded graph is structurally different from the original (missing edges, merged nodes with wrong labels).
- **Expected response:** The Verifier must diff expanded graph against original, not just check that `/memory expand` runs without error.
- **Failure condition:** Verifier reports PASS based on "compression completed without errors" without structural diff.

### 6. Scope Creep Test
- **Perturbation:** The Executor discovers that Phase 3 (temperature tracking) is incomplete and decides to implement it "because compression needs it."
- **Expected response:** The Executor should flag the dependency and ask the Planner/human whether to implement Phase 3 first, not silently expand scope.
- **Failure condition:** graphify.ts grows by 500+ lines beyond the compression scope without explicit approval.

---

## Phase 13: Success Criteria and Falsifiers

### Success Criteria

1. **Compression reduces storage footprint measurably**
   - **Evidence required:** Before/after node count, edge count, and file size for a compressed project. Compression ratio > 1.0 for any project with ≥5 communities.
   - **Verification method:** Run `/memory compress` on a real project. Compare `graph.json` size and node/edge counts pre- and post-compression. Compute ratio.

2. **Expand restores original graph exactly**
   - **Evidence required:** Structural diff between original `graph.json` and expanded output. Zero structural differences (identical nodes, edges, hyperedges).
   - **Verification method:** SHA-256 hash comparison of original `graph.json` vs expanded `graph.json`. Node-by-node, edge-by-edge diff.

3. **All existing commands work without regression**
   - **Evidence required:** Successful execution of all 12 existing `/memory` commands after compression code is added.
   - **Verification method:** Run the 8 verification gates from `memory-system-improvement-handoff.md`. Run `TUTORIAL.md` workflows. All must pass.

4. **Compression respects pinned runs**
   - **Evidence required:** Pinned runs are excluded from compression candidates by default. `--include-pinned` flag allows override.
   - **Verification method:** Pin a run, run `/memory compress --dry-run`. Verify pinned run is not listed as candidate. Run with `--include-pinned`. Verify it appears.

5. **Original graph is never mutated**
   - **Evidence required:** The `graph.json` in the run directory has an identical SHA-256 hash before and after compression.
   - **Verification method:** Hash original `graph.json` before compression. Run `/memory compress`. Hash again. Compare.

6. **Supernode summaries are grounded in community node labels**
   - **Evidence required:** Every supernode summary references concepts that exist in the community's node labels.
   - **Verification method:** For each compressed community, verify that all substantive terms in the summary appear in at least one of the community's node labels.

7. **Archetype detection is deterministic**
   - **Evidence required:** Identical output across two consecutive runs of `/memory archetypes`.
   - **Verification method:** Run `/memory archetypes` twice on the same brain. Diff outputs. Must be identical.

8. **Archetypes span ≥3 distinct projects**
   - **Evidence required:** No archetype lists the same project twice or spans <3 projects.
   - **Verification method:** For each archetype in `brain-meta.json`, verify `projectSlugs` has ≥3 unique entries.

9. **Dry-run mode changes no files**
   - **Evidence required:** File hashes before and after `/memory compress --dry-run` are identical.
   - **Verification method:** Hash all files in the project's runs directory before and after dry-run. All hashes must match.

10. **Compression report includes quantitative metrics**
    - **Evidence required:** `/memory compress` output includes: project name, run ID, nodes before/after, edges before/after, compression ratio, communities detected, communities compressed, total bytes saved.
    - **Verification method:** Read command output. Verify all fields are present and numeric values are internally consistent.

### Falsifiers

1. **Expanded graph is structurally different from original**
   - **Why it invalidates success:** The core invariant is "zero knowledge loss." If expand doesn't produce the original graph, knowledge was lost during compression.

2. **Compression mutates the original `graph.json`**
   - **Why it invalidates success:** The original is the source of truth. Mutation means there's no way to audit what was compressed or recover lost detail.

3. **Existing `/memory` commands break**
   - **Why it invalidates success:** The implementation must be additive. Breaking existing functionality means the extension is corrupted.

4. **Supernode summaries fabricate concepts not in community labels**
   - **Why it invalidates success:** LLM hallucination in summaries introduces false knowledge into the compressed brain.

5. **Archetype output is non-deterministic**
   - **Why it invalidates success:** Non-deterministic archetype detection means the system is stochastic, not analytical. The human cannot trust the results.

6. **Pinned runs are compressed without human consent**
   - **Why it invalidates success:** Violates the human pinning override invariant.

7. **Compression produces no measurable reduction**
   - **Why it invalidates success:** The human explicitly requires "measurable savings." Zero or negative compression ratio means the system fails its core purpose.

---

## Phase 14: Human Review Gate

### My Current Understanding

We are implementing Phases 4 (Fractal Compression) and 5 (Archetype Detection) of the graphify-brain unified plan as TypeScript extensions to `extensions/graphify.ts`. The implementation adds five new commands (`/memory compress`, `expand`, `zoom`, `fuse`, `archetypes`) that:

1. Detect graph communities (via graphify Python package subprocess or pure TS label propagation)
2. Generate LLM supernode summaries using the graphify skill's Step 5 community labeling pattern
3. Collapse communities into summarized supernodes with a `raw → communities → compressed → frozen` state machine
4. Preserve original graphs immutably alongside compressed artifacts
5. Detect cross-project archetypes using MinHash/LSH with a ≥3-project threshold
6. Produce measurable compression metrics and deterministic archetype output

The work must be backward-compatible, respect pinned runs, offer dry-run mode, never mutate original graphs, and produce runtime evidence of both compression savings and knowledge preservation.

### Decisions I Believe Are Settled
- Scope: Phases 4 + 5 only. Phase 6 is deferred. Phase 3 interaction is flagged for Planner.
- LLM summaries: Adapt graphify skill Step 5 pattern — agent reads community labels, generates 1-3 sentence summaries.
- Definition of done: Working commands + testable functions + live-brain compression with measurable savings.
- Pinned-run protection: Excluded by default, `--include-pinned` to override.
- Dry-run pattern: Extended from existing prune/gc conventions.
- Original immutability: SHA-256 verified before/after.

### Decisions Still Open
1. Community detection implementation approach (Python subprocess vs pure TS). *Belongs to Planner.*
2. Supernode summary artifact path (communities.json? supernodes.json?). *Belongs to Planner.*
3. Phase 3 sequencing relative to Phase 4. *Belongs to Planner.*
4. MinHash shingle size (k-gram length). *Belongs to Planner/Executor.*

### Assumptions I Am Carrying
1. Graphify Python package is installed and callable from TypeScript via subprocess.
2. Live brain at `~/.pi/graphify-brain/` contains sufficient data for realistic testing.
3. MinHash/LSH is implementable in pure TypeScript without new dependencies.
4. No new npm packages needed.

### Ready for Planning?
**Yes** — all material questions are resolved, invariants are named, constraints are mapped, success criteria are observable, falsifiers are explicit, and scope is bounded.

### Human Approval
⏳ **AWAITING APPROVAL** — Review the intake above. Confirm or correct:
1. The phase boundary (Phases 4+5, not Phase 3 or 6)
2. The definition of "built" (D: all of the above)
3. The LLM summary generation approach (graphify Step 5 pattern)
4. The nine invariants, especially #5 (original graph immutability) and #9 (measurable savings)
5. The scope boundaries — specifically that Phase 3 is flagged for Planner sequencing, not required as prerequisite

---

## Phase 15: Final Intake Spec Synthesis

### Planning Readiness

**Ready** — All 15 phases are complete. The intake satisfies the Intake Readiness Checklist:

- [x] Raw prompt preserved
- [x] Intent clarified
- [x] Purpose clarified
- [x] Context mapped (project, codebase, actors, tools)
- [x] Known, inferred, assumed, and unknown separated
- [x] Invariants named (9 invariants with verification methods)
- [x] Constraints named (7 categories)
- [x] Affordances mapped (6 role perspectives)
- [x] Attractors and risks identified (7 good, 7 bad, 4 counter-constraints, 4 warning signs)
- [x] Scope bounded (in/out/deferred/gated)
- [x] Representative environment described (real brain, realistic edge cases)
- [x] Perturbation tests included (6 scenarios)
- [x] Success criteria are observable (10 criteria with evidence requirements)
- [x] Falsifiers are explicit (7 failure conditions)
- [x] Human gates named (3 gates: irreversible compression, pinned-run override, summary correction)
- [x] Planning readiness stated (Ready)
- [x] Next agent identified (pev-planner)

### Recommended Next Agent

**Planner** (`pev-planner` in NenFlow v3)

The Planner should:
1. Decide community detection approach (Python subprocess vs pure TS label propagation)
2. Sequence Phase 4 work relative to any Phase 3 prerequisites
3. Design artifact paths for `communities.json` and supernode summaries
4. Produce staged tasks with clear acceptance criteria per command
5. Define MinHash parameters (shingle size, hash count, LSH band size)
6. Specify the LLM summary generation protocol in enough detail for the Executor

### Handoff Notes for the Planner

1. **The graphify TypeScript extension lives at `extensions/graphify.ts`** (1781 lines). New handlers follow the existing `case "command": await handleCommand(ctx, pi, rest); break;` pattern. Helper functions go at module scope above the command switch.

2. **The compression state machine is `raw → communities → compressed → frozen`.** Each state transition writes to `run-meta.json` and possibly creates new artifacts. `frozen` is the terminal state — read-only, expandable back to `raw`.

3. **Community detection:** The unified plan says "simple label propagation" is an option. The graphify Python package already has Louvain/Leiden via `graphify.cluster`. The Planner must decide which to use and justify the choice. If Python subprocess: handle `child_process.spawn`, parse JSON stdout, handle errors. If pure TS: implement label propagation or Louvain on the existing `graph.json` node-link structure.

4. **LLM summary generation protocol:**
   - Read community node labels from `graph.json` (filter by community ID)
   - Present to the active Pi agent: "Community N: [list of node labels]. Write a 1-3 sentence summary."
   - The agent generates a descriptive summary grounded in those labels
   - Store alongside community metadata with `generatedBy: "llm-agent"` and timestamp
   - This is the graphify skill Step 5 pattern adapted for supernode generation

5. **Archetype detection approach:**
   - For each project run in `raw` state, collect node label sets
   - Shingle each label set (k-grams of characters or words)
   - Compute MinHash signatures (e.g., 128 hash functions)
   - LSH banding to find candidate pairs above similarity threshold
   - Group candidates that appear in ≥3 distinct project slugs
   - Promote to archetypes in `brain-meta.json`
   - The `archetypes` array schema already exists at line 120 of graphify.ts

6. **Backward compatibility is paramount.** All new fields in `RunMeta` and `BrainMeta` must be optional or have defaults. The `meta.json` `schemaVersion: 2` discriminator already exists. Old runs without compression fields must load without error.

7. **The live brain path is `PATH.join(require('os').homedir(), '.pi', 'graphify-brain')`** — already defined as `BRAIN_DIR` in graphify.ts.

8. **The Planner may discover that Phase 3 (temperature tracking) is a prerequisite** for the compression state machine (e.g., temperature may determine `freeze` eligibility). If so, flag this in the plan. The human has not committed to implementing Phase 3 first — it's a Planner decision with human consultation.

9. **Testing data:** The live brain at `~/.pi/graphify-brain/` contains 8.4 project graphs. The `memory reaserch` project itself (213 nodes, 402 edges, 12 communities) is an ideal compression test target.

10. **The 6 non-negotiable invariants from `memory-system-improvement-handoff.md`** are baseline. The 9 invariants in this intake extend them for compression/archetypes. All must be preserved.

---

## Ecological Supplements Summary

### Epistemic Map
- **Known:** 14 explicit facts (project path, file sizes, existing commands, human answers, schema stubs, graphify-brain layout, graphify skill pattern)
- **Inferred:** 6 reasonable interpretations (Phase 3 interaction, Python subprocess approach, additive implementation pattern, artifact paths, graph preservation, graphify package availability)
- **Assumed:** 5 working assumptions (Python package installed, live brain has data, MinHash implementable in pure TS, human will test on live brain, no new npm deps)
- **Material Unknowns:** 3 resolved, 5 deferred to Planner

### Affordance Landscape
6 role perspectives mapped (Human, Intake Agent, Planner, Executor, Verifier) with 6 explicitly blocked/difficult actions

### Attractors and Failure Modes
7 useful attractors, 7 bad attractors, 4 counter-constraints, 4 early warning signs

### Perturbation Tests
6 scenarios: vague prompt, overloaded prompt, contradiction, context loss, verification weakness, scope creep

### Representative Environment
Live brain at `~/.pi/graphify-brain/` with 8.4 projects, 8 realistic edge cases, 5 misleading toy conditions to avoid

### Falsifiers
7 failure conditions that would invalidate success

### Human Gates
3 gates: irreversible compression, pinned-run override, summary correction

---

## Intake Quality Self-Check

### Fresh Agent Test
A fresh Pi agent receiving only this ATT_0_INTAKE.md and the path to `extensions/graphify.ts` can:
- Locate the extension file
- Understand what commands to implement
- Know the compression state machine
- Know the LLM summary generation protocol
- Know what NOT to touch (existing commands, Phase 6, original graph.json)
- Know what evidence is required for verification

**PASS**

### Verification Contact Test
All 10 success criteria connect to observable evidence:
- Criterion 1 → node/edge count and file size comparison
- Criterion 2 → SHA-256 hash and structural diff
- Criterion 3 → 8 verification gates + tutorial workflows
- Criterion 4 → dry-run output inspection
- Criterion 5 → SHA-256 hash before/after
- Criterion 6 → term overlap between summary and node labels
- Criterion 7 → output diff between consecutive runs
- Criterion 8 → projectSlugs uniqueness check
- Criterion 9 → file hash comparison
- Criterion 10 → command output field inspection

**PASS**

### Scope Stability Test
The scope boundaries are explicit: Phases 4+5 in scope, Phase 6 deferred, Phase 3 flagged for Planner. An Executor cannot reasonably justify touching Phase 6 (WL isomorphism) or modifying Phase 1-2 commands (save, load, prune).

**PASS**

### Invariant Preservation Test
9 invariants are named with explicit verification methods. A next agent cannot miss that original graph.json must never be mutated (Invariant #5) or that pinned runs are protected (Invariant #8).

**PASS**

### Representative Use Test
The spec specifies real brain data (8.4 projects, varying sizes), realistic edge cases (single-run projects, already-frozen runs, corrupted runs, Unicode slugs), and explicitly warns against 5 misleading toy conditions.

**PASS**
