---
type: community/narrative
community_id: 8
label: "graphify.ts Core Implementation"
size: 8
cohesion: 0.39
character: code
---

# Community 8: graphify.ts Core Implementation

> **8 nodes** | **Cohesion: 0.39** (coherent and well-connected) | **Character: code**

## For Humans

This community contains **8 functions** primarily in **graphify.ts**.

The most connected node is **ensureVault()** with 6 connections — it is the hub of this community.

## For LLMs

### Data

- **ID:** 8
- **Label:** graphify.ts Core Implementation
- **Size:** 8 nodes
- **Cohesion:** 0.39
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **ensureVault()** — 6 connections [code]
- **rebuildVaultIndex()** — 5 connections [code]
- **handleWikiSyncCurrent()** — 5 connections [code]
- **handleWikiSyncAll()** — 4 connections [code]
- **handleWikiOpen()** — 4 connections [code]
- **copyObsidianToVault()** — 3 connections [code]
- **openInObsidian()** — 2 connections [code]
- **handleWikiNotes()** — 2 connections [code]

### Cross-Community Connections

- **graphify.ts Core Implementation** (C0) — 1 edge(s)
  - handleWikiSyncCurrent() → slugify() (calls)
