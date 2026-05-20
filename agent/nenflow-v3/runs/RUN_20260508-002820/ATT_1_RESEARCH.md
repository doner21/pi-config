---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260508-002820
context_saturation_estimate: "~38%"
---

# ATT_1_RESEARCH: Deep Architecture Research - CTC vs Contrastive vs Segmentation-Based Singing Alignment

## Investigation Scope

Per INTAKE ATT_0, investigated four interconnected questions about singing forced alignment architectures:

1. Why hasn't CTC been successfully applied to singing alignment?
2. What are neural contrastive aligners, how do they differ from CTC, and could we train one?
3. Why are SOFA and STARS limited to short audio segments (~30s)?
4. Can cutting audio into pieces defeat the segment-length limitation?

Plus a final recommendation rooted in the user's hardware (GTX 1080 Ti, AMD APU) and data (GTSinger 80h, CTC pipeline working, STARS available).

---

## Q1: Why Has CTC Not Been Used for Singing Alignment?

### What CTC Actually Optimizes

CTC maximizes the log-probability of the correct phoneme sequence, marginalizing over ALL possible frame-level alignments. The formula is P(text | audio) = sum over all alignments pi where B(pi)=text of the product over t of P(pi_t | audio_t). B is the many-to-one mapping that collapses repeated tokens and removes blanks.

CTC treats all valid alignments as equally good during training. Whether a phoneme is emitted on frame 50 or frame 500, as long as the overall sequence probability is high, the loss is satisfied. CTC was designed for ASR (what was said), not for force alignment (when was it said).

### The "Peaky" Nature of CTC Posteriors

The paper "Less Peaky and More Accurate CTC Forced Alignment by Label Priors" (Huang et al., ICASSP 2024, arXiv:2406.02560) definitively characterizes the problem:

CTC models are known to have peaky output distributions. Such behavior is not a problem for ASR, but it can cause inaccurate forced alignments, especially at finer granularity.

The peaky behavior means: CTC places very high probability mass on a single frame for each token onset, but the probability for offsets/trailing frames collapses toward zero rapidly. For ASR, finding the right phoneme anywhere nearby is enough. For forced alignment, you need both onset AND offset boundaries.

The solution Huang et al. propose - label priors that boost paths with fewer blanks during training - improves phone boundary error by 12-40% on speech data. Their pretrained model is released in TorchAudio (Apache 2.0) and usable today.

### Why Held Notes Are Hard for CTC

Consider a 3-second held "ah" vowel in singing:

1. CTC must emit the same token repeatedly across ~150 frames (at 50fps), interspersed with blanks
2. The "peak probability trick" for forced alignment works well for speech where vowel durations are 50-200ms
3. For a 3000ms held note, CTC posterior is not flat - it peaks early and then the model output drifts toward the blank symbol or other plausible phones
4. The model has no explicit duration model - CTC marginalizes over all durations during training, so it is never incentivized to predict accurate durations

Evidence from our own CTC experiment with MMS-300M on Starman (257s, 367 words):

| Metric | Expected (singing) | CTC Result |
|--------|-------------------|------------|
| Median word duration | ~0.4-0.7s | 0.18s |
| Short words (<=0.08s) | <5% | 19.9% |
| Zero-duration words | 0 | 12 (repaired to 0.02s) |

The CTC model consistently underestimates singing durations by 2-4x compared to MERT+DTW baseline (median 0.707s). It detects onsets reasonably well but compresses all offsets.

### Has Anyone Tried CTC for Singing?

Yes, but results are mixed and the literature is thin:

1. KaraSinger (arXiv:2110.04005, 2021): Uses CTC loss in a VQ-VAE for singing voice synthesis. Validates CTC works on singing audio for phoneme discrimination.

2. Singing Language ID via CTC (arXiv:2105.15014, 2021): CTC acoustic model for phoneme recognition in polyphonic music. Demonstrates reliable phoneme posteriors from singing.

3. AdaMER-CTC (arXiv:2403.11578, 2024): Adaptive Maximum Emission Regularization for CTC - specifically designed to reduce peakiness.

4. CTC-Segmentation (lumaku/ctc-segmentation, Apache 2.0): Post-processing tool for CTC posteriors. Conceptually applicable to singing if a singing CTC model exists.

