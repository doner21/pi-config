---
type: community/narrative
community_id: 4
label: "Obsidian Vault Integration"
size: 23
cohesion: 0.15
character: code
---

# Community 4: Obsidian Vault Integration

> **23 nodes** | **Cohesion: 0.15** (loosely connected) | **Character: code**

## For Humans

### The Showcase

Think of a museum curator. They don't dig up the fossils — but they arrange them beautifully, add
informational placards, and make sure visitors can find what they're looking for. The Obsidian
Vault Integration is the curator of the graphify-brain. It takes raw knowledge graphs and turns
them into a browsable Obsidian vault of linked markdown files, complete with wiki pages, backlinks,
and community narratives.

But the vault integration is more than just a viewer. The entire codebase lives inside
`graphify.ts` — a single file with **84 connections**, making it the most-connected node
in the entire graph. This file contains the HeatTracker class, all command handlers, the
compression engine, the archetype detector, and the vault sync logic. It is, for better or
worse, the monolith at the center of everything.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OBSIDIAN VAULT INTEGRATION                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   graphify.ts [84 edges, THE MONOLITH]                 │ │
│  │                                                                       │ │
│  │  This file CONTAINS functions that the community detection places in:  │ │
│  │  C4 (vault functions), C5 (run manager), C6 (HeatTracker),            │ │
│  │  C8 (compression), C9 (GC), C10 (command handlers), C11 (archetypes)  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐    │
│  │       VAULT OPERATIONS         │  │      WIKI OPERATIONS           │    │
│  │                                │  │                                │    │
│  │  ensureVault()                 │  │  handleWikiSyncCurrent()       │    │
│  │  ── Creates vault dir if      │  │  ── Syncs current project's    │    │
│  │     missing                    │  │     graph to wiki pages        │    │
│  │                                │  │                                │    │
│  │  copyObsidianToVault()         │  │  handleWikiSyncAll()           │    │
│  │  ── Copies run artifacts to    │  │  ── Syncs ALL projects'        │    │
│  │     Obsidian vault             │  │     graphs to wiki             │    │
│  │                                │  │                                │    │
│  │  rebuildVaultIndex()           │  │  handleWikiOpen()              │    │
│  │  ── Reindexes vault from       │  │  ── Opens wiki in Obsidian     │    │
│  │     disk after changes         │  │                                │    │
│  │                                │  │  handleWikiNotes()             │    │
│  │  openInObsidian()              │  │  ── Creates/opens daily notes  │    │
│  │  ── Opens vault in Obsidian    │  │                                │    │
│  │     with obsidian:// URI       │  │  countRunArtifacts()            │    │
│  │                                │  │  ── Counts files per run       │    │
│  │  extractSections()             │  │                                │    │
│  │  ── Splits markdown into       │  │  normalizeStringArray()         │    │
│  │     frontmatter + body         │  │  ── Utility for array cleanup  │    │
│  │                                │  │                                │    │
│  │  brainContextForCwd()          │  │  normalizeRunMeta()             │    │
│  │  ── Loads memory for current   │  │  ── Normalizes run metadata     │    │
│  │     working directory          │  │     to consistent format        │    │
│  └────────────────────────────────┘  └────────────────────────────────┘    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                  COMMUNITY DETECTION PIPELINE                          │ │
│  │                                                                       │ │
│  │  detectCommunities() ──▶ detectCommunitiesTS() OR detectCommunities-  │ │
│  │                            Python()                                   │ │
│  │                                                                       │ │
│  │  ─ Uses Louvain/Leiden algorithm to partition graph nodes            │ │
│  │  ─ Fallback chain: TypeScript impl → Python graphifyy package         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     NODE.JS RUNTIME IMPORTS                            │ │
│  │                                                                       │ │
│  │  node_fs ── File system operations (read/write/copy)                  │ │
│  │  node_path ── Path resolution and normalization                       │ │
│  │  node_os ── Home directory detection, temp paths                      │ │
│  │  node_crypto ── SHA-256 hashing for file checksums                    │ │
│  │  pi_tui ── Pi TUI integration for command registration               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Obsidian Vault Integration serves three roles:

**1. External Viewer:** The vault turns knowledge graphs into an Obsidian-friendly directory of
linked markdown files. Each community becomes a page, each run becomes a note, and connections
become wikilinks. This means you can browse your knowledge graph with Obsidian's graph view,
search, and backlinks — no Pi session required.

**2. Wiki Generation:** The `/memory-wiki` commands (`handleWikiSyncCurrent`, `handleWikiSyncAll`)
generate the entire wiki structure you're reading right now. Wiki pages are written to the vault
directory, organized by category (overview, system layers, communities, decisions, LLM instructions).

**3. The Monolith:** `graphify.ts` is the most-connected single file in the system (84 edges).
The community detection algorithm correctly identifies the vault functions (ensureVault, copy,
wiki handlers) as one community, but the file itself contains functions assigned to 7 different
communities. This reflects a real architectural choice: everything lives in one extension file
to simplify Pi's extension loading, at the cost of internal modularity.

### Key Nodes

