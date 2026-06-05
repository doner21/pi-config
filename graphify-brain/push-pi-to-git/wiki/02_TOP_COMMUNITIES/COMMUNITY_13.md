---
type: community/narrative
community_id: 13
label: "test_extract Module (34 functions)"
size: 34
cohesion: 0.10
character: code
---

# Community 13: test_extract Module (34 functions)

> **34 nodes** | **Cohesion: 0.10** (loosely connected — these functions share a file but do different things) | **Character: code**

## For Humans

Community 13 is the **core extraction test suite** — the quality gate that ensures graphify's AST extraction pipeline produces correct, consistent, and complete results. Living in `test_extract.py`, this community of 34 functions is the most comprehensive test of the extraction engine's correctness. Think of it as the final exam for every new feature in the extractor.

The hub is `test_extract.py` (22 connections). Each test is a specific assertion about extraction behavior. `test_structural_edges_are_extracted()` verifies that structural relationships (a class contains a method, a file contains a class) are captured — the backbone of the graph. `test_no_dangling_edges_on_extract()` checks the graph invariants: every edge must connect two existing nodes, with no dangling references to entities that weren't extracted.

`test_make_id_consistent()` tests one of the trickiest invariants: every node must have a stable, deterministic ID. If you run graphify twice on the same code, the same function should get the same ID both times. This is critical for incremental analysis and caching. `test_method_calls_module_function()` verifies cross-scope call detection: when a method inside a class calls a standalone module function, graphify should create a call edge with the correct source and target.

`test_cross_file_calls_skip_ambiguous_duplicate_labels()` tackles a subtle problem: if two files define a function with the same name, graphify must handle the ambiguity gracefully rather than creating incorrect cross-file edges. `test_run_analysis_calls_compute_score()` tests the integration between extraction and the analysis pipeline, ensuring that every extracted graph is immediately scored.

With cohesion 0.10, these tests are moderately connected — they share testing infrastructure and helper functions, but each test is independent. No cross-community connections, which is exactly what you want for a foundational test suite: it must run reliably regardless of changes elsewhere in the codebase.

**Why it matters:** This community is the safety net. If these tests pass, the extracted graph is structurally sound — edges connect existing nodes, IDs are deterministic, and cross-file references are correctly resolved.

## For LLMs

### Data

- **ID:** 13
- **Label:** test_extract Module (34 functions)
- **Size:** 34 nodes
- **Cohesion:** 0.10
- **Character:** code
- **Primary file:** test_extract.py

### Top Nodes by Connectivity

- **test_extract.py** — 22 connections [code]
- **test_extract.py** — 22 connections [code]
- **test_structural_edges_are_extracted()** — 3 connections [code]
- **test_run_analysis_calls_compute_score()** — 3 connections [code]
- **test_no_dangling_edges_on_extract()** — 3 connections [code]
- **test_method_calls_module_function()** — 3 connections [code]
- **test_make_id_consistent()** — 3 connections [code]
- **test_extract_python_no_dangling_edges()** — 3 connections [code]
- **test_cross_file_calls_skip_ambiguous_duplicate_labels()** — 3 connections [code]
- **test_calls_edges_emitted()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