5. ctc-forced-aligner (MahmoudAshraf97, CC-BY-NC 4.0): Uses HuggingFace MMS/Wav2Vec2/HuBERT models. Our experiment shows it produces usable but compressed timings.

Bottom line: No paper has demonstrated high-quality CTC forced alignment specifically for singing voice with held notes. The architectures and tools exist; the gap is the acoustic model training data.

### Is It CTC Itself or the Pre-Training Data?

Both. CTC's mathematical formulation (marginalization over alignments, no explicit duration loss) makes duration prediction an emergent property rather than an explicit objective. This is fine for speech (50-200ms vowels) but breaks for singing (200-3000ms vowels).

Pre-training on speech data compounds the problem. An MMS/Wav2Vec2 model pre-trained on thousands of hours of speech learns that vowel durations are 50-200ms. When presented with a singing held note, the model's internal phoneme duration prior is wildly wrong.

The "Less Peaky" remedy (label priors during training) partially addresses the CTC formulation issue. Fine-tuning on singing data would address the pre-training mismatch. Both are needed.


---

## Q2: Neural Contrastive Aligners

### What Is Contrastive Alignment?

Contrastive alignment is a discriminative approach, unlike CTC's generative approach:

| Property | CTC (Generative) | Contrastive (Discriminative) |
|----------|-----------------|------------------------------|
| Objective | P(audio|text) - maximize likelihood | similarity(audio_frame, text_token) - maximize similarity |
| Framework | Forward-backward on emission probabilities | Learn joint embedding space, then DTW/Viterbi on similarity matrix |
| Duration modeling | Emergent (no explicit loss) | Implicit (DTW path length encodes duration) |
| Loss function | CTC log-loss (marginalization) | InfoNCE / triplet loss / cross-entropy on similarity matrix |
| Memory complexity | O(T x V) per frame | O(T x N) similarity matrix |

### How Contrastive Aligners Work

The pipeline has three stages:

Stage 1 - Learn embeddings:
- Audio encoder (CNN/transformer): maps audio frames to d-dimensional vectors
- Text encoder (transformer/CNN): maps phoneme tokens to d-dimensional vectors
- Both encoders are trained jointly with contrastive loss

Stage 2 - Compute similarity matrix:
- S[t][n] = cosine_similarity(audio_embed[t], text_embed[n])
- Shape: [T_frames x N_tokens]

Stage 3 - Decode alignment path:
- Apply DTW (Dynamic Time Warping) or Viterbi decoding on the similarity matrix
- Find monotonic path from (0,0) to (T,N) maximizing cumulative similarity
- The path directly encodes: token n starts at frame t_start, ends at frame t_end

### Key Papers and Architectures

#### RAD-TTS Alignment Framework (NVIDIA, 2021)

One TTS Alignment To Rule Them All (Badlani et al., arXiv:2108.10447) - the most mature contrastive alignment framework:

- Architecture: Text encoder -> forward-sum algorithm -> Viterbi decoding + static prior
- Forward-sum: Computes alpha(t,n) = probability of being at token n at time t, summing over all valid paths. This is the "soft" version of Viterbi.
- Static prior: A non-learnable alignment prior (e.g., uniform or linear) that biases toward monotonic, evenly-spaced alignments
- Key innovation: The alignment learning is UNSUPERVISED - no forced alignment labels needed during training.

How it differs from CTC:
- CTC: P(text|audio) = sum over all alignments [ product_t P(pi_t|audio_t) ] where pi has blanks
- RAD-TTS aligner: P(text|audio) = forward-sum over monotonic token-to-frame assignments without blanks
- RAD-TTS produces explicit token durations as a byproduct (expected time per token)

Code available: NVIDIA/radtts (GitHub), NeMo Aligner. Apache 2.0. Pretrained on speech TTS data only (LJSpeech, LibriTTS), not singing.

#### CLAP / CLASP / Music-CLAP (Contrastive Language-Audio Pretraining)

- CLAP (LAION, ICASSP 2023): Dual-encoder contrastive framework with InfoNCE loss for global audio-text alignment.
- CLASP: Uses spectrograms + SSL speech encodings in a contrastive framework.
- Music-CLAP (GabinVr/music-CLAP): Pairs frozen MERT audio encoder with BGE text encoder.

