---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260516-031246
context_saturation_estimate: "~35%"
---

# ATT_1_PLAN — Fractal Memory System (Phases 4+5)

## Task Statement

Extend `extensions/graphify.ts` (1781 lines) with five new `/memory` commands — `compress`, `expand`, `zoom`, `fuse`, `archetypes` — implementing fractal compression (community detection, supernode collapse, LLM-generated summaries, `raw → communities → compressed → frozen` state machine) and cross-project archetype detection (MinHash/LSH, ≥3 re-emergence threshold). All existing commands and invariants must be preserved. Compression must produce measurable savings with zero knowledge loss on the live graphify-brain at `~/.pi/graphify-brain/`.

---

## Key Planning Decisions

### 1. Community Detection: Python Subprocess (Primary) + Pure-TS Label Propagation (Fallback)

**Decision:** Use Python subprocess calling `graphify.cluster` (Louvain/Leiden) as the primary approach, with a pure-TypeScript label propagation algorithm as fallback when the Python package is unavailable.

**Justification:**
- The graphify Python package (`graphifyy` on PyPI) is already installed and is the same package that built the project knowledge graphs. Its Louvain/Leiden implementation is production-tested.
- Louvain/Leiden produces higher-quality communities with formal modularity scoring compared to label propagation.
- A subprocess call is straightforward in Node.js via `child_process.execSync` — same pattern already used in the extension (`openInObsidian()` uses `execSync`).
- Pure-TS label propagation provides a zero-dependency fallback for environments where Python is unavailable. Label propagation is simple (~50 lines) and sufficient for the unified plan's stated goal: "simple label propagation is sufficient."
- The code will auto-detect: if `graphify cluster` succeeds, use Python output; if it fails (Python not installed, package not found), fall back to TypeScript label propagation with a UI notification.

### 2. Phase 3 Sequencing: Proceed in Parallel — No Blocker

**Decision:** Phase 4 (compression) can start immediately. Phase 3 temperature tracking infrastructure is already substantially implemented.

**Evidence:** The current graphify.ts already contains:
- `HeatTracker` class (lines ~200-280) with `seedHot()`, `recordAccess()`, `decayTemperatures()`, `getTemperature()`, `getEntry()`, `getStats()`
- Temperature field on `RunMeta` (`"hot" | "warm" | "cold"`)
- Temperature decay invoked on `session_start`
- Temperature integration in `computePruneScores()` (staleness component)
- The compression state machine uses temperature to decide freeze eligibility — no additional Phase 3 work is required. The `freeze` transition can check `heatTracker.getTemperature()` to gate eligibility.

**What remains for Phase 3 (non-blocking, ~20 lines):** A lightweight `updateCompressionTemperature()` helper that the compression handler calls to re-evaluate temperature during state transitions. This can be implemented within the Phase 4 code block.

### 3. Artifact Paths

All new artifacts are additive under `runs/<run-id>/` — never under project root (backward compat).

| Artifact | Path | Contents |
|---|---|---|
| `communities.json` | `runs/<run-id>/communities.json` | Community assignments, node IDs per community, cohesion scores, LLM summaries with provenance |
| `compressed-graph.json` | `runs/<run-id>/compressed-graph.json` | Supernode-collapsed graph (original `graph.json` preserved alongside) |
| `expand-manifest.json` | `runs/<run-id>/expand-manifest.json` | Map of supernode → original node IDs for expand reversibility |
| Archetype data | `brain-meta.json` → `.archetypes[]` | Field already exists in `BrainMeta` interface |
| `meta.json` (project) | `<project-slug>/meta.json` | Extended: `compressionState`, `communityCount`, `archetypeIds` |
| `run-meta.json` | `runs/<run-id>/run-meta.json` | Extended: `compressionState`, `communityCount` |

**Original graph immutability:** `graph.json` in the run directory is NEVER modified. Compression writes `compressed-graph.json` as a new file. SHA-256 hash of `graph.json` must be verified identical before and after compression.

### 4. MinHash Parameters

