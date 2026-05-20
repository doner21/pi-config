---
type: community/narrative
community_id: 3
label: "Graphify-Brain Architecture"
size: 27
cohesion: 0.11
character: concept
---

# Community 3: Graphify-Brain Architecture

> **27 nodes** | **Cohesion: 0.11** (loosely connected) | **Character: concept**

## For Humans

### The Blueprint

Every building starts with a blueprint — a schematic that shows how the rooms connect, where the
plumbing runs, and why the west wall needs extra reinforcement. The Graphify-Brain Architecture
community is the blueprint for the entire memory system. It documents the `/graphify` skill, the
knowledge graph data structure, the extraction pipeline, and all the concepts that turn raw code
into an explorable graph.

This community is where the "meta" lives: it describes *how the system describes itself*. The
`graphify-brain Memory System` node (10 connections) bridges to four other communities. The
`/graphify Skill` node documents the engine that produced the graph you're reading now.

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     GRAPHIFY-BRAIN ARCHITECTURE                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   SYSTEM CONCEPTS (README.md)                          │ │
│  │                                                                       │ │
│  │  graphify-brain Memory System ──▶ The global brain                    │ │
│  │  Pi Coding Agent Harness ──▶ The host environment                     │ │
│  │  Obsidian Vault Integration ──▶ External viewer concept               │ │
│  │  git-checkpoint.ts ──▶ Git integration extension                      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   GRAPHIFY SKILL (skills/graphify/SKILL.md)           │ │
│  │                                                                       │ │
│  │  /graphify Skill ──▶ The skill that generates knowledge graphs        │ │
│  │       │                                                               │ │
│  │       ├──▶ Knowledge Graph Data Structure ──▶ Nodes + Edges model     │ │
│  │       ├──▶ Community Detection (Louvain/Leiden) ──▶ Graph partitioning│ │
│  │       ├──▶ God Nodes (Centrality) ──▶ Most-connected nodes            │ │
│  │       ├──▶ Surprising Connections ──▶ Unexpected relationships        │ │
│  │       ├──▶ EXTRACTED/INFERRED/AMBIGUOUS Edge Types                    │ │
│  │       ├──▶ Confidence Score System ──▶ Edge reliability               │ │
│  │       ├──▶ graphify-out/ Output Directory                             │ │
│  │       ├──▶ AST Extraction (Structural) ──▶ Code parsing               │ │
│  │       ├──▶ Semantic Extraction (LLM-based) ──▶ LLM analysis           │ │
│  │       └──▶ graphifyy Python Package ──▶ Python graph library          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   OUTPUT ARTIFACTS                                     │ │
│  │                                                                       │ │
│  │  GRAPH_REPORT.md ──▶ Human-readable summary of the graph              │ │
│  │  graph.json (Node-Link Data) ──▶ Machine-readable graph               │ │
│  │  graph.html (Interactive Viz) ──▶ Browser-based exploration           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   USER COMMANDS (TUTORIAL.md)                          │ │
│  │                                                                       │ │
│  │  /memory save Command ──▶ Save current session as a run               │ │
│  │  /memory load Command ──▶ Load saved memory into context              │ │
│  │  /memory list Command ──▶ List saved projects                         │ │
│  │  /memory runs Command ──▶ List runs for a project                     │ │
│  │  /memory-wiki Commands ──▶ Generate wiki from graph                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   DESIGN DOCS (03-unified-plan.md)                     │ │
│  │                                                                       │ │
│  │  Run-Level Storage (Phase 1) ──▶ Each session = timestamped directory │ │
│  │  Context Injection (brainContextForCwd) ──▶ Memory injection into LLM │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Graphify-Brain Architecture documents the system from three angles:

**1. The Skill Itself (`/graphify`):** This is the engine that reads your codebase and produces
a knowledge graph. It uses AST extraction for structural relationships (imports, calls, contains)
and semantic extraction for LLM-inferred connections (references, implements, semantically similar).
The output includes GRAPH_REPORT.md (readable summary), graph.json (machine data), and graph.html
(interactive visualization).

**2. The Graph Data Model:** Nodes represent files, functions, classes, and concepts. Edges
represent relationships with confidence scores (EXTRACTED = certain, INFERRED = probable,
AMBIGUOUS = possible). Community detection partitions the graph into the 16 communities you see
here. God nodes (by degree centrality) identify the most-connected abstractions.

