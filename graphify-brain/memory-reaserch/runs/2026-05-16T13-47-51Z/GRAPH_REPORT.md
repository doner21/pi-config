# Graph Report - .  (2026-05-16)

## Corpus Check
- Corpus is ~47,923 words - fits in a single context window. You may not need a graph.

## Summary
- 245 nodes · 508 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Brain Storage Core|Brain Storage Core]]
- [[_COMMUNITY_Pruning Theory & Signals|Pruning Theory & Signals]]
- [[_COMMUNITY_Wiki Documentation|Wiki Documentation]]
- [[_COMMUNITY_Graphify-Brain Architecture|Graphify-Brain Architecture]]
- [[_COMMUNITY_Obsidian Vault Integration|Obsidian Vault Integration]]
- [[_COMMUNITY_Run Management Engine|Run Management Engine]]
- [[_COMMUNITY_HeatTracker Core|HeatTracker Core]]
- [[_COMMUNITY_Research Proposals|Research Proposals]]
- [[_COMMUNITY_Fractal Compression Engine|Fractal Compression Engine]]
- [[_COMMUNITY_GC & Context Selectors|GC & Context Selectors]]
- [[_COMMUNITY_Core Command Handlers|Core Command Handlers]]
- [[_COMMUNITY_Archetype Detection Engine|Archetype Detection Engine]]
- [[_COMMUNITY_Archive System|Archive System]]
- [[_COMMUNITY_git-checkpoint.ts Extension|git-checkpoint.ts Extension]]
- [[_COMMUNITY_memory stats Command|/memory stats Command]]

## God Nodes (most connected - your core abstractions)
1. `handleCompress()` - 22 edges
2. `runDirFor()` - 19 edges
3. `slugify()` - 17 edges
4. `loadRunMeta()` - 14 edges
5. `handleExpand()` - 13 edges
6. `HeatTracker` - 12 edges
7. `recordRunAccess()` - 12 edges
8. `handleGc()` - 12 edges
9. `writeRunMeta()` - 11 edges
10. `handleZoom()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Tree Memory Proposal` --semantically_similar_to--> `Fractal Memory Proposal`  [INFERRED] [semantically similar]
  01-tree-memory-proposal.md → 02-fractal-memory-proposal.md
- `Run-Level Storage (Phase 1)` --references--> `Backward Compatibility Guarantee`  [EXTRACTED]
  03-unified-plan.md → memory-system-improvement-handoff.md
- `30-Day Archive Grace Period` --references--> `Non-Negotiable Invariants`  [EXTRACTED]
  03-unified-plan.md → memory-system-improvement-handoff.md
- `graphify-brain Memory System` --references--> `/memory gc Command`  [EXTRACTED]
  README.md → TUTORIAL.md
- `Pruning System (5-Signal Score)` --implements--> `/memory prune Command`  [EXTRACTED]
  01-tree-memory-proposal.md → TUTORIAL.md

## Communities (16 total, 2 thin omitted)

### Community 0 - "Brain Storage Core"
Cohesion: 0.1
Nodes (34): brainContextForCwd(), computePruneScores(), constructor(), copyObsidianToVault(), decayTemperatures(), dirSize(), ensureBrainDir(), ensureVault() (+26 more)

### Community 1 - "Pruning Theory & Signals"
Cohesion: 0.08
Nodes (33): ARC Cache Algorithm, Cross-Project Archetypes, Backward Compatibility Guarantee, brain-meta.json (Global State), Cache Eviction (LRU/SIEVE), Ebbinghaus Forgetting Curve, Centrality (Graph Theory), HeatTracker (Temperature System) (+25 more)

### Community 2 - "Wiki Documentation"
Cohesion: 0.1
Nodes (31): Architecture at a Glance, Community Narratives Index, Community Narrative: Memory Architecture - The Blueprint, Community Narrative: Design Proposals - The Drawing Board, Community Narrative: Graphify Skill - The Engine Itself, Community Narrative: Heat Tracking - The Thermometer Class, Community Narrative: Implementation Core - The Engine Room, Community Narrative: Obsidian Integration - The Showcase (+23 more)

