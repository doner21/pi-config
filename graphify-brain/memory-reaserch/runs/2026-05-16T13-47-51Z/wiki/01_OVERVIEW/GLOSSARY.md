---
type: reference/glossary
---

# Glossary

## Edge Types

| Type | Certainty | Meaning |
|------|-----------|---------|
| EXTRACTED | 1.0 | Found directly in source code or documents |
| INFERRED | 0.6-0.9 | Reasonable guess by the AI |
| AMBIGUOUS | 0.1-0.3 | Needs human verification |

**Node** — A single concept (file, function, idea) with a label, type, and source location.

**Edge** — A relationship between two nodes, tagged with confidence.

**Community** — A group of nodes that are more connected to each other than to the rest of the graph. Found by the Louvain/Leiden algorithm.

**God Node** — The most connected node(s) in the graph.

**Cohesion** — A score (0-1) measuring how tightly connected a community is.

## Key Concepts in This Project

| Concept | Role |
| slugify() | God node (13 connections) |
| HeatTracker | God node (12 connections) |
| handleGc() | God node (12 connections) |
| runDirFor() | God node (11 connections) |
| loadRunMeta() | God node (10 connections) |
| computePruneScores() | God node (10 connections) |
| resolveProjectRunFromArgs() | God node (10 connections) |
| handleKeep() | God node (10 connections) |
| Pruning System (5-Signal Score) | God node (10 connections) |
| graphify-brain Memory System | God node (10 connections) |