| Parameter | Value | Rationale |
|---|---|---|
| Shingle size (k) | 3 | Character 3-grams — standard for short text labels |
| Hash function count | 128 | Good accuracy/computation balance; ~0.05 estimation error |
| LSH bands | 16 bands × 8 rows | Jaccard ≥0.7 detection probability >0.95 |
| Similarity threshold | 0.7 Jaccard | Conservative — avoids false positive archetypes |
| Band match threshold | ≥1 band match | Standard LSH: any matching band triggers verification |

**Implementation:** Pure TypeScript using `crypto.createHash('sha256')` seeded with index for 128 independent hash functions. No new npm dependencies.

### 5. LLM Summary Protocol

Adapted from graphify skill Step 5 community labeling pattern. The Pi agent is the LLM — summaries are generated during the active session when `/memory compress` is invoked.

**Protocol (8 steps):**

1. **Read community node labels:** For each community, read `graph.json`, filter nodes by community membership, extract `label` field into a string array.

2. **Format the prompt:** For each community, construct:
   ```
   Community <id> (<N> nodes, cohesion <score>): [<label1>, <label2>, ..., <labelN>]
   Write a 1-3 sentence summary describing what these concepts collectively represent.
   Be specific and grounded in the labels — do not fabricate connections.
   ```

3. **Batch to control token usage:** If >20 communities, batch into groups of 10. Send one batch per `pi.sendUserMessage()` call.

4. **Send to agent via `pi.sendUserMessage()`:** The Executor sends the formatted prompt to the Pi agent session.

5. **Receive agent's response:** The Pi agent responds with markdown-formatted summaries. The Executor parses from the chat response.

6. **Parse summaries:** Extract community ID → summary mapping via regex: `Community (\d+): (.+)`.

7. **Store with provenance:** Write each summary into `communities.json` with `generatedBy: "llm-agent"`, `generatedAt`, `sourceNodeCount`, `sourceNodeLabels`.

8. **Fallback for unavailable agent:** If LLM summary generation fails or is skipped (`--no-summaries`), produce statistical fallback: "Community of <N> nodes (cohesion <score>) including: <top 3 labels>..."

**Key constraint:** Summaries must be grounded in community node labels. Supernode summaries are tagged with provenance — human-correctable and audit-able.

### 6. Staged Implementation Tasks with Acceptance Criteria

#### Task 4: `/memory compress <project>` Command Handler
**Lines:** ~120 new, ~5 modified (switch case)
**File:** `extensions/graphify.ts`

**What:**
- `async function handleCompress(ctx, pi, rest): Promise<void>`:
  - Parse args: `--dry-run`, `--apply`, `--include-pinned`, `--run <id>`, `--no-summaries`, `--ts-only`, `--freeze`
  - Resolve project and target run(s) via `resolveProjectRunFromArgs()`
  - Gate: if `--apply` is NOT present, run dry-run only (Invariant: compress never runs without dry-run)
  - Gate: skip pinned runs unless `--include-pinned`
  - Gate: skip already-frozen runs with a warning
  - Gate: warn if single-run project
  - **Dry-run path:** Detect communities, compute compression estimates, display table with run ID, estimated nodes before/after, edges before/after, compression ratio, communities detected, temperature
  - **Apply path:** Execute detection, generate summaries, collapse, write `compressed-graph.json`, write `communities.json`, write `expand-manifest.json`, update `run-meta.json` compressionState, report compression metrics
  - Compute and store SHA-256 of `graph.json` before modifying anything
  - Report compression metrics: project, run ID, nodes before/after, edges before/after, compression ratio, communities detected, total bytes saved, SHA-256 verification
- Register `case "compress":` in the command switch

**Acceptance criteria:**
- `/memory compress <project>` (no flags) runs dry-run by default -- no files changed
- `/memory compress <project> --apply` performs compression and reports metrics
- Pinned runs are excluded unless `--include-pinned`
- Dry-run output includes: run ID, estimated nodes before/after, communities detected, temperature, compression ratio
- Apply output includes all dry-run fields plus: actual nodes after, SHA-256 verification result
- Original `graph.json` SHA-256 is identical before and after compression

#### Task 5: `/memory expand <run-id>` Command Handler
**Lines:** ~80 new, ~3 modified
**File:** `extensions/graphify.ts`

