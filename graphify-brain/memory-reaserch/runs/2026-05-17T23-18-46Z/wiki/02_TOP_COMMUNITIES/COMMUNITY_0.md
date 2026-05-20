---
type: community/narrative
community_id: 0
label: "Brain Storage Core"
size: 39
cohesion: 0.10
character: code
---

# Community 0: Brain Storage Core

> **39 nodes** | **Cohesion: 0.10** (loosely connected) | **Character: code**

## For Humans

### The Test Lab

Imagine a car manufacturer's testing facility. Rows of test rigs, each one exercising a different
component of the vehicle. One rig stress-tests the engine, another measures brake response, a
third simulates 100,000 miles of suspension wear. The test lab doesn't drive anyone anywhere —
it exists solely to verify that the car works.

The Brain Storage Core is the test lab for the graphify-brain. All 39 nodes come from a single
file: **graphify-test-bundle.js**. This is a comprehensive test suite that exercises nearly every
function in the system — `slugify()`, `computePruneScores()`, `ensureVault()`, `handleSave()`,
`handleGc()`, and dozens more. The test bundle is self-contained (no cross-community edges),
massive (39 test targets), and purely a verification tool — it tests the system but is never
called by it.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BRAIN STORAGE CORE                                  │
│               (graphify-test-bundle.js — Test Laboratory)                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  graphify-test-bundle.js [38 connections — test harness file]         │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                   │ │
│  │  │  STORAGE TESTS       │  │  TRACKER TESTS       │                   │ │
│  │  │                      │  │                      │                   │ │
│  │  │  ensureBrainDir()    │  │  constructor()       │                   │ │
│  │  │  ensureVault()       │  │  load() / save()     │                   │ │
│  │  │  copyObsidianTo-     │  │  recordAccess()      │                   │ │
│  │  │  Vault()             │  │  decayTemperatures() │                   │ │
│  │  │  rebuildVaultIndex() │  │  getTemperature()    │                   │ │
│  │  │  openInObsidian()    │  │  getEntry() / get-   │                   │ │
│  │  │                      │  │  Stats()             │                   │ │
│  │  └──────────────────────┘  └──────────────────────┘                   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                   │ │
│  │  │  COMMAND TESTS       │  │  PRUNE & GC TESTS    │                   │ │
│  │  │                      │  │                      │                   │ │
│  │  │  slugify()           │  │  computePruneScores()│                   │ │
│  │  │  dirSize()           │  │  findRunMeta()       │                   │ │
│  │  │  formatBytes()       │  │  handlePrune()       │                   │ │
│  │  │  handleSave()        │  │  handlePin()         │                   │ │
│  │  │  handleList()        │  │  handleUnpin()       │                   │ │
│  │  │  handleLoad()        │  │  handleGc()          │                   │ │
│  │  │  handleLoadRun()     │  │  handleKeep()        │                   │ │
│  │  │  handleRuns()        │  │  handleStats()       │                   │ │
│  │  └──────────────────────┘  └──────────────────────┘                   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                   │ │
│  │  │  WIKI TESTS          │  │  CONTEXT TESTS       │                   │ │
│  │  │                      │  │                      │                   │ │
│  │  │  handleWikiSync-     │  │  extractSections()   │                   │ │
│  │  │  Current()           │  │  rebuildBrainIndex() │                   │ │
│  │  │  handleWikiSyncAll() │  │  brainContextForCwd()│                   │ │
│  │  │  handleWikiOpen()    │  │  getNodeLabels()     │                   │ │
│  │  │  handleWikiNotes()   │  │                      │                   │ │
│  │  └──────────────────────┘  └──────────────────────┘                   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐                                              │ │
│  │  │  EXTENSION TEST      │                                              │ │
│  │  │                      │                                              │ │
│  │  │  graphify_default()  │                                              │ │
│  │  └──────────────────────┘                                              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Brain Storage Core is the **regression safety net**. When a developer changes `handleCompress()`,
the test for `handleCompress()` in this bundle catches regressions. When `runDirFor()` is refactored,
the test for `runDirFor()` validates the new behavior. Every function in the system has a
corresponding test target in this file.

**Why it's its own community:** The community detection algorithm separates test code from
production code automatically. Even though `ensureBrainDir()` exists in both the production
`graphify.ts` (C6) and the test `graphify-test-bundle.js` (C0), the two versions are in different
files and have different call patterns. The test versions don't participate in the production
data flow — they exercise the same interfaces but from the outside.

**Why no cross-community edges:** Test code calls into production code, not the other way around.
The graph edges for these test functions all flow *into* the test bundle (the file contains the
functions) and stay there. The functions they test are in other communities, but the test bundle
itself has no outgoing bridges because it doesn't produce anything the production code consumes.

### Key Nodes

- **graphify-test-bundle.js** (38 connections): The test file itself. With 38 "contains" edges
  to every test function defined within it, it's the most connected node in this community. Think
  of it as the lab building — it houses every test rig.

- **slugify()** (8 connections): The most-tested utility. `slugify()` is tested here because it's
  critical for path safety — a broken slugify breaks every command that touches the filesystem.

- **computePruneScores()** (8 connections): The second-most-tested function. Pruning is a policy
  with precise mathematical properties, so it demands thorough testing across edge cases.

- **ensureVault()** (6 connections): The vault bootstrap test. Verifies that the Obsidian vault
  directory structure is created correctly with proper permissions and default files.

- **rebuildVaultIndex()** (5 connections): Tests vault reindexing after manual changes. Important
  because the vault is user-editable outside of Pi.

- **handleWikiSyncCurrent()** (5 connections): Tests wiki generation for the current project.
  Verifies that community pages, decisions, and layer documentation are correctly produced.

- **handleStats()** (5 connections): Tests the aggregate statistics command. Validates temperature
  distribution calculations and disk usage reporting.

### Bridge Analysis

**No cross-community edges.** This community is completely self-contained. The test functions call
into production code, but the graph edges all flow from the test file to its internal functions
("contains" edges). There are no edges from test functions back to the production functions they
test because the AST extraction captures function definitions and calls — the test file defines
these test functions, and calls to production functions would need cross-file resolution that
isn't captured in the current extraction.

This isolation is actually a feature: the graph correctly separates "what the system does" from
"how we verify it works."

### Cohesion Explained

At **0.10 cohesion**, this is a loosely connected community. All 39 functions share a file
(`graphify-test-bundle.js`) and a purpose (testing), but they don't call each other. A test for
`handleGc()` doesn't call a test for `handleStats()`. They're independent rigs arranged along
the factory floor.

The low cohesion is natural for a test suite. It would be concerning if test functions were heavily
interconnected — that would suggest tests are testing each other rather than the production code.

## For LLMs

### Data

- **ID:** 0
- **Label:** Brain Storage Core
- **Size:** 39 nodes
- **Cohesion:** 0.10
- **Character:** code
- **Primary file:** graphify-test-bundle.js (test/graphify-test-bundle.js)

### Top Nodes by Connectivity

- **graphify-test-bundle.js** -- 38 connections [code]
- **slugify()** -- 8 connections [code]
- **computePruneScores()** -- 8 connections [code]
- **ensureVault()** -- 6 connections [code]
- **rebuildVaultIndex()** -- 5 connections [code]
- **handleWikiSyncCurrent()** -- 5 connections [code]
- **handleStats()** -- 5 connections [code]
- **recordAccess()** -- 4 connections [code]
- **handleWikiSyncAll()** -- 4 connections [code]
- **handleWikiOpen()** -- 4 connections [code]

**No cross-community edges — this community is self-contained.**
