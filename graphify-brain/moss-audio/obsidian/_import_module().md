---
source_file: "tests/test_ctc_stars_refine.py"
type: "code"
community: "Alignment Pipeline"
location: "L60"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# _import_module()

## Connections
- [[.test_all_ctc_indices_covered()]] - `calls` [EXTRACTED]
- [[.test_all_words_covered()]] - `calls` [EXTRACTED]
- [[.test_assemble_output_preserves_stanza_structure()]] - `calls` [EXTRACTED]
- [[.test_below_40pct_ctc_falls_back()]] - `calls` [EXTRACTED]
- [[.test_both_single_frame_uses_ctc()]] - `calls` [EXTRACTED]
- [[.test_bridge_single_window()]] - `calls` [EXTRACTED]
- [[.test_burst_fails_quality_gate()]] - `calls` [EXTRACTED]
- [[.test_chorus_41_words_2_windows_split_at_minds()]] - `calls` [EXTRACTED]
- [[.test_edge_fail_stars_detected()]] - `calls` [EXTRACTED]
- [[.test_edge_word_above_stricter_threshold_keeps()]] - `calls` [EXTRACTED]
- [[.test_edge_word_stricter_threshold()]] - `calls` [EXTRACTED]
- [[.test_failed_window_uses_ctc_for_all()]] - `calls` [EXTRACTED]
- [[.test_first_word_included()]] - `calls` [EXTRACTED]
- [[.test_full_pipeline_no_real_stars()]] - `calls` [EXTRACTED]
- [[.test_full_pipeline_no_real_stars_stanza()]] - `calls` [EXTRACTED]
- [[.test_gap_splits_window()]] - `calls` [EXTRACTED]
- [[.test_good_stars_passes()]] - `calls` [EXTRACTED]
- [[.test_intro_single_window()]] - `calls` [EXTRACTED]
- [[.test_lalala_not_in_windows()]] - `calls` [EXTRACTED]
- [[.test_lalala_not_removed_from_mid_song()]] - `calls` [EXTRACTED]
- [[.test_lalala_removed_from_ctc()]] - `calls` [EXTRACTED]
- [[.test_lalala_removed_from_lyrics()]] - `calls` [EXTRACTED]
- [[.test_last_word_included()]] - `calls` [EXTRACTED]
- [[.test_missing_words_fails()]] - `calls` [EXTRACTED]
- [[.test_monotonicity_invariant()]] - `calls` [EXTRACTED]
- [[.test_multi_window_40_words()]] - `calls` [EXTRACTED]
- [[.test_no_cross_stanza_windows()]] - `calls` [EXTRACTED]
- [[.test_no_dropped_or_duplicated_words()]] - `calls` [EXTRACTED]
- [[.test_non_monotonic_detection()]] - `calls` [EXTRACTED]
- [[.test_normal_word_keeps_stars()]] - `calls` [EXTRACTED]
- [[.test_original_ctc_not_mutated()]] - `calls` [EXTRACTED]
- [[.test_overlap_center_confidence_prefers_center()]] - `calls` [EXTRACTED]
- [[.test_padding_applied_correctly()]] - `calls` [EXTRACTED]
- [[.test_single_frame_falls_back_to_ctc()]] - `calls` [EXTRACTED]
- [[.test_single_window_24_words()]] - `calls` [EXTRACTED]
- [[.test_single_window_trivial_pass_through()]] - `calls` [EXTRACTED]
- [[.test_sixteen_windows_for_starman()]] - `calls` [EXTRACTED]
- [[.test_skip_tiny_window()]] - `calls` [EXTRACTED]
- [[.test_timestamp_bounds()]] - `calls` [EXTRACTED]
- [[.test_verse_57_words_3_windows()]] - `calls` [EXTRACTED]
- [[.test_window_respects_max_secs()]] - `calls` [EXTRACTED]
- [[.test_window_respects_max_words()]] - `calls` [EXTRACTED]
- [[.test_word_count_invariant()]] - `calls` [EXTRACTED]
- [[.test_word_count_preserved()]] - `calls` [EXTRACTED]
- [[.test_zero_dur_word_flagged()]] - `calls` [EXTRACTED]
- [[.test_zero_duration_falls_back()]] - `calls` [EXTRACTED]
- [[Import ctc_stars_refine stubbing heavy deps if needed.]] - `rationale_for` [EXTRACTED]
- [[RuntimeError]] - `calls` [INFERRED]
- [[test_ctc_stars_refine.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Alignment_Pipeline