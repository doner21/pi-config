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

**Node** -- A single concept (file, function, idea) with a label, type, and source location.
**Edge** -- A relationship between two nodes, tagged with confidence.
**Community** -- A group of nodes more connected to each other than the rest of the graph.
**God Node** -- The most connected node(s) in the graph.
**Cohesion** -- A score (0-1) measuring how tightly connected a community is.

## Key Concepts in This Project

| Concept | Connections |
|---------|-----------|
| GET() | 10 |
| revalidate() | 9 |
| PATCH() | 9 |
| isSupabaseConfigured() | 9 |
| createSupabaseServerClient() | 9 |
| ISR On-Demand Revalidation Pattern | 9 |
| POST() | 8 |
| HomePage() | 7 |
| Supabase Three-Tier Client Architecture | 7 |
| Seed Data Fallback in Every API Route | 7 |