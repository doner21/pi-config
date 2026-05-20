---
type: community/narrative
community_id: 7
label: "Research Proposals"
size: 12
cohesion: 0.20
character: concept
---

# Community 7: Research Proposals

> **12 nodes** | **Cohesion: 0.20** (moderately connected) | **Character: concept**

## For Humans

### The Drawing Board

Before any system gets built, someone has to sit down and figure out *how* to build it. The
Research Proposals community is the collection of design documents, theoretical frameworks,
and architectural experiments that shaped the graphify-brain. It's a stack of blueprints on
the drawing board — some fully realized in code, others still speculative.

The proposals span a remarkable range: from practical memory management (Tree Memory, Fractal
Memory) to exotic theoretical approaches (Formal Concept Analysis, Hyperdimensional Computing,
Sparse Distributed Memory). The core insight connecting them all: **memory isn't about storing
data — it's about structuring data so retrieval is natural.**

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESEARCH PROPOSALS                                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    CORE PROPOSALS (implemented)                        │ │
│  │                                                                       │ │
│  │  ┌─────────────────────┐     ┌─────────────────────┐                  │ │
│  │  │ Tree Memory Proposal│     │Fractal Memory Prop. │                  │ │
│  │  │ (01-tree-memory)    │────▶│ (02-fractal-memory) │                  │ │
│  │  │                     │     │                     │                  │ │
│  │  │ ─ Pruning System    │     │ ─ FractalNode Schema│                  │ │
│  │  │ ─ 5-Signal Score    │     │ ─ Fractal Compression│                 │ │
│  │  │ ─ Pinning Mechanism │     │ ─ Coherence Score   │                  │ │
│  │  │ ─ Zettelkasten ref. │     │ ─ Compression State │                  │ │
│  │  └─────────┬───────────┘     └──────────┬──────────┘                  │ │
│  │            │                            │                             │ │
│  │            └──────────┬─────────────────┘                             │ │
│  │                       ▼                                               │ │
│  │         ┌─────────────────────────┐                                   │ │
│  │         │ Unified Memory Mgmt     │                                   │ │
│  │         │ Plan (03-unified-plan)  │                                   │ │
│  │         │                         │                                   │ │
│  │         │ ─ Run-Level Storage     │                                   │ │
│  │         │ ─ 6-Phase Roadmap       │                                   │ │
│  │         │ ─ Verification Gates    │                                   │ │
│  │         └─────────────────────────┘                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    THEORETICAL FRAMEWORKS (exploratory)                │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                   │ │
│  │  │ Graph Summarization  │  │ Formal Concept       │                   │ │
│  │  │ (Supernode)          │  │ Analysis (FCA)       │                   │ │
│  │  │                      │  │                      │                   │ │
│  │  │ Collapse communities │  │ Lattice-based        │                   │ │
│  │  │ into single nodes    │  │ concept grouping     │                   │ │
│  │  └──────────────────────┘  └──────────────────────┘                   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                   │ │
│  │  │ Sparse Distributed   │  │ Hyperdimensional     │                   │ │
│  │  │ Memory (SDM)         │  │ Computing (HDC/VSA)  │                   │ │
│  │  │                      │  │                      │                   │ │
│  │  │ Kanerva's addressing │  │ 10,000-dim vectors   │                   │ │
│  │  │ scheme for memory    │  │ for memory encoding  │                   │ │
│  │  └──────────────────────┘  └──────────────────────┘                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Research Proposals are the **intellectual foundation** of the entire system:

**Tree Memory Proposal (01-tree-memory-proposal.md):** The original design document. Proposes
a tree-structured memory where each run is a node in a project tree. Introduces the core concepts:
5-Signal Prune Score (staleness, redundancy, obsoletion, low signal), pinning mechanism, and the
Zettelkasten-inspired idea that memory should be interlinked, not just stored.

**Fractal Memory Proposal (02-fractal-memory-proposal.md):** The evolution beyond trees.
Recognizes that tree structure alone can't capture cross-project patterns. Introduces fractal
compression — the idea that memory should be compressible at every scale, from individual nodes
to entire communities. Defines the FractalNode schema (level, parent, summary), coherence scores
for community quality, and the compression state machine (Raw → Communities → Compressed → Frozen).

