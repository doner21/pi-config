---
source_file: "ALIGNMENT_V2_README.md"
type: "document"
community: "Alignment Pipeline"
tags:
  - graphify/document
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# transcribe_full_v2.py (v2 pipeline)

## Connections
- [[MOSS-Audio-4B-Instruct Model]] - `uses` [EXTRACTED]
- [[V2 Quality Gates]] - `implements` [EXTRACTED]
- [[align_words_to_window() with SequenceMatcher]] - `implements` [EXTRACTED]
- [[build_prompt() Function (v2)]] - `implements` [EXTRACTED]
- [[choose_lyric_window() Function]] - `implements` [EXTRACTED]
- [[segment_diagnostics.json]] - `writes` [EXTRACTED]
- [[transcribe_full.py (v1 pipeline)]] - `improves_upon` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Alignment_Pipeline