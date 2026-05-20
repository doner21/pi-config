---
type: community
cohesion: 0.17
members: 12
---

# Per-window quality gate and per-word fal

**Cohesion:** 0.17 - loosely connected
**Members:** 12 nodes

## Members
- [[.test_burst_fails_quality_gate()]] - code - tests/test_ctc_stars_refine.py
- [[.test_edge_fail_stars_detected()]] - code - tests/test_ctc_stars_refine.py
- [[.test_good_stars_passes()]] - code - tests/test_ctc_stars_refine.py
- [[.test_missing_words_fails()]] - code - tests/test_ctc_stars_refine.py
- [[.test_zero_dur_word_flagged()]] - code - tests/test_ctc_stars_refine.py
- [[All words with good durations → PASS.]] - rationale - tests/test_ctc_stars_refine.py
- [[Edge words single-frame → identified for CTC fallback.]] - rationale - tests/test_ctc_stars_refine.py
- [[Internal burst of single-frame words → window passes but bursts flagged for CTC.]] - rationale - tests/test_ctc_stars_refine.py
- [[Per-window quality gate and per-word fallback logic.]] - rationale - tests/test_ctc_stars_refine.py
- [[TestQualityGate]] - code - tests/test_ctc_stars_refine.py
- [[Word count mismatch → FAIL.]] - rationale - tests/test_ctc_stars_refine.py
- [[Word with 0.000s duration → flagged for CTC fallback.]] - rationale - tests/test_ctc_stars_refine.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Per-window_quality_gate_and_per-word_fal
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 1 edge to [[_COMMUNITY_Alignment Pipeline]]

## Top bridge nodes
- [[.test_burst_fails_quality_gate()]] - degree 5, connects to 3 communities
- [[.test_edge_fail_stars_detected()]] - degree 5, connects to 3 communities
- [[.test_good_stars_passes()]] - degree 5, connects to 3 communities
- [[.test_missing_words_fails()]] - degree 5, connects to 3 communities
- [[.test_zero_dur_word_flagged()]] - degree 5, connects to 3 communities