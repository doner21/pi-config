---
type: community
cohesion: 0.17
members: 12
---

# Validation of invariants I1-I7.

**Cohesion:** 0.17 - loosely connected
**Members:** 12 nodes

## Members
- [[.test_monotonicity_invariant()]] - code - tests/test_ctc_stars_refine.py
- [[.test_no_dropped_or_duplicated_words()]] - code - tests/test_ctc_stars_refine.py
- [[.test_non_monotonic_detection()]] - code - tests/test_ctc_stars_refine.py
- [[.test_timestamp_bounds()]] - code - tests/test_ctc_stars_refine.py
- [[.test_word_count_invariant()]] - code - tests/test_ctc_stars_refine.py
- [[I1 Word count unchanged after refinement.]] - rationale - tests/test_ctc_stars_refine.py
- [[I2 Word order remains monotonic.]] - rationale - tests/test_ctc_stars_refine.py
- [[I3 No words silently dropped or duplicated.]] - rationale - tests/test_ctc_stars_refine.py
- [[I4 All timestamps in valid range.]] - rationale - tests/test_ctc_stars_refine.py
- [[Non-monotonic output detected.]] - rationale - tests/test_ctc_stars_refine.py
- [[TestInvariants]] - code - tests/test_ctc_stars_refine.py
- [[Validation of invariants I1-I7.]] - rationale - tests/test_ctc_stars_refine.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Validation_of_invariants_I1-I7
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 5 edges to [[_COMMUNITY_Alignment Pipeline]]
- 1 edge to [[_COMMUNITY_Alignment Pipeline]]

## Top bridge nodes
- [[.test_monotonicity_invariant()]] - degree 5, connects to 3 communities
- [[.test_no_dropped_or_duplicated_words()]] - degree 5, connects to 3 communities
- [[.test_non_monotonic_detection()]] - degree 5, connects to 3 communities
- [[.test_timestamp_bounds()]] - degree 5, connects to 3 communities
- [[.test_word_count_invariant()]] - degree 5, connects to 3 communities