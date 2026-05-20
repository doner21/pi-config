---
type: community/narrative
community_id: 6
label: "Previous Session Artifacts"
size: 12
cohesion: 0.24
character: concept
---

# Community 6: Previous Session Artifacts

> **12 nodes** | **Cohesion: 0.24** (moderate) | **Character: concept**

## For Humans

### What It's Like

This community is **the project's filing cabinet of past work**. It contains notes, documentation, and knowledge artifacts from a previous session that built the Graphify memory system for this project. These are historical records — they explain how the knowledge graph was created and how the project's memory architecture works, but they're not part of the running application.

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Previous Session Artifacts                      │
│                 (The Filing Cabinet)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  The Three-Layer Memory Stack:                                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Layer 1: SKILL.md (The Blueprint)                          │ │
│  │  → Defines HOW to build knowledge graphs                    │ │
│  │  → The /graphify skill instructions                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Layer 2: Graphify Pipeline (The Factory)                   │ │
│  │  → 56-file run on src/                                      │ │
│  │  → detect → extract → build → cluster → analyze            │ │
│  │  → Produces graph.json + GRAPH_REPORT.md + graph.html       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Layer 3: graph.json (The Product)                          │ │
│  │  → Compiled knowledge store                                 │ │
│  │  → 219 nodes, 248 edges, 55 communities                     │ │
│  │  → Queried by Claude for codebase questions                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Supporting concepts:                                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Karpathy /raw Folder Workflow                               │ │
│  │  → Drop anything into a folder → get a knowledge graph      │ │
│  │  → The philosophy behind graphify's design                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CLAUDE.md as Session Bridge                                 │ │
│  │  → AGENTS.md file instructs Claude to check the graph       │ │
│  │  → Closes the loop: graph → agent → new knowledge → graph   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Obsidian Vault (Human Navigation Layer)                     │ │
│  │  → Human-only wiki generated from graph.json                │ │
│  │  → Claude queries graph.json directly, not the vault       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Key principle: Compile Knowledge Once at Ingestion                │
│  → Don't re-derive relationships on every query                  │
│  → 71x token savings vs reading raw files                        │
└──────────────────────────────────────────────────────────────────┘
```

### What It Does

This community documents the **Graphify memory system** built for Ramen Don. It explains the three-layer architecture: SKILL.md (how to build graphs), the Graphify Pipeline (the build process), and graph.json (the compiled knowledge store). Key design principles include "compile once at ingestion" (71x token savings) and CLAUDE.md as a session bridge (auto-loading graph context).

### Key Nodes

| Node | Role | Connections |
|------|------|-------------|
| graph.json (Compiled Knowledge Store) | The final product — 219-node knowledge graph | 5 |
| Session: Building the Graphify Memory System | The parent session that created this infrastructure | 5 |
| Graphify Pipeline (56-file run) | The extraction/clustering/reporting pipeline | 4 |
| Three-Layer Memory Stack | The architecture: SKILL.md → pipeline → graph.json | 3 |
| Obsidian Vault | Human wiki generated from graph data | 3 |
| Compile Once at Ingestion | Principle: pre-compute, don't re-derive | 3 |
| CLAUDE.md as Session Bridge | AGENTS.md instructs agent to read graph first | 3 |
| Graphify Package | The pip-installed graphifyy Python package | 2 |
| Karpathy /raw Folder Workflow | The conceptual ancestor of graphify's design | 2 |

### Bridge Analysis

**Self-contained** — these are documentation artifacts, not connected to the running application's nodes. They describe the system that produced the knowledge graph itself.

### Cohesion Explained

**0.24** — Moderate. All nodes are from the same session document. They form a coherent narrative about the memory system, but as documentation nodes they're loosely coupled — each concept stands alone even though they tell one story.

## For LLMs

### Data

- **ID:** 6
- **Label:** Previous Session Artifacts
- **Size:** 12 nodes
- **Cohesion:** 0.24
- **Character:** concept
- **Primary file:** src/raw/sessions/2026-04-22-graphify-memory-system.md

### Cross-Community Connections
**No cross-community edges — this community is self-contained.**

### Relevance to Current Build

These nodes are from a prior graphify run on the full project (534 files). The current graph (this wiki) was built on `src/` only (56 files, deep mode). Some session nodes may reference the older, larger graph structure. Treat community sizes and god node counts from these session artifacts as potentially outdated.