- **graphify.ts** (84 connections): The monolith. Contains every function in the system. With 84
  outgoing edges, it's by far the most-connected node in the entire graph. It imports from node
  runtime modules (fs, path, os, crypto) and the Pi TUI library, and every community's functions
  are "contains" edges from this file.

- **ensureVault()** (6 connections): Creates the Obsidian vault directory structure if it doesn't
  exist. Called at startup and before any vault operation.

- **normalizeRunMeta()** (6 connections): Ensures run metadata is in a consistent format,
  handling migrations from older schema versions. Called by `loadRunMeta()` in C5.

- **rebuildVaultIndex()** (5 connections): Scans the vault directory and rebuilds the internal
  index mapping runs to vault pages. Used after manual changes to the vault.

- **handleWikiSyncCurrent()** (5 connections): The main wiki generator. Takes the current project's
  knowledge graph, generates wiki pages (overview, layers, communities, decisions, instructions),
  and writes them to the vault.

- **brainContextForCwd()** (4 connections): The entry point for context injection. Given a working
  directory, loads all memory for the corresponding project, filters by temperature, and returns
  the formatted context string that Pi prepends to sessions.

### Bridge Analysis

The vault integration has the **widest cross-community footprint** of any community — connecting
to 7 others:

- **Graphify-Brain Architecture (C3)** — 2 edges. `graphify.ts` imports from the Pi coding agent
  harness. The community detection pipeline uses the graphifyy Python package documented in C3.

- **HeatTracker Core (C6)** — 7 edges. `graphify.ts` contains the HeatTracker class definition,
  `handleSave()`, and the freeze/compression transition functions. These are all "contains" edges
  from `graphify.ts` to methods defined within it.

- **Core Command Handlers (C10)** — 8 edges. `graphify.ts` contains `slugify()`, `dirSize()`,
  `formatBytes()`, `handleLoad()`, `handleLoadRun()`, `handleRuns()`, and `handleStats()`.

- **Run Management Engine (C5)** — 23 edges. The heaviest bridge. `graphify.ts` contains all 21
  functions in C5. `normalizeRunMeta()` calls `loadRunMeta()` and `handleKeep()`.

- **GC & Context Selectors (C9)** — 9 edges. `graphify.ts` contains all 9 functions in C9.

- **Archetype Detection Engine (C11)** — 7 edges. `graphify.ts` contains all 7 functions in C11.

- **Fractal Compression Engine (C8)** — 11 edges. `graphify.ts` contains all 10 functions in C8.
  `detectCommunities()` in C4 is called by `handleCompress()` in C8 to discover community boundaries.

### Cohesion Explained

At **0.15 cohesion**, the Obsidian Vault Integration is on the boundary of "loose." This is
accurate: the community contains three distinct concerns (vault operations, wiki generation, and
community detection) that don't strongly depend on each other. The vault functions don't call
the wiki handlers; the wiki handlers don't call the community detection pipeline. They're grouped
because they all live in `graphify.ts` and relate to the "presentation layer."

A higher cohesion here would be unexpected — these are separate subsystems that happen to share
a file. The graphify.ts monolith is the primary reason this community exists as a distinct entity.

## For LLMs

### Data

- **ID:** 4
- **Label:** Obsidian Vault Integration
- **Size:** 23 nodes
- **Cohesion:** 0.15
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **graphify.ts** -- 84 connections [code]
- **ensureVault()** -- 6 connections [code]
- **normalizeRunMeta()** -- 6 connections [code]
- **rebuildVaultIndex()** -- 5 connections [code]
- **handleWikiSyncCurrent()** -- 5 connections [code]
- **brainContextForCwd()** -- 4 connections [code]
- **copyObsidianToVault()** -- 4 connections [code]
- **extractSections()** -- 4 connections [code]
- **handleWikiSyncAll()** -- 4 connections [code]
- **openInObsidian()** -- 4 connections [code]

### Cross-Community Connections

- **Graphify-Brain Architecture** (C3) -- 2 edge(s)
  - graphify.ts -> pi_coding_agent (imports_from)
  - graphify.ts -> node_child_process (imports_from)
- **HeatTracker Core** (C6) -- 7 edge(s)
  - graphify.ts -> ensureBrainDir, HeatTracker, rebuildBrainIndex, handleSave, compressionTransition, freezeEligible (contains)
  - normalizeRunMeta() -> handleSave() (calls)
- **Core Command Handlers** (C10) -- 8 edge(s)
  - graphify.ts -> slugify, dirSize, formatBytes, handleLoad, handleLoadRun, handleRuns, handleStats (contains)
  - slugify() -> handleWikiSyncCurrent() (calls)
- **Run Management Engine** (C5) -- 23 edge(s)
  - graphify.ts -> all 21 C5 functions (contains)
  - normalizeRunMeta() -> loadRunMeta(), handleKeep() (calls)
- **GC & Context Selectors** (C9) -- 9 edge(s)
  - graphify.ts -> all 9 C9 functions (contains)
- **Archetype Detection Engine** (C11) -- 7 edge(s)
  - graphify.ts -> all 7 C11 functions (contains)
- **Fractal Compression Engine** (C8) -- 11 edge(s)
  - graphify.ts -> all 10 C8 functions (contains)
  - detectCommunities() -> handleCompress() (calls)