**What:**
- `async function handleExpand(ctx, pi, rest): Promise<void>`:
  - Accept `<project> --run <id>` or just `<run-id>` (auto-resolve project)
  - Verify the run exists and has `compressionState !== "raw"`
  - Read `expand-manifest.json` to get supernode to original node mapping
  - Read original `graph.json` (the immutable original)
  - Display confirmation with node/edge counts
  - Record access via `recordRunAccess()`
  - Update `run-meta.json`: set `compressionState = "raw"`, clear `communityCount`
  - Note: `compressed-graph.json` and `communities.json` are preserved (not deleted) -- expand is non-destructive
- Register `case "expand":`

**Acceptance criteria:**
- Expand a compressed run: original node/edge counts restored
- Expand on a raw run: no-op with info notification (not error)
- Expand on a non-existent run: error notification
- `compressed-graph.json` still exists after expand (non-destructive)

#### Task 6: `/memory zoom <run-id>` + `/memory fuse <run-a> <run-b>` Handlers
**Lines:** ~100 new, ~5 modified
**File:** `extensions/graphify.ts`

**What:**
- `async function handleZoom(ctx, pi, rest): Promise<void>`:
  - Alias for `handleLoadRun()` with compression-state awareness
  - If run is compressed, display compressed graph summary instead of raw graph
  - Record access and update temperature to `hot`
- `async function handleFuse(ctx, pi, rest): Promise<void>`:
  - Accept two run-IDs with `--run` flags
  - Load both runs' graphs (or compressed graphs)
  - Compute diff: nodes in A not in B, nodes in B not in A, shared nodes (Jaccard)
  - Compute edge overlap; if both compressed, compare supernode summaries
  - Display table: | Metric | Run A | Run B | Overlap |
- Register `case "zoom":` and `case "fuse":`

**Acceptance criteria:**
- Zoom on compressed run: displays supernode list with summaries
- Zoom on raw run: behaves identically to `load --run`
- Fuse shows node/edge overlap metrics; includes summary overlap for compressed runs
- Temperature recorded for both

#### Task 7: Archetype Detection Engine + `/memory archetypes` Command
**Lines:** ~180 new, ~5 modified
**File:** `extensions/graphify.ts`

**What:**
- `function minHashSignature(labels, numHashes, shingleSize): number[]`:
  - Shingle each label into character k-grams (k=3)
  - 128 hash functions via `crypto.createHash('sha256')` with seed suffix
- `function lshBandMatch(signatures, bands, rows): Array<[number, number]>`:
  - Split 128-element signatures into 16 bands of 8 rows; hash each band to bucket
- `function detectArchetypes(brainDir): Promise<ArchetypeEntry[]>`:
  - Scan all projects; for each non-archived raw run, extract node labels, compute MinHash
  - LSH candidate matching (>=0.7 Jaccard threshold)
  - Group by project slug; filter to >=3 distinct projects
  - Build `ArchetypeEntry` with `archetypeId`, `label`, `nodePattern`, `occurrenceCount`, `projectSlugs`, `firstSeenAt`, `lastSeenAt`
  - Write to `brain-meta.json.archetypes[]`
  - Idempotent: update existing, no duplicates
- `async function handleArchetypes(ctx, pi): Promise<void>`:
  - Run `detectArchetypes()`, display table; warn if <3 projects
- Register `case "archetypes":`

**Acceptance criteria:**
- Run on live brain (8+ projects): detects 0+ archetypes correctly
- Run twice: identical output (idempotency)
- No archetype lists same project twice or has <3 unique project slugs
- `brain-meta.json` persisted; old brain-meta.json without archetypes loads without error

#### Task 8: Compression State Machine
**Lines:** ~60 new, ~10 modified
**File:** `extensions/graphify.ts`

**What:**
- `function compressionTransition(runMeta, newState): boolean`:
  - Validate: `raw->communities`, `communities->compressed`, `compressed->frozen` (cold temp), `compressed->raw`, `frozen->raw` (always), `raw->frozen` (cold temp)
  - Return false with reason for illegal transitions
- Integrate into `handleCompress` and `handleExpand`
- `function freezeEligible(runMeta, projectSlug): boolean` -- temperature must be "cold"

**Acceptance criteria:**
- All valid transitions work; `raw->compressed` (skip communities) rejected
- Double-compress warned; `frozen->raw` always works; `frozen->compressed` rejected
- Freeze only when temperature is "cold"

