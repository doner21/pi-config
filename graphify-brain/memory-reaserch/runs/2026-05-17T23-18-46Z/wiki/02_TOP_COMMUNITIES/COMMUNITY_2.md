---
type: community/narrative
community_id: 2
label: "Wiki Documentation"
size: 31
cohesion: 0.10
character: concept
---

# Community 2: Wiki Documentation

> **31 nodes** | **Cohesion: 0.10** (loosely connected) | **Character: concept**

## For Humans

### The User Manual Shelf

Every complex system comes with a binder — or, in today's world, a folder full of markdown files.
The Wiki Documentation community is exactly that: the pages you're reading, plus the index pages,
layer documentation, decision logs, and LLM instructions that together explain how the graphify-brain
works and how to use it.

This is a meta-community: it documents the system that the other communities *are*. The pages here
were generated from the knowledge graph itself — the system describing the system. Every page has
two audiences: "For Humans" (narrative explanations with analogies) and "For LLMs" (structured data
for context injection).

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WIKI DOCUMENTATION                                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    NAVIGATION HUBS                                     │ │
│  │                                                                       │ │
│  │  Wiki Index ──▶ Top-level table of contents                           │ │
│  │  Elevator Pitch (Wiki Overview) ──▶ "What is this?" in 30 seconds     │ │
│  │  Architecture at a Glance ──▶ System overview with diagrams           │ │
│  │  Plain-Language Glossary ──▶ Jargon-free definitions                  │ │
│  │  Dual-Audience Architecture Wiki System ──▶ Meta: how the wiki works  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    SYSTEM LAYERS (02_SYSTEM_LAYERS/)                   │ │
│  │                                                                       │ │
│  │  System Layers Index ──▶ Overview of the 5-layer architecture         │ │
│  │  Layer 1: Storage ──▶ Run directory, metadata, file formats           │ │
│  │  Layer 2: Scoring ──▶ 5-signal prune evaluation                       │ │
│  │  Layer 3: Temperature ──▶ Hot/Warm/Cold state machine                 │ │
│  │  Layer 4: Compression ──▶ Fractal supernode compression               │ │
│  │  Layer 5: Archetypes ──▶ Cross-project pattern detection              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              COMMUNITY NARRATIVES (03_COMMUNITY_NARRATIVES/)           │ │
│  │                                                                       │ │
│  │  Community Narratives Index ──▶ Directory of all narratives           │ │
│  │  Memory Architecture - The Blueprint ──▶ C3 narrative                 │ │
│  │  Pruning and Temperature - The Librarian ──▶ C1 narrative             │ │
│  │  Heat Tracking - The Thermometer Class ──▶ C6 narrative               │ │
│  │  Design Proposals - The Drawing Board ──▶ C7 narrative                │ │
│  │  Graphify Skill - The Engine Itself ──▶ C3 narrative (skill)          │ │
│  │  Obsidian Integration - The Showcase ──▶ C4 narrative                 │ │
│  │  Implementation Core - The Engine Room ──▶ C5 narrative               │ │
│  │  Testing and Utilities - The Quality Desk ──▶ C0 narrative            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    DECISION LOG (04_DECISIONS/)                        │ │
│  │                                                                       │ │
│  │  Decision Log Index ──▶ Directory of architecture decisions           │ │
│  │  Decision: Tree + Graph Hybrid ──▶ Why we use both                    │ │
│  │  Decision: 30-Day Archive Grace Period ──▶ Why 30 days                │ │
│  │  Decision: 5 Signals for Pruning ──▶ Why these five                   │ │
│  │  Decision: Temperature Over LRU ──▶ Why state machine vs. clock       │ │
│  │  Decision: Obsidian as Viewer ──▶ Why Obsidian                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                LLM INSTRUCTIONS (05_LLM_INSTRUCTIONS/)                 │ │
│  │                                                                       │ │
│  │  LLM Instructions Index ──▶ Directory of LLM guidance                 │ │
│  │  Prompt Templates ──▶ Standard prompts for Pi agents                  │ │
│  │  Instruction: Setting Up a Feature ──▶ Feature setup workflow         │ │
│  │  Instruction: Architecture Review ──▶ Review workflow                 │ │
│  │  Instruction: Adding a Feature ──▶ Feature add workflow               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What It Does and Why It Matters

The Wiki Documentation serves three purposes:

**1. Human Onboarding:** The overview pages, glossary, and architecture diagrams help new users
understand what the system does, how it's structured, and how to use it. The community narratives
provide concrete analogies (engine room, thermometer, pattern hunter) that make abstract
subsystems tangible.

**2. LLM Context:** The "For LLMs" sections in every page provide structured data that Pi can
inject into context windows. When Pi needs to understand the pruning subsystem, it loads the
Pruning Theory page's LLM section — node lists, edge counts, cross-community bridges — as a
compact reference.

**3. Decision Record:** The decision log captures *why* the system is built the way it is. Each
decision page documents the options considered, the rationale for the choice, and the consequences.
This prevents future developers from undoing a decision without understanding the original context.

### Key Nodes

- **Community Narratives Index** (9 connections): The directory of all community narratives.
  Most-connected because every narrative page links back to it.

- **Wiki Index** (8 connections): The top-level table of contents. Every page in the wiki links
  back through the index.

- **System Layers Index** (6 connections): The directory of the 5 system layers. Each layer page
  links back here.

- **Layer 3: Temperature (Wiki)** (6 connections): The most-referenced layer page, likely because
  the HeatTracker bridges to the most communities.

- **Decision Log Index** (6 connections): Points to all five architecture decisions. The decisions
  are tightly linked because they were made as a coherent set.

### Bridge Analysis

**No cross-community edges.** Like the Brain Storage Core (C0), the Wiki Documentation is
self-contained. The wiki pages reference the system's concepts, but these references are wikilinks
within the wiki itself — not graph edges to the source documents.

This isolation is expected: documentation isn't part of the production data flow. It's the output
of the system, not an input to it. The graph correctly places it in its own community.

### Cohesion Explained

At **0.10 cohesion**, this is a loosely connected documentation community. The 31 pages share a
common purpose but don't form a tight hierarchy. Pages link to each other through wikilinks
(especially to index pages), but most pages only link to their parent index — not sideways to
related pages.

The wiki structure (indices → category pages → content pages) produces a natural tree shape,
which yields relatively few internal edges. A wiki with 31 pages arranged in a tree has at most
~30 edges (one per page to its parent), which is exactly what we see here.

## For LLMs

### Data

- **ID:** 2
- **Label:** Wiki Documentation
- **Size:** 31 nodes
- **Cohesion:** 0.10
- **Character:** concept
- **Primary files:** graphify-out/wiki/ (all wiki pages)

### Top Nodes by Connectivity

- **Community Narratives Index** -- 9 connections [document]
- **Wiki Index** -- 8 connections [document]
- **System Layers Index** -- 6 connections [document]
- **Layer 3: Temperature (Wiki)** -- 6 connections [document]
- **Decision Log Index** -- 6 connections [document]
- **Layer 4: Compression (Wiki)** -- 5 connections [document]
- **Layer 2: Scoring (Wiki)** -- 5 connections [document]
- **Layer 1: Storage (Wiki)** -- 5 connections [document]
- **Layer 5: Archetypes (Wiki)** -- 4 connections [document]
- **Architecture at a Glance** -- 4 connections [document]

**No cross-community edges — this community is self-contained.**
