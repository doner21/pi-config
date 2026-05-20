---
type: community/narrative
community_id: 9
label: "GC & Context Selectors"
size: 9
cohesion: 0.22
character: code
---

# Community 9: GC & Context Selectors

> **9 nodes** | **Cohesion: 0.22** (moderately connected) | **Character: code**

## For Humans

### The Cleanup Crew

Every museum has a team that works after hours. They sweep the floors, empty the trash, and — most
importantly — decide which exhibits stay and which go into storage. They also prepare the "visitor
highlights" flyer: a curated selection of what's most interesting right now.

The GC & Context Selectors community is that team. `handleGc()` (12 edges, the #8 god node)
sweeps through old runs, archives the stale ones, and permanently deletes those past their
30-day grace period. Meanwhile, `selectMemoryForContext()` picks the most relevant runs to
inject into the LLM's context window — ensuring Pi always remembers what matters most for the
current project.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GC & CONTEXT SELECTORS                               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     UTILITY FUNCTIONS                                 │ │
│  │  hasFlag() ──▶ Check command-line flags                               │ │
│  │  projectDirForSlug() ──▶ Map project name to directory                │ │
│  │  getProjectSlugsForCommand() ──▶ List projects for multi-project ops  │ │
│  │  addDaysIso() ──▶ Date arithmetic for grace period calculation        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     GARBAGE COLLECTION PIPELINE                       │ │
│  │                                                                       │ │
│  │  handleGc() [12 edges, #8 God Node]                                  │ │
│  │     │                                                                 │ │
│  │     ├──▶ gcCandidateReason() ──▶ Why is this run a GC candidate?     │ │
│  │     │                             (stale? redundant? obsolete?)       │ │
│  │     │                                                                 │ │
│  │     ├──▶ archiveRunDirFor() ──▶ Where to move the run                 │ │
│  │     │                            (.archive/<project>/<run>)            │ │
│  │     │                                                                 │ │
│  │     ├──▶ findArchivedRun() ──▶ Check if already archived              │ │
│  │     │                                                                 │ │
│  │     └──▶ Permanent delete (after 30-day grace period expires)        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     CONTEXT INJECTION                                 │ │
│  │                                                                       │ │
│  │  selectMemoryForContext()                                             │ │
│  │     │                                                                 │ │
│  │     ├──▶ 1. Identify current project                                 │ │
│  │     ├──▶ 2. Load all runs for this project                           │ │
│  │     ├──▶ 3. Sort by temperature: HOT runs first                      │ │
│  │     ├──▶ 4. Apply prune scores as tiebreaker                         │ │
│  │     ├──▶ 5. Truncate to fit context window budget                    │ │
│  │     └──▶ 6. Return formatted memory string                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The GC and context selection functions solve two opposite problems:

**Too much memory (GC):** Over time, runs accumulate. Disk space fills. Performance degrades.
The GC pipeline prunes old, cold, redundant runs and archives them safely. After 30 days, they're
permanently deleted. The `gcCandidateReason()` function provides transparency — every archived run
has a recorded reason why it was selected.

**Not enough memory (Context Selection):** When Pi starts a session, it needs to know what you
were working on. `selectMemoryForContext()` picks the most relevant runs — hot ones first, then
warm ones, sorted by prune score — and packs them into the context window. This is the function
that makes "/memory load" actually useful: it curates which memories the LLM sees.

### Key Nodes

- **handleGc()** (12 connections): The #8 god node. Orchestrates the entire garbage collection cycle: finds candidates by prune score, checks archive status, calculates grace period expiration, moves files, and does permanent deletion. Called by `/memory gc`.

- **projectDirForSlug()** (7 connections): The slug-to-path resolver. Given a project name like "my-app", returns the filesystem path to its memory directory. Used by nearly every command handler to find the right project's data.

- **selectMemoryForContext()** (4 connections): The context curator. Reads `brainContextForCwd()` results, filters by temperature and relevance, and formats the output for LLM context injection. This is the bridge between raw stored memory and what Pi actually sees.

- **getProjectSlugsForCommand()** (4 connections): The project enumerator. When commands operate across all projects (like `/memory gc --all`), this function lists every project that has saved runs.

- **findArchivedRun()** (4 connections): The archive lookup. Before archiving, checks if a run was already archived. Before restoring (`handleKeep`), verifies the archive exists.

- **gcCandidateReason()**: The transparency layer. Returns a human-readable reason why a run was selected for GC — "Stale (45 days)", "Redundant with run X", "Low signal score". Stored in archive metadata.

- **archiveRunDirFor()**: The path resolver for archives. Returns the destination path when moving a run from active storage to `.archive/`.

- **hasFlag()**: Simple but critical — used by `handleGc()` to parse `--dry-run`, `--force`, and `--all` flags.

- **addDaysIso()**: Date math utility for calculating the grace period expiration date. Takes an ISO timestamp and adds 30 days.

### Bridge Analysis

GC & Context Selectors bridges to six other communities:

- **Obsidian Vault Integration (C4)** — 9 edges. All functions live in `graphify.ts`.
- **Run Management Engine (C5)** — 10 edges. `handleGc()` calls `splitArgs()`, `positionalArgs()`, and `computePruneScores()` from C5 to parse commands and score candidates.
- **Core Command Handlers (C10)** — 2 edges. `projectDirForSlug()` calls `slugify()` for name normalization.
- **Fractal Compression Engine (C8)** — 2 edges. `handleGc()` uses compression state to determine GC eligibility.
- **HeatTracker Core (C6)** — 1 edge. `selectMemoryForContext()` reads `.getTemperature()` from the HeatTracker.
- **Archetype Detection Engine (C11)** — 1 edge. `handleGc()` argument parsing bridges to archetype commands.

## For LLMs

### Data

- **ID:** 9
- **Label:** GC & Context Selectors
- **Size:** 9 nodes
- **Cohesion:** 0.22
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **handleGc()** -- 12 connections [code]
- **projectDirForSlug()** -- 7 connections [code]
- **selectMemoryForContext()** -- 4 connections [code]
- **getProjectSlugsForCommand()** -- 4 connections [code]
- **findArchivedRun()** -- 4 connections [code]
- **archiveRunDirFor()** -- 3 connections [code]
- **gcCandidateReason()** -- 3 connections [code]
- **hasFlag()** -- 2 connections [code]
- **addDaysIso()** -- 2 connections [code]

### Cross-Community Connections

- **Obsidian Vault Integration** (C4) -- 9 edge(s)
  - All functions contained in graphify.ts
- **Run Management Engine** (C5) -- 10 edge(s)
  - handleGc() -> splitArgs(), positionalArgs(), computePruneScores()
  - getProjectSlugsForCommand() -> runDirFor()
- **Core Command Handlers** (C10) -- 2 edge(s)
  - projectDirForSlug() -> slugify()
- **Fractal Compression Engine** (C8) -- 2 edge(s)
  - handleGc() -> hasFlag() (shared with handleCompress)
  - archiveRunDirFor() -> compressedGraphPathFor()
- **HeatTracker Core** (C6) -- 1 edge(s)
  - selectMemoryForContext() -> .getTemperature()
- **Archetype Detection Engine** (C11) -- 1 edge(s)
  - handleGc() -> hasFlag() (shared parsing)