#### Task 9: Backward Compatibility + Regression Gates
**Lines:** ~40 new, ~15 modified
**File:** `extensions/graphify.ts`

**What:**
- All new RunMeta fields (`communityCount`) must be optional -- `normalizeRunMeta()` already preserves unknown keys via `...data` spread
- Old `brain-meta.json` must load without error -- `HeatTracker.load()` already defaults `archetypes` to `[]`
- Old `meta.json` without `compressionState` defaults to `"raw"`
- Update `handleSave()`: seed new runs with `compressionState: "raw"`
- Update `rebuildBrainIndex()`: show compression state if present
- Run all 8 existing verification gates and `TUTORIAL.md` workflows

**Acceptance criteria:**
- All 12 existing `/memory` commands work identically to pre-implementation
- Old runs without `compressionState` load correctly
- New runs seeded with `compressionState: "raw"`
- `tsc` compiles with zero errors

#### Task 10: Integration Testing on Live Brain
**Lines:** N/A (manual verification)
**What:**
- Test compression on `memory reaserch` (213 nodes, 402 edges, 12 communities):
  1. `/memory compress "memory reaserch"` (dry-run) -- no files changed
  2. `/memory compress "memory reaserch" --apply` -- compression ratio reported
  3. `/memory expand` -- original restored
  4. SHA-256 verify original `graph.json` unchanged
- Test archetype detection on live brain (~8.4 projects): run twice, verify idempotency
- Test backward compat: all 12 commands + 8 verification gates
- Test edge cases: single-run, pinned, frozen, non-existent, corrupted

**Acceptance criteria:**
- All tests pass on live brain
- Measurable compression savings (>1.0 ratio for >=5 communities)
- Zero knowledge loss (expand restores full graph)
- All invariants preserved

### 7. Testing Approach

**Primary test target:** `memory reaserch` (213 nodes, 402 edges, 12 communities) -- ideal medium-size graph. Community 6 ("Fractal Compression") at cohesion 0.2 is a good compression candidate.

**Secondary test target:** Live brain at `~/.pi/graphify-brain/` (~8.4 projects) for archetype detection.

| Test Phase | What | Data | Mode |
|---|---|---|---|
| 1 | Community detection | memory reaserch graph.json | TS fallback first, then Python |
| 2 | Supernode collapse (dry-run) | memory reaserch | Dry-run, verify estimates |
| 3 | Full compress-expand cycle | memory reaserch | Apply, verify hash, expand, verify |
| 4 | Archetype detection | Live brain | Run twice, verify idempotency |
| 5 | Backward compat regression | All projects | All 12 commands |
| 6 | Edge cases | Various | Single-run, pinned, frozen, corrupted |

**Do NOT test with:** synthetic 3-node graphs, empty brain, all-hot runs, artificially duplicated graphs.

### 8. Backward Compatibility Guarantees

1. **All new fields are optional.** `communityCount` defaults to `undefined`, `compressionState` to `"raw"`, `archetypes` to `[]`.
2. **`normalizeRunMeta()` preserves unknown keys** via `...data` spread.
3. **No project-root artifacts are moved or renamed.** All compression artifacts under `runs/<run-id>/`. Project-root `graph.json`, `GRAPH_REPORT.md`, `wiki/`, `obsidian/`, `meta.json` remain LATEST and untouched.
4. **No modification to `handleSave()`/`handleLoad()`/`handleRuns()`** beyond seeding `compressionState: "raw"` on new saves.
5. **`HeatTracker.load()` handles missing `archetypes`** (falls back to `[]`).
6. **Old `meta.json` without `compressionState`** treated as `"raw"` at read time.
7. **`compressed-graph.json` and `communities.json` are additive** -- never replace existing artifacts.

---

## Invariants

### From Intake (9 invariants):

1. **Zero knowledge loss through compression** — Original graph.json SHA-256 unchanged; expand restores full graph
2. **Backward compatibility with existing runs and commands** — All 12 commands work unchanged; old runs load without error
3. **Compress never runs without dry-run** — `--apply` flag required for mutation; default is dry-run
4. **Original graph.json never mutated** — SHA-256 verified before/after; `compressed-graph.json` is separate file
5. **LLM-generated summaries tagged with provenance** — `generatedBy: "llm-agent"`, `generatedAt` ISO timestamp
6. **Archetype detection is idempotent/repeatable** — Two consecutive runs produce identical output
7. **User-visible /memory commands preserved unchanged** — No modifications to save/load/list/runs/stats/prune/pin/unpin/gc/keep
8. **Pinned runs immune to auto-compression** — Excluded unless `--include-pinned`
9. **Measurable savings evidenced with before/after metrics** — Node count, edge count, compression ratio, bytes saved