### Community 3 - "Graphify-Brain Architecture"
Cohesion: 0.11
Nodes (25): AST Extraction (Structural), Community Detection (Louvain/Leiden), Confidence Score System, Context Injection (brainContextForCwd), EXTRACTED/INFERRED/AMBIGUOUS Edge Types, God Nodes (Centrality), graph.html (Interactive Viz), graph.json (Node-Link Data) (+17 more)

### Community 4 - "Obsidian Vault Integration"
Cohesion: 0.15
Nodes (21): brainContextForCwd(), copyObsidianToVault(), countRunArtifacts(), detectCommunities(), detectCommunitiesPython(), detectCommunitiesTS(), ensureVault(), extractSections() (+13 more)

### Community 5 - "Run Management Engine"
Cohesion: 0.3
Nodes (21): computePruneScores(), expandManifestPathFor(), findRunMeta(), findRunMetas(), getFlagValue(), handleExpand(), handleFuse(), handleKeep() (+13 more)

### Community 6 - "HeatTracker Core"
Cohesion: 0.21
Nodes (6): compressionTransition(), ensureBrainDir(), freezeEligible(), handleSave(), HeatTracker, rebuildBrainIndex()

### Community 7 - "Research Proposals"
Cohesion: 0.2
Nodes (12): Coherence Score for Compression, Compression State Machine (Rawâ†’Communitiesâ†’Compressedâ†’Frozen), Formal Concept Analysis (FCA), Fractal Compression, Fractal Memory Proposal, FractalNode Schema (Level/Parent/Summary), Graph Summarization (Supernode), Hyperdimensional Computing (HDC/VSA) (+4 more)

### Community 8 - "Fractal Compression Engine"
Cohesion: 0.29
Nodes (10): cohesionScore(), collapseToSupernodes(), communitiesPathFor(), compressedGraphPathFor(), generateSummaries(), handleCompress(), nodeIdsFromCommunity(), sha256File() (+2 more)

### Community 9 - "GC & Context Selectors"
Cohesion: 0.22
Nodes (9): addDaysIso(), archiveRunDirFor(), findArchivedRun(), gcCandidateReason(), getProjectSlugsForCommand(), handleGc(), hasFlag(), projectDirForSlug() (+1 more)

### Community 10 - "Core Command Handlers"
Cohesion: 0.29
Nodes (7): dirSize(), formatBytes(), handleLoad(), handleLoadRun(), handleRuns(), handleStats(), slugify()

### Community 11 - "Archetype Detection Engine"
Cohesion: 0.29
Nodes (7): detectArchetypes(), getNodeLabels(), getNodeLabelsArray(), handleArchetypes(), lshBandMatch(), minHashSignature(), shingleText()

### Community 12 - "Archive System"
Cohesion: 0.33
Nodes (6): .archive/ Directory (Grace Period), 30-Day Archive Grace Period, archive-meta.json, Garbage Collection (Archive/Restore), /memory gc Command, /memory keep Command

## Knowledge Gaps
- **34 isolated node(s):** `git-checkpoint.ts Extension`, `Zettelkasten Knowledge Management`, `Ebbinghaus Forgetting Curve`, `Formal Concept Analysis (FCA)`, `Subgraph Isomorphism (VF2)` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `graphify-brain Memory System` connect `Graphify-Brain Architecture` to `Pruning Theory & Signals`, `Archive System`?**
  _High betweenness centrality (0.269) - this node is a cross-community bridge._
- **Why does `Pi Coding Agent Harness` connect `Graphify-Brain Architecture` to `Obsidian Vault Integration`?**
  _High betweenness centrality (0.245) - this node is a cross-community bridge._
- **Why does `Pruning System (5-Signal Score)` connect `Pruning Theory & Signals` to `Graphify-Brain Architecture`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **What connects `git-checkpoint.ts Extension`, `Zettelkasten Knowledge Management`, `Ebbinghaus Forgetting Curve` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Brain Storage Core` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Pruning Theory & Signals` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Wiki Documentation` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._