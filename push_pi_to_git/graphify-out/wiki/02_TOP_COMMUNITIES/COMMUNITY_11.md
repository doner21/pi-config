---
type: community/narrative
community_id: 11
label: "graphify-test-bundle Module (39 functions)"
size: 39
cohesion: 0.10
character: code
---

# Community 11: graphify-test-bundle Module (39 functions)

> **39 nodes** | **Cohesion: 0.10** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 11 is a **duplicate artifact** — it's the exact same compiled JavaScript bundle as Community 10, split into a separate community by graphify's AST extraction algorithm. This happens when the same file (`graphify-test-bundle.js`) contains enough distinct logical sections that the community detection algorithm treats them as separate clusters. Think of it as a mirrored twin — identical in content, but occupying a different spot in the graph.

The statistics mirror Community 10 exactly: 39 functions, cohesion 0.10, hub at `graphify-test-bundle.js` with 38 connections. The same key players appear: **slugify()** and **computePruneScores()** (8 connections each), **ensureVault()** (6 connections), **rebuildVaultIndex()**, **handleWikiSyncCurrent()**, **handleStats()** (5 connections each), and **recordAccess()**, **handleWikiSyncAll()**, **handleWikiOpen()** (4 connections each).

Why does the graph split a single file into two communities? The AST extraction creates nodes for each function, class, and call site in the bundle. If the call graph within the bundle has two weakly connected subnetworks — say, the vault management functions are called together but rarely interact with the wiki sync functions — the Louvain community detection algorithm may assign them to different communities. This is a known artifact of how the algorithm handles files with multiple independent functional clusters.

From a practical standpoint, Communities 10 and 11 should be considered as one logical unit. When you see them in the graph, recognize them as the two halves of the same compiled bundle. Consider this a note to future graphify improvements: a manual merge hint or post-processing step could prevent this split in future runs.

**Why it matters:** The existence of this duplicate is itself informative — it tells you that graphify's AST-based community detection sometimes over-splits files with multiple independent subsystems. This is a valuable data point for tuning the algorithm.

## For LLMs

### Data

- **ID:** 11
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
