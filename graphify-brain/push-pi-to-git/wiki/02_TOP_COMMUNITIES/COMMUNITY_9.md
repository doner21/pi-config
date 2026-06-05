---
type: community/narrative
community_id: 9
label: "test_multilang Module (40 functions)"
size: 40
cohesion: 0.12
character: code
---

# Community 9: test_multilang Module (40 functions)

> **40 nodes** | **Cohesion: 0.12** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 9 is the **cross-language extraction test lab** — the dedicated test suite for graphify's multi-language extraction capabilities. If the parent Community 1 tests one language at a time, this module tests the extraction engine across multiple languages simultaneously, verifying that edges, labels, and call graphs work consistently whether the code is in TypeScript, Java, or Python. It lives in `test_multilang.py`.

The file hub `test_multilang.py` (38 connections) is almost a perfect star graph — nearly every function in the community is directly connected to it. The key helper functions are the real power: **_labels()** (11 connections) tests that node labels are extracted correctly — for example, ensuring a TypeScript class declaration produces a node with label "Class" and name "MyClass". **_edges_with_relation()** (8 connections) verifies that extracted edges carry correct relationship information — imports, calls, inherits, contains. **_call_pairs()** (5 connections) tests the call-graph extraction specifically.

Individual tests drill into specific languages and constructs. `test_ts_finds_class()`, `test_ts_finds_function()`, and `test_ts_finds_methods()` (3 connections each) verify that TypeScript constructs are properly parsed. `test_ts_emits_calls()` checks that function call edges are generated. `test_ts_import_edges_have_import_context()` ensures that import statements produce edges with context like "what module is being imported from."

At cohesion 0.12, this is one of the tighter code-only communities — the functions share both a file and a common purpose (testing extraction), which creates more internal references than a typical test file. It's like a research team that's not only in the same lab but actively sharing equipment and cross-checking each other's results.

This community is self-contained with no cross-community connections. The multi-language tests are designed to be hermetic — they define their own test fixtures and don't depend on the main extraction module being installed in any particular way.

## For LLMs

### Data

- **ID:** 9
- **Label:** test_multilang Module (40 functions)
- **Size:** 40 nodes
- **Cohesion:** 0.12
- **Character:** code
- **Primary file:** test_multilang.py

### Top Nodes by Connectivity

- **test_multilang.py** — 38 connections [code]
- **test_multilang.py** — 38 connections [code]
- **_labels()** — 11 connections [code]
- **_edges_with_relation()** — 8 connections [code]
- **_call_pairs()** — 5 connections [code]
- **test_ts_import_edges_have_import_context()** — 3 connections [code]
- **test_ts_finds_methods()** — 3 connections [code]
- **test_ts_finds_function()** — 3 connections [code]
- **test_ts_finds_class()** — 3 connections [code]
- **test_ts_emits_calls()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
