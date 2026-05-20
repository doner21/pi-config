---
type: community/narrative
community_id: 15
label: "/memory stats Command"
size: 1
cohesion: 0.00
character: concept
---

# Community 15: /memory stats Command

> **1 node** | **Cohesion: 0.00** (single node, no internal edges) | **Character: concept**

## For Humans

### The Standalone Report

On the wall of an operations center, there's often a single dashboard display — disconnected
from the main control systems, running its own data feed, showing a live view of system health.
The `/memory stats` command is that display. It's a documentation node that describes a specific
user command, but its edge patterns didn't connect strongly enough to be placed in any of the
larger communities.

The command is documented in `TUTORIAL.md` and produces a summary of total runs, disk usage,
temperature distribution, and GC statistics. It's one of the most useful diagnostic commands —
but as a concept, it sits slightly apart from the architectural overview (C3) and the pruning
theory (C1) that document related commands.

### What It Does and Why It Matters

`/memory stats` gives you a **one-glance system health report**:
- Total runs across all projects
- Total disk usage (with `dirSize()` and `formatBytes()` from C10)
- Temperature distribution (hot/warm/cold counts from C6's HeatTracker)
- GC statistics (archived, pending deletion, permanently deleted)
- Compression ratios (if compression has been applied)

The implementation lives in `handleStats()` in Community 10 (Core Command Handlers). This
community captures the *concept* of the command — its documentation, not its implementation.

### Why It's Isolated

Single-node communities like this are thin remainder communities — nodes that the Louvain/Leiden
algorithm couldn't confidently place due to weak or unique edge patterns. The `/memory stats`
node references the graphify-brain system (C3) but has fewer total edges than nodes in larger
communities, so it gets its own partition.

### Key Node

- **/memory stats Command** (0 internal connections): User command that displays aggregate memory statistics including total runs, disk usage, temperature distribution, and GC status. Implemented by `handleStats()` in C10.

## For LLMs

### Data

- **ID:** 15
- **Label:** /memory stats Command
- **Size:** 1 node
- **Cohesion:** 0.00
- **Character:** concept
- **Primary file:** TUTORIAL.md

### Top Nodes by Connectivity

- **/memory stats Command** -- 0 connections [concept]

**No cross-community edges — this community is self-contained.**
