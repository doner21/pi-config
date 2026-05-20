---
source_file: "tests/test_stars_alignment_engine_regressions.py"
type: "rationale"
community: "Alignment Pipeline"
location: "L140"
tags:
  - graphify/rationale
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# No segment should include words whose pass-1 span falls outside its audio window

## Connections
- [[test_overlong_stanza_segment_does_not_silently_clip_assigned_word_span()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/EXTRACTED #community/Alignment_Pipeline