---
type: community/narrative
community_id: 0
label: "graphify.ts Core Implementation"
size: 43
cohesion: 0.14
character: code
---

# Community 0: graphify.ts Core Implementation

> **43 nodes** | **Cohesion: 0.14** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

This community contains **43 functions** primarily in **graphify.ts**.

The most connected node is **graphify.ts** with 52 connections — it is the hub of this community.

## For LLMs

### Data

- **ID:** 0
- **Label:** graphify.ts Core Implementation
- **Size:** 43 nodes
- **Cohesion:** 0.14
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **graphify.ts** — 52 connections [code]
- **slugify()** — 13 connections [code]
- **handleGc()** — 12 connections [code]
- **runDirFor()** — 11 connections [code]
- **resolveProjectRunFromArgs()** — 10 connections [code]
- **loadRunMeta()** — 10 connections [code]
- **handleKeep()** — 10 connections [code]
- **computePruneScores()** — 10 connections [code]
- **writeRunMeta()** — 9 connections [code]
- **handleUnpin()** — 9 connections [code]

### Cross-Community Connections

- **graphify.ts Core Implementation** (C8) — 8 edge(s)
  - graphify.ts → ensureVault() (contains)
  - graphify.ts → copyObsidianToVault() (contains)
- **graphify.ts Core Implementation** (C5) — 7 edge(s)
  - graphify.ts → HeatTracker (contains)
  - handleSave() → .seedHot() (calls)
- **Domain: Run-Level Storage (Phase 1)** (C4) — 1 edge(s)
  - graphify.ts → Pi Coding Agent Harness (imports_from)