Limitation for forced alignment: CLAP learns GLOBAL (utterance-level) alignment, not frame-level. The embeddings are pooled across time. Multi-grained CLAP (arXiv:2408.07919) addresses this but is research-grade.

#### Audio-Text Contrastive for Speech (IEEE/ACM 2024)

Aligning Speech-Text Representations via Contrastive Modality Translation - demonstrates contrastive alignment can handle non-neutral vocal production (emotion), but no singing experiments published.

#### End-to-End Lyrics Alignment (Stoller et al., 2019)

arXiv:1902.06797 - Modified Wave-U-Net that predicts character probabilities directly from raw audio. Mean alignment error of 0.35s. Architecture is closer to CTC than contrastive, but demonstrates end-to-end singing alignment is possible. Code: github.com/stoller/lyrics-alignment (unofficial).

### Could We Train a Contrastive Aligner with GTSinger + GTX 1080 Ti?

GTSinger: 80 hours of singing audio with phoneme-level alignments.

| Factor | Assessment |
|--------|-----------|
| Data quantity | 80h is on the low end but viable. RAD-TTS trained on ~24h LJSpeech. |
| Data quality | Phoneme-level alignments - gold-standard for training |
| GTX 1080 Ti (11GB VRAM) | Tight but workable. Dual encoders with frozen MERT-330M would be ~2-3GB FP16 |
| Training time | ~2-4 days on GTX 1080 Ti |
| Risk | Medium-High. No published success yet. Architectural challenges are non-trivial. |

Architecture sketch:
- Frozen MERT Encoder (330M params, pretrained) -> Linear projection -> d-dim audio embeddings
- Learned phoneme embedding + 1D Conv/Transformer -> d-dim text embeddings
- Similarity matrix S[t][n] = cos(audio_t, text_n)
- Soft-DTW / Forward-sum decoding
- Loss: InfoNCE contrastive + forward-sum + optional duration regularization

### Existing Implementations

| Tool | Type | License | Singing-Ready? |
|------|------|---------|----------------|
| NVIDIA RAD-TTS Aligner | Forward-sum + Viterbi | Apache 2.0 | No |
| torchaudio forced_align() | CTC Viterbi | BSD-2-Clause | No (needs CTC model) |
| CTC-Segmentation | CTC posteriors post-processing | Apache 2.0 | No (needs CTC model) |
| CLAP / Music-CLAP | Global contrastive | MIT | No (not frame-level) |
| MERT (m-a-p/MERT-v1-330M) | SSL features | CC-BY-NC 4.0 | Maybe (as frontend) |
| Soft-DTW (pytorch-softdtw-cuda) | Differentiable DTW loss | MIT | Maybe (component only) |

Verdict: NO off-the-shelf contrastive forced aligner for singing. Pieces exist (MERT, forward-sum, DTW) but must be assembled and trained.


---

## Q3: Why Are SOFA/STARS Limited to ~30s?

### Background

- SOFA: No code found - may be a conceptual reference or internal project
- STARS (arXiv:2507.06670, Jul 2025): "A Unified Framework for Singing Transcription, Alignment, and Refined Style Annotation." 79 stars GitHub. Hierarchical acoustic feature processing across frame, word, phoneme, note, and sentence levels. Non-autoregressive local acoustic encoders.

STARS is the most directly relevant published system - it explicitly outputs phoneme-audio alignment for singing. Our attempt to run it failed due to its hard CUDA requirement (inference/stars.py line 390: torch.device(f"cuda:{int(rank)}")). The bilingual model is 678MB.

### Root Cause 1: Viterbi Decoding Memory - NOT the Primary Bottleneck

The Viterbi algorithm for forced alignment computes a trellis of T x N states:
- T = audio frames (1500 for 30s at 50fps; 12000 for 4min)
- N = phoneme tokens (50 for short segment; 300 for full song)

Memory complexity: O(T x N) = O(TN)

| Audio length | Frames (50fps) | Phonemes | Matrix size | FP32 memory |
|-------------|----------------|----------|-------------|-------------|
| 30s | 1,500 | 50 | 75K | 300 KB |
| 1 min | 3,000 | 100 | 300K | 1.2 MB |
| 4 min | 12,000 | 300 | 3.6M | 14.4 MB |
| 10 min | 30,000 | 500 | 15M | 60 MB |