**Unified Memory Management Plan (03-unified-plan.md):** The synthesis. Merges tree and fractal
ideas into a concrete implementation roadmap. Proposes Run-Level Storage (each session is a
timestamped directory), the 6-Phase Roadmap, and the verification gates that ensure quality.

**Theoretical frameworks:** The remaining nodes explore alternative/complementary approaches:
- **Graph Summarization (Supernode)** — directly implemented in C8's `collapseToSupernodes()`
- **Formal Concept Analysis (FCA)** — lattice-based concept grouping, philosophical cousin to community detection
- **Sparse Distributed Memory (SDM)** — Kanerva's memory model using high-dimensional addressing
- **Hyperdimensional Computing (HDC/VSA)** — using 10,000-dimensional vectors for robust memory encoding

### Key Nodes

- **Fractal Memory Proposal** (7 connections): The most-connected design doc. Links to Fractal Compression, FractalNode Schema, SDM, HDC, and Graph Summarization. The theoretical center of gravity.

- **Fractal Compression** (5 connections): The practical implementation concept that emerged from the Fractal Memory proposal. Now fully realized in C8.

- **Tree Memory Proposal** (3 connections): The original vision. Introduced pruning, pinning, and Zettelkasten concepts that are now core to the system.

- **Unified Memory Management Plan** (3 connections): The bridge between theory and practice. References both tree and fractal proposals while proposing concrete storage formats and roadmaps.

- **FractalNode Schema (Level/Parent/Summary)** (2 connections): The data model that powers compressed graphs. Each FractalNode has a level (depth in the compression hierarchy), a parent reference, and a summary.

- **Compression State Machine (Raw→Communities→Compressed→Frozen)** (1 connection): Defines the lifecycle states that runs transition through. Implemented in C8's compression pipeline.

### Bridge Analysis

The Research Proposals bridge to two concept communities:

- **Pruning Theory & Signals (C1)** — 2 edges. The Tree Memory Proposal introduces pruning concepts that are expanded in C1. The Unified Plan references C1's invariants and verification gates.

- **Graphify-Brain Architecture (C3)** — 1 edge. The proposals feed directly into the architectural description of the graphify-brain system and its knowledge graph data structure.

These are the only bridges — the Research Proposals are intentionally self-contained. They're the
"why" documentation; the code communities (C5-C12) are the "how."

### Cohesion Explained

At **0.20 cohesion**, the Research Proposals are loosely connected as a group, which makes sense.
These are separate documents written at different times exploring different ideas. The connections
that exist (13 edges among 12 nodes) reflect genuine intellectual dependencies: Fractal Memory
builds on Tree Memory, the Unified Plan synthesizes both, and the theoretical frameworks connect
to their practical implementations.

A higher cohesion here would be suspicious — we don't want these proposals to be overly
interconnected, since some represent competing or alternative approaches.

## For LLMs

### Data

- **ID:** 7
- **Label:** Research Proposals
- **Size:** 12 nodes
- **Cohesion:** 0.20
- **Character:** concept
- **Primary files:** 01-tree-memory-proposal.md, 02-fractal-memory-proposal.md, 03-unified-plan.md

### Top Nodes by Connectivity

- **Fractal Memory Proposal** -- 7 connections [document]
- **Fractal Compression** -- 5 connections [rationale]
- **Tree Memory Proposal** -- 3 connections [document]
- **Unified Memory Management Plan** -- 3 connections [document]
- **FractalNode Schema (Level/Parent/Summary)** -- 2 connections [rationale]
- **Compression State Machine (Raw→Communities→Compressed→Frozen)** -- 1 connection [rationale]
- **Coherence Score for Compression** -- 1 connection [rationale]
- **Graph Summarization (Supernode)** -- 1 connection [rationale]
- **Formal Concept Analysis (FCA)** -- 1 connection [rationale]
- **Sparse Distributed Memory (SDM)** -- 1 connection [rationale]
- **Hyperdimensional Computing (HDC/VSA)** -- 1 connection [rationale]
- **Zettelkasten Knowledge Management** -- 1 connection [rationale]

### Cross-Community Connections

- **Pruning Theory & Signals** (C1) -- 2 edge(s)
  - Tree Memory Proposal -> Pruning System (5-Signal Score) (introduces)
  - Unified Plan -> Non-Negotiable Invariants (references)
- **Graphify-Brain Architecture** (C3) -- 1 edge(s)
  - Fractal Memory Proposal -> graphify-brain Memory System (informs)
