---
source_file: "ALIGNMENT_V2_README.md"
type: "document"
community: "Alignment Pipeline"
tags:
  - graphify/document
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# karaoke_player/timing.json

## Connections
- [[Bracket Timestamp Format]] - `parsed_into` [EXTRACTED]
- [[HTML Karaoke Player]] - `consumed_by` [EXTRACTED]
- [[MERT+DTW Cosine-Distance Alignment Pipeline]] - `replaces` [EXTRACTED]
- [[STARS Forced Alignment]] - `output_format_for` [EXTRACTED]
- [[diagnose_alignment.py Diagnostic Script]] - `reads` [EXTRACTED]
- [[karaoke_playerkaraoke.html]] - `reads` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Alignment_Pipeline