---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260507-222740
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~5%"
---

# INTAKE: Landscape Research — Singing-Trained Forced Aligners & AudioShake Equivalents

## Task Summary

Conduct thorough internet research to map the landscape of singing-trained forced alignment models and tools. The user currently uses AudioShake (proprietary, excellent singing aligner) but wants complete open-source stack ownership. CTC (MMS-300M) works well for word boundaries but underestimates singing durations. The goal is to find open-source models, datasets, and approaches that could match or approximate AudioShake's quality, or that could be fine-tuned to do so.

## Task Type

Pure research / landscape survey. No code to write. No models to run.

## User Intent

The user is planning their next experiment: training a dataset or finding open-source models specifically trained on singing voice for forced alignment. They want to know what exists, what AudioShake likely uses under the hood, and what the closest open-source equivalents are. This research informs whether to:
1. Fine-tune an existing open-source model on singing data
2. Use a different pre-trained model that was already singing-trained
3. Build a custom dataset and train from scratch
4. Accept CTC quality and move on

## Goal Attractor

A research report that answers:
- What technology does AudioShake likely use for its singing forced aligner? (architecture, training data, approach)
- What open-source models on Hugging Face or elsewhere are trained specifically on singing voice alignment?
- What datasets exist for singing voice alignment / singing phoneme timing?
- Are there any papers, blog posts, or community discussions about replicating AudioShake-like quality?
- What are the closest open-source equivalents in terms of capability?
- What would a training pipeline look like (data, architecture, compute requirements)?

## Constraints

1. **Research only** — no code implementation, no model downloads
2. **Web search required** — use `ddgr --json` for DuckDuckGo searches, `web_fetch` for reading pages
3. **Write findings as .md** — output goes to the NenFlow run directory
4. **Be thorough** — search multiple angles: AudioShake technology, Hugging Face singing models, singing alignment papers, singing voice datasets
5. **No speculation without evidence** — cite sources (URLs) for all claims
6. **Windows environment** — the researcher runs in this Pi session with the same tools

## Invariants

(none for a research task)

## Success Criteria

1. At least 4 different search queries executed across different angles
2. At least 3 external pages fetched and read for detail
3. Concrete findings about AudioShake's likely technology stack
4. At least 2 open-source models or approaches identified that are singing-aware
5. At least 2 singing voice datasets identified
6. Clear recommendation for the user's next experiment

## Ambiguities

1. AudioShake may not publicly disclose their architecture — how much can be inferred from patents, job postings, conference talks?
2. The singing alignment field may be sparse — is the MMS-300M model as good as it gets in open source?
3. Community knowledge may be scattered across GitHub issues, Hugging Face discussions, and academic papers

## Routing Decision

Route A (RESEARCH only). No PLAN or EXECUTE needed — this is pure discovery. The researcher produces the report and returns.

## Handoff to Researcher

Search strategy:
1. "AudioShake forced alignment technology singing voice"
2. "singing voice forced alignment open source model hugging face"
3. "singing voice alignment dataset phoneme timing"
4. "AudioShake technology stack architecture deep learning"
5. "MMS forced alignment singing voice fine-tuning"
6. "forced alignment singing vs speech models comparison"

Also search Hugging Face directly for singing models. Check GitHub for related projects. Look for AudioShake patents or technical blog posts.
