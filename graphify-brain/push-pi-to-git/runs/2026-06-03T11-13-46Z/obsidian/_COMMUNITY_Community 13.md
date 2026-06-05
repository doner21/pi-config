---
type: community
cohesion: 0.10
members: 34
---

# Community 13

**Cohesion:** 0.10 - loosely connected
**Members:** 34 nodes

## Members
- [[AST-resolved call edges are deterministic and should be EXTRACTED1.0.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[After merging multiple files, no internal edges should be dangling.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[All edge sources must reference a known node (targets may be external imports).]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[Analyzer.process() calls run_analysis() - cross class→function calls edge.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[Call-graph pass must produce INFERRED calls edges.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[Same caller→callee pair must appear only once even if called multiple times.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[Same input always produces same output.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[Unqualified cross-file calls must not guess between duplicate helper names.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[contains  method  inherits  imports edges must always be EXTRACTED.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[run_analysis() calls compute_score() - must appear as a calls edge.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_calls_deduplication()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_calls_edges_are_extracted()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_calls_edges_emitted()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_calls_no_self_loops()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_collect_files_follows_symlinked_directory()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_collect_files_from_dir()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_collect_files_handles_circular_symlinks()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_collect_files_skips_hidden()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_cross_file_calls_skip_ambiguous_duplicate_labels()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_extract.py]] - code - backups/RUN_20260505-205658/sources/graphify/tests/test_extract.py
- [[test_extract.py_1]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_extract_merges_multiple_files()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_extract_python_finds_class()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_extract_python_finds_methods()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_extract_python_no_dangling_edges()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_make_id_consistent()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_make_id_no_leading_trailing_underscores()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_make_id_strips_dots_and_underscores()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_method_calls_module_function()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_no_dangling_edges_on_extract()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_python_call_edges_have_call_context()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_run_analysis_calls_compute_score()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_run_analysis_calls_normalize()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py
- [[test_structural_edges_are_extracted()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_extract.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_13
SORT file.name ASC
```
