---
type: community
cohesion: 0.15
members: 28
---

# Community 20

**Cohesion:** 0.15 - loosely connected
**Members:** 28 nodes

## Members
- [[AMBIGUOUS edge should score higher than an otherwise identical EXTRACTED edge.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Code↔paper edge should score higher than code↔code edge.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Concept nodes (empty source_file) must not appear in surprises.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Helper build a small nx.Graph from nodeedge specs.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Multi-file graph should find cross-file edges between real entities.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Single-file graph should return cross-community edges, not empty list.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[Tests for analyze.py.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[_make_simple_graph()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[make_graph()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_analyze.py]] - code - backups/RUN_20260505-205658/sources/graphify/tests/test_analyze.py
- [[test_analyze.py_1]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_file_category()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_god_nodes_have_required_keys()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_god_nodes_returns_list()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_god_nodes_sorted_by_degree()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_graph_diff_empty_diff()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_graph_diff_new_edges()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_graph_diff_new_nodes()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_graph_diff_removed_nodes()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_is_concept_node_empty_source()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_is_concept_node_real_file()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_ambiguous_scores_higher_than_extracted()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_cross_source_multi_file()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_cross_type_scores_higher()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_excludes_concept_nodes()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_have_required_keys()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_have_why_field()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py
- [[test_surprising_connections_single_file_uses_community_bridges()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_analyze.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_20
SORT file.name ASC
```
