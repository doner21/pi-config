---
source_file: "alignment_engine/ctc_stars_refine.py"
type: "code"
community: "Alignment Pipeline"
location: "L559"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# gate_window_output()

## Connections
- [[GateResult]] - `calls` [EXTRACTED]
- [[Quality-gate a single STARS window output.      Checks       1. Word count matc]] - `rationale_for` [EXTRACTED]
- [[_should_use_ctc()]] - `calls` [EXTRACTED]
- [[assess_local_compression()]] - `calls` [INFERRED]
- [[ctc_stars_refine.py]] - `contains` [EXTRACTED]
- [[extract_stars_real_words()]] - `calls` [EXTRACTED]
- [[refine_ctc_with_stars()]] - `calls` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Alignment_Pipeline