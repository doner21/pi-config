---
type: community
cohesion: 0.08
members: 41
---

# AST Functions (41 functions)

**Cohesion:** 0.08 - loosely connected
**Members:** 41 nodes

## Members
- [[Align a single stanza's audio segment to its lyrics.      Returns         list]] - rationale - alignment_engine/align_full.py
- [[Align the full Starman vocal stem in one pass.      Strategy Segment by estimat]] - rationale - alignment_engine/align_full.py
- [[Build a prototype-based reference 1 frame per word from the corresponding     u]] - rationale - alignment_engine/mert_dtw_align.py
- [[Build an iteratively refined reference from previous alignment boundaries.]] - rationale - alignment_engine/mert_dtw_align.py
- [[Compute pairwise cosine distance matrix between two frame sequences.      Args]] - rationale - alignment_engine/mert_dtw_align.py
- [[Convert DTW path to word-level startend times.      With prototype-based refere]] - rationale - alignment_engine/mert_dtw_align.py
- [[DTW alignment using pre-computed cosine distance matrix.      This is more discr]] - rationale - alignment_engine/mert_dtw_align.py
- [[Estimate approximate time boundaries for each stanza.      Uses proportional all]] - rationale - alignment_engine/align_full.py
- [[Extract frame-level MERT embeddings from audio.      Returns         np.ndarray]] - rationale - alignment_engine/mert_dtw_align.py
- [[Full MERT+DTW alignment pipeline.      Args         audio_path path to 16kHz m]] - rationale - alignment_engine/mert_dtw_align.py
- [[Load MERT model and feature extractor from HuggingFace.]] - rationale - alignment_engine/mert_dtw_align.py
- [[Load lyrics from a text file, return flat list of word tokens.]] - rationale - alignment_engine/mert_dtw_align.py
- [[LyricToken_1]] - code - alignment_engine/align_full.py
- [[Parse lyrics into stanzas and tokens.]] - rationale - alignment_engine/align_full.py
- [[Post-process word boundaries to ensure quality     - Minimum word duration floo]] - rationale - alignment_engine/mert_dtw_align.py
- [[align()]] - code - alignment_engine/mert_dtw_align.py
- [[align_full.py]] - code - alignment_engine/align_full.py
- [[align_full_song()]] - code - alignment_engine/align_full.py
- [[align_stanza()]] - code - alignment_engine/align_full.py
- [[analyze_quality()]] - code - alignment_engine/align_full.py
- [[basic_stats()_2]] - code - alignment_engine/align_full.py
- [[build_prototype_reference()]] - code - alignment_engine/mert_dtw_align.py
- [[build_refined_reference()]] - code - alignment_engine/mert_dtw_align.py
- [[build_timing_json()_2]] - code - alignment_engine/align_full.py
- [[cosine_distance_matrix()]] - code - alignment_engine/mert_dtw_align.py
- [[count_syllables()_3]] - code - alignment_engine/align_full.py
- [[dtw_align_cosine()]] - code - alignment_engine/mert_dtw_align.py
- [[estimate_stanza_boundaries()]] - code - alignment_engine/align_full.py
- [[extract_mert_frames()]] - code - alignment_engine/mert_dtw_align.py
- [[load_lyrics()_2]] - code - alignment_engine/align_full.py
- [[load_lyrics_text()]] - code - alignment_engine/mert_dtw_align.py
- [[load_mert_model()]] - code - alignment_engine/mert_dtw_align.py
- [[main()_6]] - code - alignment_engine/align_full.py
- [[main()_13]] - code - alignment_engine/mert_dtw_align.py
- [[make_syllables()_1]] - code - alignment_engine/align_full.py
- [[mert_dtw_align.py]] - code - alignment_engine/mert_dtw_align.py
- [[normalize_token()_2]] - code - alignment_engine/align_full.py
- [[path_to_word_boundaries()]] - code - alignment_engine/mert_dtw_align.py
- [[percentile()_2]] - code - alignment_engine/align_full.py
- [[post_process_timestamps()]] - code - alignment_engine/mert_dtw_align.py
- [[split_syllables()_2]] - code - alignment_engine/align_full.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/AST_Functions_41_functions
SORT file.name ASC
```
