# Graph Report - .  (2026-05-18)

## Corpus Check
- 19 files · ~51,371 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 308 nodes · 581 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Graphify Core Utilities|Graphify Core Utilities]]
- [[_COMMUNITY_Brain Memory Management|Brain Memory Management]]
- [[_COMMUNITY_Cross-Project & Cache Systems|Cross-Project & Cache Systems]]
- [[_COMMUNITY_Archive & Structural Systems|Archive & Structural Systems]]
- [[_COMMUNITY_Extension Hooks & Context|Extension Hooks & Context]]
- [[_COMMUNITY_Wiki Narratives|Wiki Narratives]]
- [[_COMMUNITY_Python Wiki Generator|Python Wiki Generator]]
- [[_COMMUNITY_Heat Tracking & Lifecycle|Heat Tracking & Lifecycle]]
- [[_COMMUNITY_Git & Wiki Human Extensions|Git & Wiki Human Extensions]]
- [[_COMMUNITY_Wiki Sync & Obsidian Vault|Wiki Sync & Obsidian Vault]]
- [[_COMMUNITY_Extraction Pipeline|Extraction Pipeline]]
- [[_COMMUNITY_Git Checkpoint|Git Checkpoint]]
- [[_COMMUNITY_Memory Stats|Memory Stats]]
- [[_COMMUNITY_Recluster Only|Recluster Only]]
- [[_COMMUNITY_Graph Compression|Graph Compression]]
- [[_COMMUNITY_Archetype Detection|Archetype Detection]]

## God Nodes (most connected - your core abstractions)
1. `handleCompress()` - 22 edges
2. `runDirFor()` - 19 edges
3. `slugify()` - 17 edges
4. `Graphify Skill` - 16 edges
5. `loadRunMeta()` - 14 edges
6. `handleExpand()` - 13 edges
7. `HeatTracker` - 12 edges
8. `recordRunAccess()` - 12 edges
9. `handleGc()` - 12 edges
10. `writeRunMeta()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Tree Memory Proposal` --semantically_similar_to--> `Fractal Memory Proposal`  [INFERRED] [semantically similar]
  01-tree-memory-proposal.md → 02-fractal-memory-proposal.md
- `Graphify Skill` --implemented_by--> `Graphify Extension (graphify.ts)`  [INFERRED]
  skills/graphify/SKILL.md → extensions/graphify.ts
- `Memory Persistence (Step 10)` --invokes--> `Memory Wiki Human Extension`  [INFERRED]
  skills/graphify/SKILL.md → extensions/memory-wiki-human.ts
- `tool_call Enforcement Gate` --implements--> `Graphify Enforcement Gate`  [INFERRED]
  extensions/graphify.ts → skills/graphify/SKILL.md
- `tool_call Enforcement Gate` --implements--> `Exploratory Read Blocking`  [INFERRED]
  extensions/graphify.ts → skills/graphify/SKILL.md

## Communities (17 total, 5 thin omitted)

### Community 0 - "Graphify Core Utilities"
Cohesion: 0.09
Nodes (66): addDaysIso(), archiveRunDirFor(), brainContextForCwd(), cohesionScore(), collapseToSupernodes(), communitiesPathFor(), compressedGraphPathFor(), compressionTransition() (+58 more)

### Community 1 - "Brain Memory Management"
Cohesion: 0.1
Nodes (34): brainContextForCwd(), computePruneScores(), constructor(), copyObsidianToVault(), decayTemperatures(), dirSize(), ensureBrainDir(), ensureVault() (+26 more)

### Community 2 - "Cross-Project & Cache Systems"
Cohesion: 0.07
Nodes (39): ARC Cache Algorithm, Cross-Project Archetypes, brain-meta.json (Global State), Cache Eviction (LRU/SIEVE), Coherence Score for Compression, Compression State Machine (Rawâ†’Communitiesâ†’Compressedâ†’Frozen), Ebbinghaus Forgetting Curve, Formal Concept Analysis (FCA) (+31 more)

### Community 3 - "Archive & Structural Systems"
Cohesion: 0.08
Nodes (35): .archive/ Directory (Grace Period), 30-Day Archive Grace Period, archive-meta.json, AST Extraction (Structural), Backward Compatibility Guarantee, Community Detection (Louvain/Leiden), Confidence Score System, Context Injection (brainContextForCwd) (+27 more)

### Community 4 - "Extension Hooks & Context"
Cohesion: 0.06
Nodes (33): before_agent_start Hook, brainContextForCwd, Brain Context Injector, Graphify Brain Index, Graphify Extension (graphify.ts), HeatTracker, tool_call Enforcement Gate, LLM Narrative Generation (+25 more)

### Community 5 - "Wiki Narratives"
Cohesion: 0.1
Nodes (31): Architecture at a Glance, Community Narratives Index, Community Narrative: Memory Architecture - The Blueprint, Community Narrative: Design Proposals - The Drawing Board, Community Narrative: Graphify Skill - The Engine Itself, Community Narrative: Heat Tracking - The Thermometer Class, Community Narrative: Implementation Core - The Engine Room, Community Narrative: Obsidian Integration - The Showcase (+23 more)

### Community 6 - "Python Wiki Generator"
Cohesion: 0.17
Nodes (18): collections, analyze_community(), auto_label(), build_cross_edges(), cohesion_description(), load_data(), main(), parse_report() (+10 more)

### Community 7 - "Heat Tracking & Lifecycle"
Cohesion: 0.23
Nodes (5): ensureBrainDir(), freezeEligible(), handleSave(), HeatTracker, rebuildBrainIndex()

### Community 8 - "Git & Wiki Human Extensions"
Cohesion: 0.22
Nodes (4): node_child_process, node_fs, node_path, Pi Coding Agent Harness

### Community 9 - "Wiki Sync & Obsidian Vault"
Cohesion: 0.39
Nodes (8): copyObsidianToVault(), ensureVault(), handleWikiNotes(), handleWikiOpen(), handleWikiSyncAll(), handleWikiSyncCurrent(), openInObsidian(), rebuildVaultIndex()

### Community 10 - "Extraction Pipeline"
Cohesion: 0.5
Nodes (5): AST Extraction, Extraction Cache, File Detection System, Semantic Extraction, Whisper Transcription

## Knowledge Gaps
- **71 isolated node(s):** `Community Detection`, `Honest Audit Trail`, `Persistent Graph`, `Cross-Document Surprise`, `Extraction Cache` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `graphify-brain Memory System` connect `Archive & Structural Systems` to `Git & Wiki Human Extensions`, `Cross-Project & Cache Systems`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `Pi Coding Agent Harness` connect `Git & Wiki Human Extensions` to `Graphify Core Utilities`, `Archive & Structural Systems`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `Pruning System (5-Signal Score)` connect `Cross-Project & Cache Systems` to `Archive & Structural Systems`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `Community Detection`, `Honest Audit Trail`, `Persistent Graph` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Graphify Core Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Brain Memory Management` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Cross-Project & Cache Systems` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._