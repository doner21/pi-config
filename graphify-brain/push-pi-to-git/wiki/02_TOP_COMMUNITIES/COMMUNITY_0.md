---
type: community/narrative
community_id: 0
label: "graphify.ts Core Implementation"
size: 64
cohesion: 0.11
character: code
---

# Community 0: graphify.ts Core Implementation

> **64 nodes** | **Cohesion: 0.11** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Think of this community as the **brain stem** of your Pi agent — the cluster of cells that keeps the whole cognitive system alive, regulates memory flow, and decides what gets remembered, pruned, or archived. Everything here lives inside `graphify.ts`, the core TypeScript extension that powers the Global Graphify Brain memory system.

This is where the magic of persistent memory happens. `graphify.ts` (the central hub, with 51 connections) orchestrates a set of specialized functions that manage your agent's long-term memory vault. **HeatTracker** monitors how "hot" or frequently accessed each piece of memory is — think of it as a temperature gauge for your thoughts. **computePruneScores()** figures out which memories are cold enough to be archived or removed, like a librarian deciding which books to move to deep storage. **handleSave()**, **handleGc()** (garbage collection), and **handleKeep()** form the lifecycle trio: save new memories, clean up the stale ones, and protect the precious ones.

The supporting cast is equally vital. **slugify()** converts human-readable names into clean URL-safe identifiers — the filing clerk of the operation. **runDirFor()** and **resolveProjectRunFromArgs()** figure out where a project's graph data lives on disk, acting as the memory's GPS. **loadRunMeta()** reads the metadata that describes each graph run — when it was created, what project it belongs to, what parameters were used.

This community is entirely self-contained with no cross-community connections, like a sealed server room. That's by design: memory management must be reliable, predictable, and not tangled up with the rest of the system. With a cohesion of 0.11 (loosely connected), these 64 nodes share a file but do fundamentally different jobs — like a single hospital building that houses cardiology, radiology, and the cafeteria under one roof. They're co-located, not tightly coupled.

**Why it matters:** Without this community, Pi would have no durable memory. Every session would start from scratch, every insight would evaporate. This is the module that makes your agent learn and grow over time.

## For LLMs

### Data

- **ID:** 0
- **Label:** graphify.ts Core Implementation
- **Size:** 64 nodes
- **Cohesion:** 0.11
- **Character:** code
- **Primary file:** graphify.ts

### Top Nodes by Connectivity

- **graphify.ts** — 51 connections [code]
- **graphify.ts** — 51 connections [code]
- **slugify()** — 14 connections [code]
- **handleGc()** — 13 connections [code]
- **HeatTracker** — 13 connections [code]
- **runDirFor()** — 12 connections [code]
- **resolveProjectRunFromArgs()** — 11 connections [code]
- **loadRunMeta()** — 11 connections [code]
- **handleKeep()** — 11 connections [code]
- **computePruneScores()** — 11 connections [code]

**No cross-community edges found — this community is self-contained.**
