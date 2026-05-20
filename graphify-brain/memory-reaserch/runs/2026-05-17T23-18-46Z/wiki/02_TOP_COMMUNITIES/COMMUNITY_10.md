---
type: community/narrative
community_id: 10
label: "Core Command Handlers"
size: 7
cohesion: 0.29
character: code
---

# Community 10: Core Command Handlers

> **7 nodes** | **Cohesion: 0.29** (moderately connected) | **Character: code**

## For Humans

### The Front Desk

Walk into any office and the first person you meet is at the front desk. They don't run the
company — but they know where everyone sits, how to route your request, and who to call. They
also keep the visitor log and produce the daily report.

The Core Command Handlers are the front desk of the graphify-brain. `handleLoad()` loads your
saved memory. `handleLoadRun()` loads a specific run. `handleRuns()` lists everything you've
saved. `handleStats()` produces the dashboard. And `slugify()` — the #3 god node with 17
connections — is the universal name normalizer that every other subsystem depends on to turn
project names into filesystem-safe identifiers.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CORE COMMAND HANDLERS                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        UTILITY BELT                                    │ │
│  │                                                                       │ │
│  │  slugify() [17 edges, #3 God Node]                                   │ │
│  │     "My Cool Project!" ──▶ "my-cool-project"                          │ │
│  │     Used by: C4, C5, C6, C7, C8, C9, C11, C12                        │ │
│  │                                                                       │ │
│  │  dirSize() ──▶ Recursive directory size calculator                    │ │
│  │                                                                       │ │
│  │  formatBytes() ──▶ 1234567 ──▶ "1.18 MB"                              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      COMMAND HANDLERS                                  │ │
│  │                                                                       │ │
│  │  handleLoad() ──▶ /memory load [project]                              │ │
│  │     Loads most recent or specified run's memory into context           │ │
│  │                                                                       │ │
│  │  handleLoadRun() ──▶ /memory load [project] [run]                     │ │
│  │     Loads a specific run by ID or index                                │ │
│  │                                                                       │ │
│  │  handleRuns() ──▶ /memory runs [project]                              │ │
│  │     Lists all saved runs with timestamps, temperatures, states         │ │
│  │                                                                       │ │
│  │  handleStats() ──▶ /memory stats                                      │ │
│  │     Shows aggregate: total runs, disk usage, temp distribution        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Core Command Handlers are the **user's interface to stored memory**. Every `/memory` command
that retrieves or inspects data goes through this community:

- **handleLoad()** and **handleLoadRun()** are the most-used commands in the system. When Pi starts
  a session, `handleLoad()` fires to inject past memory into the current context. `handleLoadRun()`
  lets you load a specific historical session.

- **handleRuns()** is the browser. It lists every saved run for a project, showing when each was
  created, its temperature, compression state, and prune score. This is how you survey your memory.

- **handleStats()** is the dashboard. It aggregates across all projects to show total disk usage,
  temperature distribution (how many hot/warm/cold runs you have), and GC statistics.

- **slugify()** is the unsung hero. At 17 connections (#3 god node), it normalizes arbitrary
  project names into safe directory names. "My Cool Project!" becomes "my-cool-project". Without
  it, every path resolver would need its own normalization logic.

- **dirSize()** and **formatBytes()** are the display utilities. `handleStats()` and `handleRuns()`
  use them to show human-readable sizes like "2.4 GB" instead of raw byte counts.

### Key Nodes

- **slugify()** (17 connections): The #3 god node. Normalizes project names into filesystem-safe identifiers. Every subsystem that touches project directories calls this. It handles Unicode, special characters, duplicate dashes, and leading/trailing separators.

- **handleStats()** (5 connections): The aggregator. Reads every project's brain-meta.json, calculates totals, reads HeatTracker stats, and formats a comprehensive status dashboard.

- **formatBytes()** (3 connections): The formatter. Converts raw byte counts to human-readable strings with appropriate units (B, KB, MB, GB).

- **handleLoad()** (3 connections): The primary loader. Resolves the current project, finds the most recent run, loads its graph and metadata, and prepares context injection.

- **handleLoadRun()** (3 connections): The specific loader. Takes a run ID or index, resolves it, and loads that exact run. Used when you want memory from a specific past session.

- **handleRuns()** (3 connections): The lister. Enumerates all runs for a project with metadata summaries.

- **dirSize()** (2 connections): The disk usage calculator. Recursively sums file sizes in a directory tree. Also used by the GC subsystem to estimate how much space will be freed.

### Bridge Analysis

The Core Command Handlers bridge widely because `slugify()` is used everywhere:

- **Obsidian Vault Integration (C4)** — 8 edges. All handlers live in `graphify.ts`. `slugify()` is called from within the vault functions for path normalization.

- **Run Management Engine (C5)** — 10 edges. `handleLoad()`, `handleLoadRun()`, and `handleRuns()` all call `runDirFor()`, `loadRunMeta()`, and `recordRunAccess()` from C5. `slugify()` is called by multiple C5 path resolvers.

- **HeatTracker Core (C6)** — 1 edge. `handleStats()` reads `.getStats()` from the HeatTracker to report temperature distribution.

- **GC & Context Selectors (C9)** — 2 edges. `projectDirForSlug()` in C9 calls `slugify()` for name resolution.

- **Fractal Compression Engine (C8)** — 2 edges. `handleCompress()` in C8 calls `slugify()` for output path normalization.

## For LLMs

### Data

- **ID:** 10
- **Label:** Core Command Handlers
- **Size:** 7 nodes
- **Cohesion:** 0.29
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **slugify()** -- 17 connections [code]
- **handleStats()** -- 5 connections [code]
- **formatBytes()** -- 3 connections [code]
- **handleLoad()** -- 3 connections [code]
- **handleLoadRun()** -- 3 connections [code]
- **handleRuns()** -- 3 connections [code]
- **dirSize()** -- 2 connections [code]

### Cross-Community Connections

- **Obsidian Vault Integration** (C4) -- 8 edge(s)
  - All functions contained in graphify.ts
  - slugify() called by vault functions, handleWikiSyncCurrent()
- **Run Management Engine** (C5) -- 10 edge(s)
  - handleLoad() -> runDirFor(), loadRunMeta(), recordRunAccess()
  - handleLoadRun() -> runDirFor(), loadRunMeta()
  - handleRuns() -> runDirFor(), findRunMetas()
  - slugify() called by multiple C5 path functions
- **HeatTracker Core** (C6) -- 1 edge(s)
  - handleStats() -> .getStats()
- **GC & Context Selectors** (C9) -- 2 edge(s)
  - projectDirForSlug() -> slugify()
- **Fractal Compression Engine** (C8) -- 2 edge(s)
  - handleCompress() -> slugify()
