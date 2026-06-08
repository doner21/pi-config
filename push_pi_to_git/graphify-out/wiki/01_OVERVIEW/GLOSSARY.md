---
type: reference/glossary
---

# Glossary

## Graph Terms

| Term | Meaning | Analogy |
|------|---------|---------|
| **Node** | A single concept — a file, function, class, idea, or design concept | One station on the subway map |
| **Edge** | A relationship between two nodes — "calls", "imports", "inherits", "uses", "references" | A subway line connecting two stations |
| **Community** | A cluster of nodes that are more connected to each other than to the rest of the graph | A neighborhood in the city |
| **God Node** | The most connected node(s) in the entire graph | Grand Central Station |
| **Cohesion** | A score (0-1) measuring how tightly connected a community is. Higher = more integrated | How walkable the neighborhood is |
| **Bridge Node** | A node that connects two otherwise separate communities | An international airport connecting two countries |

## Edge Confidence Levels

| Type | Score | Meaning |
|------|-------|---------|
| EXTRACTED | 1.0 | Found directly in source code (import, class inheritance, function call) |
| INFERRED | 0.6-0.9 | Reasonable inference by the AI (shared purpose, structural similarity) |
| AMBIGUOUS | 0.1-0.3 | Uncertain — flagged for human review |

## Key Concepts in This Project

| Concept | Community | Role |
|---------|-----------|------|
| `graphify.ts` | C0 | Global Graphify Brain memory system extension (51 connections) |
| `HeatTracker` | C0 | Memory temperature gauge — tracks hot/warm/cold access patterns |
| `computePruneScores()` | C0 | Decides which memories to archive or delete |
| `handleSave()` / `handleGc()` / `handleKeep()` | C0 | Memory lifecycle management |
| `subagent.ts` (related functions) | (in C53) | Subagent delegation with isolated Pi processes |
| `MCP status` (related functions) | (in C42) | MCP server connection monitoring |
| `thinking.ts` (related functions) | (in C94) | Reasoning depth control (`/think`) |
| `verbosity.ts` | (separate) | Response verbosity control (`/verbosity`) |
| `Client` | C18 | Synchronous HTTP client (28 connections) |
| `AsyncClient` | C18 | Asynchronous HTTP client (27 connections) |
| `extract()` | C49 | AST extraction entry point |
| `detect()` | C5 | File detection and classification |
| `main()` | C4 | CLI entry point |