### From Handoff (6 invariants):

10. **Backward compat** — Project-root LATEST artifacts preserved; `runs/` is additive
11. **Archive-before-delete** — Compression is non-destructive; original artifacts never deleted
12. **Pinning override** — Pinned runs immune without explicit flag
13. **Dry-run-first** — All mutating operations default to dry-run
14. **Heat-is-not-truth** — Temperature is a guidance signal, not authoritative
15. **Conservative injection** — Compression does not affect context injection behavior

### Codebase-specific invariants:

16. **`normalizeRunMeta()` is the backward-compat gateway** — all new fields flow through with defaults
17. **`HeatTracker` singleton is sole temperature source of truth**
18. **File moves use `fs.renameSync()` within same filesystem** — handle ENOENT gracefully

---

## Success Criteria

1. **Compression reduces storage footprint measurably** — Ratio > 1.0 for `memory reaserch` (12 communities)
2. **Expand restores original graph exactly** — SHA-256 hash match
3. **All existing commands work without regression** — 12 commands + 8 verification gates pass
4. **Compression respects pinned runs** — Excluded by default; `--include-pinned` overrides
5. **Original graph is never mutated** — SHA-256 verified before/after
6. **Supernode summaries are grounded** — All summary terms appear in community node labels
7. **Archetype detection is deterministic** — Identical output across two consecutive runs
8. **Archetypes span >=3 distinct projects** — No duplicate projects or <3 unique slugs
9. **Dry-run mode changes no files** — File hashes identical before/after `--dry-run`
10. **Compression report includes quantitative metrics** — Project, run ID, nodes/edges before/after, ratio, communities, bytes saved, SHA-256 result
11. **All 15 invariants verified** — Verifier must produce evidence for each
12. **`tsc` compiles with zero errors** — No TypeScript regressions
13. **Python fallback works when Python unavailable** — TS label propagation produces valid communities
14. **Old brain-meta.json without archetypes loads** — Schema version check passes
15. **Run with only 1 saved run warns gracefully** — No crash, no corrupted state

---

## Implementation Steps

### Step 1: Schema + Foundation (Task 1)
Add interfaces and helpers. No command registration yet.
- File: `extensions/graphify.ts`
- After interface definitions (~line 160): add `CommunityData`, `CompressedGraph`, `ExpandManifest`, `ArchetypeEntry` interfaces; add path helpers; add `sha256File()`; refactor `getNodeLabels()`; strengthen `BrainMeta.archetypes` type.

### Step 2: Community Detection Engine (Task 2)
- File: `extensions/graphify.ts`
- After resolveProjectRunFromArgs (~line 1450): add `detectCommunities()`, `detectCommunitiesPython()`, `detectCommunitiesTS()`, `cohesionScore()`. Test on memory reaserch graph.json.

### Step 3: Supernode Collapse + Summaries (Task 3)
- File: `extensions/graphify.ts`
- After community detection: add `collapseToSupernodes()`, `generateSummaries()`, `writeExpandManifest()`, `statisticalSummary()`. Test collapse in-memory.

### Step 4: Register `compress` Command (Task 4)
- File: `extensions/graphify.ts`
- Add `handleCompress()` function; add `case "compress":` to switch; update command description.
- Test: `/memory compress "memory reaserch"` (dry-run) then `--apply`.

### Step 5: Register `expand` + `zoom` + `fuse` (Tasks 5+6)
- File: `extensions/graphify.ts`
- Add `handleExpand()`, `handleZoom()`, `handleFuse()`; add cases to switch.

### Step 6: Archetype Detection Engine (Task 7)
- File: `extensions/graphify.ts`
- Add `minHashSignature()`, `lshBandMatch()`, `detectArchetypes()`, `handleArchetypes()`; add case.
- Test on live brain.

