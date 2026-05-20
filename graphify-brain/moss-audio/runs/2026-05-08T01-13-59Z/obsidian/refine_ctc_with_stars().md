---
source_file: "alignment_engine/ctc_stars_refine.py"
type: "code"
community: "Alignment Pipeline"
location: "L1019"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Alignment_Pipeline
---

# refine_ctc_with_stars()

## Connections
- [[GateResult]] - `calls` [EXTRACTED]
- [[RefinementReport]] - `calls` [EXTRACTED]
- [[Run the full CTC+STARS refinement pipeline.      Args         ctc_json_path Pa]] - `rationale_for` [EXTRACTED]
- [[_ctc_flat_words()]] - `calls` [EXTRACTED]
- [[assemble_output()]] - `calls` [EXTRACTED]
- [[build_stanza_ctc_windows()]] - `calls` [EXTRACTED]
- [[ctc_stars_refine.py]] - `contains` [EXTRACTED]
- [[gate_window_output()]] - `calls` [EXTRACTED]
- [[main()_9]] - `calls` [EXTRACTED]
- [[merge_windows()]] - `calls` [EXTRACTED]
- [[remove_lalala_from_ctc()]] - `calls` [EXTRACTED]
- [[validate_invariants()]] - `calls` [EXTRACTED]
- [[words_to_phonemes()]] - `calls` [INFERRED]

#graphify/code #graphify/EXTRACTED #community/Alignment_Pipeline