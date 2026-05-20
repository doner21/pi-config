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
| Whisper | God node (1 connections) |
| Intake | God node (1 connections) |
| Analysis | God node (1 connections) |
| **Date**: | God node (1 connections) |
| 2026-05-11 | God node (1 connections) |