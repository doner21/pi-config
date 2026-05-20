---
type: community
cohesion: 0.08
members: 34
---

# Read lyrics file, split into stanzas, ex

**Cohesion:** 0.08 - loosely connected
**Members:** 34 nodes

## Members
- [[Build Strategy B force-transcription prompt.      Provide ALL lyrics to every se]] - rationale - transcribe_starman.py
- [[Estimate syllable count using vowel-group heuristic.      Rules       - Count g]] - rationale - transcribe_starman.py
- [[Load MOSS-Audio-4B-Instruct model and processor in CPUfloat32 mode.      Return]] - rationale - transcribe_starman.py
- [[Load audio as 16kHz mono numpy array.      Tries primary path first; falls back]] - rationale - transcribe_starman.py
- [[Match timestamped words to stanza word sequences and build timing JSON.      For]] - rationale - transcribe_starman.py
- [[Merge timestamp results from multiple overlapping segments.      For overlap reg]] - rationale - transcribe_starman.py
- [[MossAudioProcessor]] - document - research_nenflow/RUN_20260505-230000_ATT_1_RESEARCH.md
- [[Orchestrate the full transcription pipeline.]] - rationale - transcribe_starman.py
- [[Parse timestamped output from MOSS Audio.      Regex r'(d+.d+)(+)]] - rationale - transcribe_starman.py
- [[Read lyrics file, split into stanzas, extract word lists.      Stanzas are separ]] - rationale - transcribe_starman.py
- [[Run MOSS Audio inference on a single audio segment.      Uses greedy decoding (d]] - rationale - transcribe_starman.py
- [[Split audio into overlapping segments respecting encoder limit.      max_source_]] - rationale - transcribe_starman.py
- [[Split word into syllable strings using equal-length character split.      Args]] - rationale - transcribe_starman.py
- [[Validate the timing.json structure and data integrity.      Checks       - Corr]] - rationale - transcribe_starman.py
- [[build_prompt()_1]] - code - transcribe_starman.py
- [[build_timing_json()_1]] - code - transcribe_starman.py
- [[count_syllables()]] - code - transcribe_full.py
- [[count_syllables()_2]] - code - transcribe_starman.py
- [[load_audio()]] - code - transcribe_starman.py
- [[load_lyrics()_1]] - code - transcribe_starman.py
- [[load_model()]] - code - transcribe_starman.py
- [[main()_1]] - code - quick_transcribe.py
- [[main()_2]] - code - transcribe_full.py
- [[main()_4]] - code - transcribe_starman.py
- [[merge_segment_results()]] - code - transcribe_starman.py
- [[parse_timestamps()]] - code - transcribe_starman.py
- [[quick_transcribe.py]] - code - quick_transcribe.py
- [[run_inference()]] - code - transcribe_starman.py
- [[segment_audio()]] - code - transcribe_starman.py
- [[split_syllables()]] - code - transcribe_full.py
- [[split_word_into_syllable_strings()]] - code - transcribe_starman.py
- [[transcribe_full.py]] - code - transcribe_full.py
- [[transcribe_starman.py]] - code - transcribe_starman.py
- [[validate_timing_json()]] - code - transcribe_starman.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Read_lyrics_file_split_into_stanzas_ex
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_AST Functions (27 functions)]]
- 1 edge to [[_COMMUNITY_Alignment Pipeline]]

## Top bridge nodes
- [[MossAudioProcessor]] - degree 5, connects to 2 communities