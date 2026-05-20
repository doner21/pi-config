---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260508-002820
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~3%"
---

# INTAKE: Deep Architecture Research — CTC vs Contrastive vs Segmentation-Based Singing Alignment

## Task Summary

Research four interconnected questions about singing forced alignment architectures to guide the user's next investment decision (what to build/train vs what to work around):

1. Why haven't CTC models been successfully applied to singing alignment?
2. What are neural contrastive aligners, how do they differ from CTC, and could we train one?
3. Why are SOFA and STARS limited to short audio segments (~30s)?
4. Could we defeat the segment-length limitation by simply cutting audio into pieces?

## Task Type

Deep architecture research. Requires understanding of CTC loss, Viterbi decoding, CNN receptive fields, transformer self-attention complexity, and contrastive learning for sequence alignment.

## User Intent

The user is evaluating their technical strategy for singing forced alignment. They've seen that:
- CTC (MMS-300M) handles full songs but underestimates singing durations
- SOFA/STARS capture singing duration well but can't handle long audio
- Fine-tuning CTC on singing data is one path (researched in RUN_20260508-001012)
- But they want to know if there are fundamentally better architectures to pursue

The unspoken question is: "Should I invest in fine-tuning CTC, or should I switch to a different architecture entirely?"

## Goal Attractor

A research report that answers:

**Q1: Why not CTC for singing?**
- What specifically about CTC loss makes it suboptimal for held notes / singing durations?
- Has anyone tried CTC for singing and published results (positive or negative)?
- Is the issue with CTC itself, or just that existing CTC models weren't trained on singing?
- What would CTC do wrong on a 3-second held note?

**Q2: Neural contrastive aligners**
- What is a contrastive alignment approach? (e.g., contrastive predictive coding, DTW-based, attention-based)
- How do they differ from CTC in terms of: loss function, architecture, output format, duration modeling?
- Are there published contrastive aligners for speech? (e.g., RAD-TTS aligner, MFA neural, SpeechSplit alignment)
- Could we train a contrastive aligner with GTSinger data + GTX 1080 Ti?
- What would the architecture look like? (encoder-decoder? siamese? attention?)

**Q3: Why are SOFA/STARS segment-limited?**
- What specific architectural component limits them to ~30s?
- Is it the Viterbi decoder memory (quadratic in sequence length)?
- Is it the CNN receptive field (fixed kernel/stride, can't capture long-range)?
- Is it a design choice (trained only on short segments) or a fundamental architectural limit?
- Could the architecture be modified to handle longer audio?

**Q4: Cut audio into pieces?**
- If SOFA/STARS work well on 30s segments, why not slice a 4-minute song into 8 × 30s pieces?
- What problems arise at segment boundaries? (edge phoneme distortion, gap handling, stitching)
- Is this approach fundamentally the same as the stanza-boundary windowing we already tried with STARS?
- Would SOFA handle this better than STARS because of its architecture?
- What would a production-grade stitching algorithm look like?

## Constraints

1. **Research only** — no code, no model downloads
2. **Web search required** — `ddgr --json`, `web_fetch`
3. **Deep technical answers** — not surface-level, dig into architecture papers and loss functions
4. **Connect to user's hardware** — answers should reference GTX 1080 Ti, AMD APU where relevant
5. **Be honest about the field** — if singing alignment is inherently hard and no architecture has solved it, say so

## Success Criteria

1. Concrete explanation of CTC's failure modes on held notes (with math/architecture reasoning)
2. At least 2 contrastive alignment approaches identified with papers/repos
3. Clear explanation of SOFA/STARS architecture bottlenecks (Viterbi, CNN, or both)
4. Assessment of the audio-slicing approach (pros, cons, known failure modes)
5. A final recommendation: which architectural path to invest in

## Routing Decision

Route A — RESEARCH only.

## Handoff to Researcher

Search angles:
1. "CTC loss singing voice alignment held notes limitations"
2. "contrastive learning sequence alignment speech forced alignment"
3. "RAD-TTS alignment model architecture contrastive"
4. "Viterbi decoding memory complexity long sequences forced alignment"
5. "SOFA STARS architecture CNN Viterbi segment length limitation"
6. "slicing audio segments forced alignment boundary stitching"
7. "neural forced alignment architecture comparison CTC attention"
8. "singing voice alignment fundamental challenges held notes duration"
