# Graph Report - .  (2026-05-11)

## Corpus Check
- Corpus is ~913 words - fits in a single context window. You may not need a graph.

## Summary
- 7 nodes · 9 edges · 2 communities
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.87)
- Token cost: 1,200 input · 800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]

## God Nodes (most connected - your core abstractions)
1. `Intake: Rebuild Local Google Gemma Model Configuration for Pi Harness` - 6 edges
2. `Google Gemma Model` - 4 edges
3. `Turbo Quant / KV-cache compression` - 2 edges
4. `Research Agent` - 2 edges
5. `Executor Agent` - 2 edges
6. `Llama Installation` - 1 edges
7. `Pi Coding Harness` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Turbo Quant / KV-cache compression` --conceptually_related_to--> `Google Gemma Model`  [INFERRED]
  intake.md → intake.md  _Bridges community 1 → community 0_

## Communities (2 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.5
Nodes (4): Intake: Rebuild Local Google Gemma Model Configuration for Pi Harness, Llama Installation, Pi Coding Harness, Turbo Quant / KV-cache compression

### Community 1 - "Community 1"
Cohesion: 0.67
Nodes (3): Executor Agent, Google Gemma Model, Research Agent

## Knowledge Gaps
- **2 isolated node(s):** `Llama Installation`, `Pi Coding Harness`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Intake: Rebuild Local Google Gemma Model Configuration for Pi Harness` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.700) - this node is a cross-community bridge._
- **Why does `Google Gemma Model` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Google Gemma Model` (e.g. with `Research Agent` and `Executor Agent`) actually correct?**
  _`Google Gemma Model` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Llama Installation`, `Pi Coding Harness` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._