The Viterbi matrix itself is NOT the bottleneck at 4 minutes - 14.4 MB is trivial on modern hardware. The real computational cost is acoustic model inference for all 12,000 frames.

However, if STARS uses transformer self-attention (quadratic), the complexity jumps to O(T^2):

| Audio length | Frames | Self-attention cells |
|-------------|--------|---------------------|
| 30s | 1,500 | 2.25M (9 MB) |
| 4 min | 12,000 | 144M (576 MB) |
| 10 min | 30,000 | 900M (3.6 GB) |

If STARS uses full self-attention on audio frames, this explains the ~30s limit. At 4 minutes, 576MB exceeds the GTX 1080 Ti's 11GB with batch overhead.

### Root Cause 2: CNN Receptive Field - A Genuine Constraint

The CNN receptive field (RF) determines temporal context per output frame:
RF = 1 + Sum_l (kernel_size[l] - 1) * dilation[l] * stride_product_before[l]

A typical audio CNN (Conv-6, kernel=3, stride=2 every other layer) has RF of ~50-100 frames (1-2s at 50fps). To capture 4-minute song (12,000 frames) you need either:
- Very deep CNNs (impractical, vanishing gradients)
- Dilated convolutions (WaveNet-style)
- Self-attention/transformers (quadratic cost)
- Global pooling (loses temporal resolution)

STARS' hierarchical architecture processes multiple time scales to mitigate the RF problem. But the bottom-level CNN still has a fixed RF. Held notes >2s may not fit within a single RF window.

### Root Cause 3: Training Data Limitation - Very Likely

Based on code inspection and the STARS paper, the model was likely trained on short singing segments (5-30s) from DALI, NUS-48E, and custom datasets. If the model never saw a 4-minute song during training, it has no learned capability for long-range timing. This is a generalization gap, not an architectural limitation.

The SIEVE algorithm (ACM SIGMOD 2022) shows Viterbi CAN be space-efficient for long sequences via divide-and-conquer, but this does not help if the acoustic model hasn't been trained on long sequences.

### Synthesis: Multi-Factorial

| Factor | Severity | Fixable? |
|--------|----------|----------|
| Viterbi matrix size | LOW - 14MB for 4min | N/A |
| Transformer self-attention | HIGH - O(T^2) = 144M cells | Yes - chunked/linear attention |
| CNN receptive field | MEDIUM - 1-2s RF | Yes - dilated convs, multi-scale |
| Training data (short only) | HIGH - never learned long timing | Yes - train longer segments |
| GPU memory for inference | MEDIUM - 678MB + activations | Yes - offload, FP16 |

Verdict: The 30s limit is primarily a training data and design choice, not a fundamental architectural barrier. STARS as-is was designed for and trained on short singing clips.


---

## Q4: Can We Cut Audio Into Pieces?

### The STARS Stanza-Window Experiment - Already Tested and Failed

Our own experiment (run_stars_stanza.py, logged at run_logs/stars_full_alignment_20260507-133347_overlap.log) directly tested this hypothesis:

Setup: Starman (257.3s) split into 19 overlapping windows (10-35s each, stanza-aligned). Each window runs STARS independently. Overlap regions arbitrated by taking the window with better internal consistency. Total: 367 words, 1097 phonemes.

Results:

| Metric | Result |
|--------|--------|
| Median word duration | 0.437s |
| Single-frame words (<=0.017s) | 37/367 (10.1%) |
| Short words (<=0.08s) | 65/367 (17.7%) |
| Local compression bursts | 87 |
| Coverage | 110.4% (overlap) |
| Quality verdict | FAIL |

Eight localized compression bursts were flagged, e.g.:
"was layin' down some rock 'n' roll" - 6 words compressed to 1.6s with 4 single-frame words

The compression happened INSIDE individual windows - not just at boundaries. The root cause was NOT window size or overlap handling. It was STARS' internal tendency to produce compressed timings for rapid/rhythmic passages.

### What Fails at Boundaries

Even with perfect per-window timing, stitching introduces errors:

1. Edge phoneme distortion: First/last words of each window are unreliable because the CNN receptive field extends beyond window edges into silence or unrelated audio. Typical distortion zone: +/-1-2s at each boundary.

2. Gaps between pieces: Even with overlap, windows disagree on timings in the overlap zone. Arbitration must choose one, and it is often wrong.

