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
| bookingDbConfigured() | 23 |
| createSupabaseAdminClient() | 20 |
| requireAdminUser() | 20 |
| calculateAvailability() | 12 |
| isSupabaseConfigured() | 11 |
| getAvailabilityData() | 11 |
| main() | 10 |
| GET() | 10 |
| createSupabaseServerClient() | 10 |
| revalidate() | 9 |