**3. The User-Facing Commands:** `/memory save` creates a run (timestamped session snapshot).
`/memory load` restores it. `/memory list` and `/memory runs` browse saved memory. `/memory-wiki`
generates the wiki pages from community data. These commands bridge the gap between internal
graph structure and user interaction.

### Key Nodes

- **graphify-brain Memory System** (10 connections): The central concept. Bridges to Pruning
  Theory (C1), the Archive System (C12), the Obsidian vault, and user commands. This is the
  node that "ties the room together."

- **/graphify Skill** (9 connections): The skill specification. Documents the extraction
  pipeline, community detection algorithm, god node calculation, and output formats.

- **Run-Level Storage (Phase 1)** (7 connections): The storage model. Documents that each
  Pi session is stored as a timestamped run directory. Implements the `/memory save`, `/memory
  load`, `/memory runs` commands.

- **Knowledge Graph Data Structure** (5 connections): The data model documentation. Nodes are
  typed (code, concept, document, rationale), edges are weighted and attributed, and confidence
  scores distinguish extracted from inferred relationships.

- **graphify-out/ Output Directory** (5 connections): Where everything lives. Documents the
  output structure: GRAPH_REPORT.md at the root, graph.json for data, graph.html for visualization,
  and wiki/ for the generated documentation.

### Bridge Analysis

The architecture bridges to four communities:

- **Obsidian Vault Integration (C4)** — 2 edges. `graphify.ts` imports from the Pi Coding Agent
  Harness. The `node_child_process` import links to C3.

- **Pruning Theory & Signals (C1)** — 5 edges. The `Run-Level Storage` concept references the
  `6-Phase Roadmap` from C1. The `graphify-brain Memory System` bridges to the `5-Signal Score`
  pruning system. `Backward Compatibility Guarantee` connects C3 to C1 via surprising connection.

- **Research Proposals (C7)** — 1 edge. The architecture documentation references the design
  proposals that informed the system's shape.

- **Archive System (C12)** — 1 edge. `/memory gc Command` connects the architecture overview
  to the archive policy documentation.

### Cohesion Explained

At **0.11 cohesion**, this is a loosely connected concept community. It aggregates documentation
from three different sources (README.md, skills/graphify/SKILL.md, TUTORIAL.md) that share a
theme (system architecture) but not a tight narrative. The README describes the system, the skill
document describes the graph engine, and the tutorial describes user commands — three distinct
concerns grouped by topic.

This is normal for "architecture" communities. They're meant to provide broad coverage of a
system's design, not a tight functional pipeline like the code communities.

## For LLMs

### Data

- **ID:** 3
- **Label:** Graphify-Brain Architecture
- **Size:** 27 nodes
- **Cohesion:** 0.11
- **Character:** concept
- **Primary files:** README.md, skills/graphify/SKILL.md, TUTORIAL.md, 03-unified-plan.md

### Top Nodes by Connectivity

- **graphify-brain Memory System** -- 10 connections [rationale]
- **/graphify Skill** -- 9 connections [document]
- **Run-Level Storage (Phase 1)** -- 7 connections [rationale]
- **Knowledge Graph Data Structure** -- 5 connections [rationale]
- **graphify-out/ Output Directory** -- 5 connections [rationale]
- **Pi Coding Agent Harness** -- 4 connections [rationale]
- **Obsidian Vault Integration** -- 4 connections [rationale]
- **GRAPH_REPORT.md** -- 4 connections [document]
- **/memory save Command** -- 4 connections [document]
- **/memory load Command** -- 4 connections [document]

### Cross-Community Connections

- **Obsidian Vault Integration** (C4) -- 2 edge(s)
  - git-checkpoint.ts -> pi_coding_agent (imports_from)
  - graphify.ts -> node_child_process (imports_from)
- **Pruning Theory & Signals** (C1) -- 5 edge(s)
  - Run-Level Storage -> 6-Phase Roadmap (references)
  - graphify-brain Memory System -> Pruning System (references)
  - Backward Compatibility Guarantee -> Non-Negotiable Invariants (references)
- **Research Proposals** (C7) -- 1 edge(s)
  - graphify-brain Memory System -> Fractal Memory Proposal (informs)
- **Archive System** (C12) -- 1 edge(s)
  - graphify-brain Memory System -> /memory gc Command (references)