### Step 7: State Machine + Freeze (Task 8)
- File: `extensions/graphify.ts`
- Add `compressionTransition()`, `freezeEligible()`; integrate into handlers. Test all transition paths.

### Step 8: Backward Compat + Regression (Task 9)
- Ensure `normalizeRunMeta()` defaults; update `handleSave()`; update `rebuildBrainIndex()`; run `tsc --noEmit`; run all 12 commands + 8 verification gates.

### Step 9: Live Brain Testing (Task 10)
- Backup brain; test compress-expand cycle on memory reaserch; test archetypes x2 on live brain; test all edge cases.

### Step 10: Cleanup + Commit
- Remove debug logging; verify `tsc` passes; git commit.

---

## Handoff Notes

### Key Files
- **Implementation target:** `C:\Users\doner\memory reaserch\extensions\graphify.ts` (1781 lines)
- **Brain directory:** `C:\Users\doner\.pi\graphify-brain\`
- **Test project:** `memory reaserch` -- 213 nodes, 402 edges, 12 communities
- **Live brain:** ~8.4 projects for archetype testing
- **Design docs:** `02-fractal-memory-proposal.md`, `03-unified-plan.md`, `memory-system-improvement-handoff.md`

### Existing Code Patterns to Follow
1. Command handlers: `async function handleXxx(ctx, pi, rest): Promise<void>`
2. User feedback: `ctx.ui.notify(message, "success"|"error"|"info")`
3. LLM output: `pi.sendUserMessage(content)`
4. Run resolution: `resolveProjectRunFromArgs()`
5. Metadata: `loadRunMeta() / writeRunMeta()`
6. Temperature: `heatTracker.getTemperature(projectSlug, runId)`

### Code Regions in graphify.ts
| Lines | Section |
|---|---|
| 1-30 | Imports, constants |
| 30-100 | Helpers (slugify, splitArgs, etc.) |
| 100-160 | Interfaces (RunMeta, BrainMeta) |
| 160-280 | HeatTracker class |
| 280-500 | Brain index, context injection, wiki helpers |
| 500-600 | Extension registration (command switch) |
| 600-800 | Filesystem helpers, normalizeRunMeta, loadRunMeta |
| 800-1000 | handleSave, handleList |
| 1000-1200 | handleLoad, handleLoadRun, handleRuns |
| 1200-1400 | computePruneScores, selectMemoryForContext |
| 1400-1550 | resolveProjectRunFromArgs, findRunMetas |
| 1550-1700 | handlePrune, handlePin, handleUnpin, handleGc |
| 1700-1781 | handleKeep, handleStats, handleWiki* |

**Insert new code:**
- New interfaces: after line ~160 (after BrainMeta)
- New helper functions: after line ~60 (after existing path helpers)
- New engine functions (community detection, MinHash, collapse): after line ~1450 (after resolveProjectRunFromArgs, before handlePrune)
- New command handlers: after handleStats (~line 1700), before handleWiki*

### LLM Summary Protocol for Executor

When `/memory compress --apply` runs:
1. Executor collects community node labels from `graph.json`
2. Sends via `pi.sendUserMessage()`: formatted prompt with community labels
3. Pi agent generates 1-3 sentence summaries
4. Executor parses response (regex: `Community (\\d+): (.+)`)
5. Stores in `communities.json` with `generatedBy`, `generatedAt`, `sourceNodeCount`, `sourceNodeLabels`
6. Statistical fallback if LLM unavailable or `--no-summaries`

### Known Edge Cases
- Python subprocess fails: fall back to TS label propagation with notification
- LLM summary fails: fall back to statistical summaries
- Single run in project: `compress` warns but does not error
- `communities.json` already exists: overwrite with warning
- Compressed run re-compressed: warn, require `--force`
- Very large graph (>5000 nodes): performance warning
- Unicode project names: `slugify()` handles safely
- Brain directory missing: handlers check `fs.existsSync(BRAIN_DIR)`

### Dependencies
- No new npm packages required
- `crypto` (Node.js built-in) for SHA-256 hashing and MinHash function family
- `child_process.execSync` (already imported) for Python subprocess
- Graphify Python package (`graphifyy` on PyPI) -- already installed


[PLANNER CONTEXT — END]
self_estimate: ~38%
