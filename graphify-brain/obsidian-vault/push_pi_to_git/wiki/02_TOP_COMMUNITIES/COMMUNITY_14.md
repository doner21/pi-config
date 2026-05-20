---
type: community/narrative
community_id: 14
label: "test_languages Module (34 functions)"
size: 34
cohesion: 0.06
character: code
---

# Community 14: test_languages Module (34 functions)

> **34 nodes** | **Cohesion: 0.06** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 14 is a **Swift and Julia extraction test hub** — the module that verifies graphify can correctly parse Apple's Swift and Julia's scientific computing syntax. It's part of the broader `test_languages.py` family (connected to Community 1), but was split into its own community because its focus is distinct: Swift-specific constructs like structs, enums, protocols, subscripts, and deinitializers. Think of it as the Swift language laboratory within graphify's testing ecosystem.

The most striking feature of this community is that **_labels()** (35 connections) is the central node — not the file itself. This is unusual and tells us something important: `_labels()` is a shared helper function used by virtually every test in this file. It likely takes extracted data and returns the set of node labels, which each test then asserts against. With 35 connections, it's more connected than the file itself — a sign that this community is organized around a shared utility rather than just file co-location.

The test functions follow a consistent pattern. `test_swift_finds_struct()` verifies that Swift struct declarations are extracted. `test_swift_finds_enum()` and `test_swift_finds_enum_cases()` check enum and enum case detection. `test_swift_finds_protocol()` tests protocol extraction (Swift's version of interfaces). `test_swift_finds_subscript()` checks for subscript operator extraction — a uniquely Swift feature. `test_swift_finds_deinit()` tests deinitializer detection. `test_swift_finds_methods()` and `test_swift_finds_function()` cover the basics of function and method extraction.

At cohesion 0.06, this community is very loosely connected — each test function independently calls `_labels()` and asserts, but they don't call each other. It's like a row of workstations on a factory floor: they all draw from the same parts bin (`_labels()`), but each workstation produces a different product.

No cross-community connections despite being part of the broader test_languages ecosystem. The split between Community 1 and Community 14 happened because the AST extraction detected weak internal connections between the Swift/Julia tests and the rest of the language tests — an algorithmic artifact worth noting for future graph refinement.

## For LLMs

### Data

- **ID:** 14
- **Label:** test_languages Module (34 functions)
- **Size:** 34 nodes
- **Cohesion:** 0.06
- **Character:** code
- **Primary file:** test_languages.py

### Top Nodes by Connectivity

- **_labels()** — 35 connections [code]
- **test_swift_finds_subscript()** — 3 connections [code]
- **test_swift_finds_struct()** — 3 connections [code]
- **test_swift_finds_protocol()** — 3 connections [code]
- **test_swift_finds_methods()** — 3 connections [code]
- **test_swift_finds_function()** — 3 connections [code]
- **test_swift_finds_enum_methods()** — 3 connections [code]
- **test_swift_finds_enum_cases()** — 3 connections [code]
- **test_swift_finds_enum()** — 3 connections [code]
- **test_swift_finds_deinit()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