3. Alignment discontinuity: The alignment path from window N ends at a frame; window N+1 starts independently. The join creates a "jump".

4. Coverage inflation: Our experiment showed 110.4% coverage because overlaps contained duplicated words. Requires lossy trimming.

### Is Slicing Fundamentally Different from the Stanza-Window Approach?

NO. What we did IS audio slicing. The stanza-window approach was: Full song -> split at stanza boundaries -> 19 windows with 2s overlap -> STARS each -> merge. This is exactly the "cut into 8 x 30s pieces" strategy. The failure mode was STARS' inherent localization failures within properly-sized windows.

### Would SOFA Handle This Better Than STARS?

Unknown. SOFA code was not found in public repositories. If SOFA shares STARS' CNN + hierarchical architecture, it would face similar compression issues.

### What an Ideal Stitching Algorithm Would Need

1. Confidence scores per word - only take high-confidence words from each window
2. Cross-fade in the alignment domain - interpolate word durations in overlap zones
3. DTW-constrained overlap resolution - run mini-DTW between overlapping region's audio and words
4. Global consistency pass - Viterbi constrained by stitched boundaries as anchor points
5. Manual correction hooks - human-in-the-loop for the last 5%

### Verdict on Slicing

Slicing cannot fix a model's internal alignment failures. If STARS produces compression bursts inside 20s windows (10.1% single-frame words), slicing just gives you more compression bursts. Boundary stitching adds additional error.

Slicing IS useful when:
- The underlying model produces good per-segment alignments
- The model simply cannot handle long audio (memory, not quality)
- You have good confidence estimates to guide overlap arbitration

For STARS with Starman: slicing was necessary (model cannot handle full song) but insufficient (model produces poor per-segment results).


---

## Q5: Final Recommendation

### Updated Hardware Context

- GTX 1080 Ti: 11GB VRAM, CUDA-capable. STARS previously failed because we ran CPU-only. With the 1080 Ti, STARS inference becomes possible. MMS-300M and MERT-330M also fit in 11GB.
- AMD APU: Secondary compute, sufficient for preprocessing, I/O, and lightweight alignment (MERT+DTW runs on CPU in 3min).

### The Three Paths Evaluated

#### Path A: Fine-tune CTC (MMS-300M) on Singing Data

What we have: CTC pipeline working (ctc_forced_align.py). Model: MahmoudAshraf/mms-300m-1130-forced-aligner (CC-BY-NC 4.0). Data: GTSinger 80h with phoneme alignments.

What fine-tuning would do:
- Adapt MMS-300M acoustic model from speech to singing phoneme priors
- Add "Less Peaky" label-prior technique (Huang et al., 2024) to reduce onset-only behavior
- Potentially add a lightweight duration prediction head

Advantages:
- Uses existing pipeline infrastructure
- MMS-300M is multilingual, well-tested on forced alignment
- GTX 1080 Ti can handle LoRA/partial fine-tuning of 300M model
- Directly produces word timestamps
- Handles full songs naturally (CTC is sequence-agnostic)

Risks:
- CTC fundamentally does not optimize for duration accuracy
- 80h GTSinger may not be enough to shift the duration prior from speech to singing
- CC-BY-NC 4.0 license on default model is problematic for commercial use

Estimated effort: 2-3 weeks
Chance of matching AudioShake quality: 25-40%

#### Path B: Build Contrastive Aligner from Scratch

What we would build: RAD-TTS-style aligner with MERT backbone, contrastive loss, and forward-sum decoding, trained on GTSinger.

Advantages:
- Architecturally designed to produce accurate durations
- Contrastive learning robust to acoustic variation
- MERT backbone provides music-aware features
- Fully open-source from day one

Risks:
- No proven track record for singing
- Training instability risks (contrastive collapse, initialization sensitivity)
- 80h GTSinger is small for contrastive learning
- GTX 1080 Ti limited to batch sizes 4-8
- 60% chance of partial/complete failure

Estimated effort: 4-8 weeks
Chance of matching AudioShake quality: 30-50% if successful

#### Path C: Slice + SOFA/STARS

What we would do: Use GTX 1080 Ti to run STARS on windows, improve stitching.

Advantages: Quick to test (hours), purpose-built for singing alignment.

Disadvantages:
- Already tested and FAILED - STARS stanza windows produced FAIL quality
- Compression bursts occur inside properly-sized windows
- Boundary stitching adds error
- SOFA unavailable (no public code)

