---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260508-001012
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~4%"
---

# INTAKE: Practical Feasibility Research — Fine-Tuning CTC Aligners for Singing Voice

## Task Summary

Research the practical requirements for fine-tuning a CTC-based forced alignment model (specifically `facebook/mms-300m-1130-forced-aligner` or similar wav2vec2/MMS variants) on singing voice data to improve duration accuracy for held notes and vocal extensions. The user wants to understand data availability, hardware requirements, and whether their current hardware (GTX 1080 Ti 11GB, AMD APU with 128GB unified ROCm memory) is viable or if a GPU upgrade (4090/5090) is needed.

## Task Type

Pure research. No code to write. No models to download or run.

## User Intent

The user wants to evaluate the feasibility of fine-tuning an open-source CTC forced aligner on singing voice to get AudioShake-level quality with full-stack ownership. They need concrete answers about:
1. What singing datasets exist with phoneme/word-level timing annotations
2. Whether they can generate training data from vocal stems ripped from music libraries
3. What hardware is needed (GPU VRAM, RAM, training time)
4. Whether their current GTX 1080 Ti (11GB) or AMD APU (128GB unified, ROCm) can handle it
5. Whether a 4090 or 5090 would change the equation
6. What the training pipeline would actually look like

## Goal Attractor

A research report that answers:

1. **Singing datasets with alignments**: What public datasets exist with phoneme-level or word-level timing annotations for singing voice? (e.g., GTSinger, M4Singer, OpenSinger, NUS-48E, etc.) — with sizes, annotation quality, and licensing.

2. **Self-generated data pipeline**: What tools exist to rip vocal stems at scale? (Demucs, UVR, etc.) What additional annotation would be needed to make the data training-ready? Could existing CTC aligners annotate segmented vocals, creating a semi-supervised pipeline?

3. **Hardware requirements**:
   - What GPU VRAM does fine-tuning MMS-300M require? (with LoRA, QLoRA, full fine-tune)
   - Can a GTX 1080 Ti (11GB) handle LoRA fine-tuning?
   - Can the AMD APU (128GB unified, ROCm) be used? (MMS needs transformers+torch, ROCm support?)
   - What does a 4090 (24GB) or 5090 (32GB?) enable that the 1080 Ti cannot?
   - Estimated training time for different hardware tiers

4. **Fine-tuning methodology**: What approaches exist for fine-tuning wav2vec2/MMS for forced alignment? (CTC loss, full fine-tune vs adapter vs LoRA, data requirements)

5. **Cost/Effort estimate**: Rough estimate of time, data, and compute needed vs expected quality improvement.

## Constraints

1. **Research only** — no code, no downloads, no GPU testing
2. **Web search required** — use `ddgr --json` and `web_fetch`
3. **Specific answers needed** — not "it depends" but concrete numbers where possible
4. **Consider the user's current setup**: Windows, GTX 1080 Ti 11GB, AMD APU 128GB unified
5. **Be honest about feasibility** — if fine-tuning requires a 4090 minimum, say so

## Invariants

(none for research)

## Success Criteria

1. At least 4 singing datasets identified with alignment annotations
2. Self-generation pipeline assessed for viability (can vocal stems + CTC ≈ training data?)
3. Concrete VRAM requirements for LoRA, QLoRA, and full fine-tune of MMS-300M
4. Clear recommendation on whether 1080 Ti is sufficient or if upgrade is needed
5. Rough training time estimates for different hardware tiers
6. Fine-tuning code/methodology identified (specific repos, papers, or Hugging Face scripts)

## Ambiguities

1. MMS-300M was trained on 1,130 languages — how much singing data was in the pre-training mix?
2. Fine-tuning for forced alignment specifically (not just ASR) may require different loss functions
3. AMD ROCm support for transformers/wav2vec2 may be limited

## Routing Decision

Route A — RESEARCH only. Produce the report and return.

## Handoff to Researcher

Search angles:
1. "GTSinger dataset phoneme alignment singing voice size"
2. "M4Singer OpenSinger singing dataset phoneme alignment"
3. "fine-tune wav2vec2 MMS forced alignment singing voice"
4. "LoRA fine-tune wav2vec2 VRAM requirements GPU"
5. "facebook MMS forced aligner fine-tuning hugging face"
6. "singing voice alignment dataset with timestamps 2024 2025"
7. "demucs vocal stem extraction training data pipeline"
8. "AMD ROCm wav2vec2 fine-tuning compatibility"
