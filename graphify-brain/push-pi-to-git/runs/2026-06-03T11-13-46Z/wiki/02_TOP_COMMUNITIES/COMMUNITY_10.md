---
type: community/narrative
community_id: 10
label: "graphify-test-bundle Module (39 functions)"
size: 39
cohesion: 0.10
character: code
---

# Community 10: graphify-test-bundle Module (39 functions)

> **39 nodes** | **Cohesion: 0.10** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 10 is the **compiled JavaScript twin** of Community 0's TypeScript core — a bundled, browser-ready version of the Graphify Brain extension. Living in `graphify-test-bundle.js`, this community represents the same memory-management logic (slugify, computePruneScores, vault management) packaged for environments that can't run TypeScript directly. Think of it as a translated edition of a novel — same story, different language.

The hub is `graphify-test-bundle.js` (38 connections), which wraps and exports the bundled functions. **slugify()** (8 connections) and **computePruneScores()** (8 connections) are the most connected functions, mirroring their TypeScript originals. These are the core algorithms that convert names to URL-safe slugs and calculate which memories to archive.

The vault management layer is represented by **ensureVault()** (6 connections) — which creates the local vault directory if it doesn't exist — and **rebuildVaultIndex()** (5 connections), which regenerates the index file from scratch. **recordAccess()** (4 connections) logs when a piece of memory was last accessed, feeding data into the prune scoring system.

The wiki management functions — **handleWikiSyncCurrent()** (5 connections), **handleWikiSyncAll()** (4 connections), **handleWikiOpen()** (4 connections), and **handleStats()** (5 connections) — provide the interface for syncing graph data to a wiki, opening wiki pages, and reporting statistics. These are the JS equivalents of the TypeScript extension's command handlers.

With cohesion 0.10, this community is loosely connected — the bundled functions do different things (pruning, vault management, wiki syncing, stats) but are published together as a single deliverable. No cross-community connections, which makes sense for a compiled bundle that's meant to be a standalone artifact.

**Why it matters:** This bundle makes the Graphify Brain memory system available in contexts where TypeScript isn't available — testing environments, simpler JavaScript runners, or as a dependency in other JS projects. It's the portable, compiled version of your agent's memory.

## For LLMs

### Data

- **ID:** 10
- **Label:** graphify-test-bundle Module (39 functions)
- **Size:** 39 nodes
- **Cohesion:** 0.10
- **Character:** code
- **Primary file:** graphify-test-bundle.js

### Top Nodes by Connectivity

- **graphify-test-bundle.js** — 38 connections [code]
- **slugify()** — 8 connections [code]
- **computePruneScores()** — 8 connections [code]
- **ensureVault()** — 6 connections [code]
- **rebuildVaultIndex()** — 5 connections [code]
- **handleWikiSyncCurrent()** — 5 connections [code]
- **handleStats()** — 5 connections [code]
- **recordAccess()** — 4 connections [code]
- **handleWikiSyncAll()** — 4 connections [code]
- **handleWikiOpen()** — 4 connections [code]

**No cross-community edges found — this community is self-contained.**