Estimated effort: 1-2 days (already done)
Chance of matching AudioShake quality: <10%

### Recommended Path: Hybrid CTC Fine-Tuning + Duration-Aware Loss

Primary: CTC Fine-Tuning with Duration-Aware Loss
1. Start with the existing ctc-forced-aligner pipeline
2. Fine-tune MMS-300M on GTSinger using:
   - Label priors (Huang et al., 2024) to reduce peakiness
   - Optional duration prediction head - a small MLP on CTC encoder outputs predicting phoneme durations, trained with MSE loss against GTSinger ground-truth
   - LoRA adapters (rank 8-16) to limit trainable parameters to ~5-10M
3. Train on GTX 1080 Ti with FP16 - 80h should train in 2-3 days
4. Post-process CTC output with duration head to rescale compressed timings

Fallback: MERT+DTW Baseline Enhancement
If CTC fine-tuning doesn't improve enough, the MERT+DTW pipeline (already producing median 0.707s durations, PASS quality) can be enhanced with:
- Better prototype initialization (TTS-synthesized reference instead of uniform)
- Iterative refinement with more passes
- Stanza-aware window selection

Why not contrastive aligner now? It is the right architecture long-term, but the risk of non-convergence with 80h data and GTX 1080 Ti is too high for an immediate investment. If CTC fine-tuning fails and MERT+DTW plateaus, then a contrastive aligner becomes the logical next step.

### Concrete Next Step

1. This week: Set up LoRA fine-tuning of MMS-300M on GTSinger with label priors + duration head on GTX 1080 Ti
2. Success metric: Median word duration on Starman moving from 0.18s (current CTC) toward 0.4s+ (matched to singing)
3. Acceptance criteria: <5% short words (<=0.08s), zero single-frame words, coverage >95%
4. Parallel: Test STARS on GTX 1080 Ti on a single 30s clip (not sliced) to determine if GPU makes STARS alignment quality acceptable
5. Decision point: After 2 weeks, compare CTC fine-tune results vs. STARS-on-GPU vs. current MERT+DTW baseline

---

## Sources

### Primary Papers (ArXiv)
1. "Less Peaky and More Accurate CTC Forced Alignment by Label Priors" - Huang et al., ICASSP 2024 (arXiv:2406.02560)
2. "One TTS Alignment To Rule Them All" (RAD-TTS aligner) - Badlani et al., 2021 (arXiv:2108.10447)
3. "Tradition or Innovation: A Comparison of Modern ASR Methods for Forced Alignment" - Rousso et al., 2024 (arXiv:2406.19363)
4. "STARS: A Unified Framework for Singing Transcription, Alignment, and Refined Style Annotation" - arXiv:2507.06670 (Jul 2025)
5. "KaraSinger: Score-Free Singing Voice Synthesis with VQ-VAE" - arXiv:2110.04005 (Oct 2021)
6. "End-to-End Lyrics Alignment for Polyphonic Music" - Stoller et al., 2019 (arXiv:1902.06797)
7. "Advancing Multi-grained Alignment for Contrastive Language-Audio Pre-training" - arXiv:2408.07919
8. "SIEVE: A Space-Efficient Algorithm for Viterbi Decoding" - ACM SIGMOD 2022

### Our Codebase Evidence
9. alignment_engine/ctc_work/ctc_diagnostics_20260507_160652.json - CTC forced aligner results
10. alignment_engine/run_logs/stars_full_alignment_20260507-133347_overlap.log - STARS stanza window experiment
11. alignment_engine/TEST_REPORT.md - MERT+DTW baseline results
12. research_alignment/SPECULATIVE_RESEARCH.md - Prior architecture survey
13. research_alignment/CONSERVATIVE_RESEARCH.md - Open-source tool survey

### GitHub Repositories
14. MahmoudAshraf97/ctc-forced-aligner - CTC forced aligner (CC-BY-NC 4.0)
15. NVIDIA/radtts - RAD-TTS alignment framework (Apache 2.0)
16. gwx314/STARS - Singing transcription + alignment (MIT)
17. lumaku/ctc-segmentation - CTC segmentation post-processing (Apache 2.0)
18. yizhilll/MERT - Music Understanding SSL model (CC-BY-NC 4.0)
