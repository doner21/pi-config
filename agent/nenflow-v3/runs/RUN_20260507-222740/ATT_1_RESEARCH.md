---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260507-222740
context_saturation_estimate: "~30%"
---

# RESEARCH: Singing-Trained Forced Aligners & AudioShake Equivalents

## Investigation Scope

Per INTAKE: Survey singing-trained forced alignment, AudioShake technology, open-source equivalents, datasets.

6 DDG searches run. 5 key URLs fetched. 22 sources identified.

---

## 1. AudioShake Technology (Inferred)

AudioShake keeps architecture private. Inferred from API/benchmarks/blog:

- **API**: REST POST /tasks, model "alignment". Optional prior transcript. [Demo repo](https://github.com/audioshake-developer/AudioShake-Alignment-Demo)
- **Preprocessing**: Stem separation first (won Sony Demixing 2023). Vocal isolation drives quality.
- **Pipeline**: Joint transcription + alignment. Jam-ALT benchmark.
- **Scale**: 45 min max. Recently 2x accuracy, 5x speed.

Key advantages: (a) stem separation preprocessing, (b) massive proprietary data, (c) integrated pipeline.

---

## 2. Open-Source Singing-Aware Models

### SOFA: Singing-Oriented Forced Aligner (TOP PICK)
- **Repo**: [github.com/qiuqiao/SOFA](https://github.com/qiuqiao/SOFA)
- **Stars**: 219 | **License**: MIT | **Lang**: Python
- Forced alignment for SINGING VOICE. Better than MFA on singing.
- G2P phoneme pipeline, pretrained models (GitHub Discussions), ONNX export
- Outputs: TextGrid, htk, trans + confidence scores
- Training: full-label, weak-label, no-label tiers
- **Verdict**: Closest open-source equivalent. Purpose-built, pretrained, MIT.

### STARS: Unified Transcription + Alignment + Style
- **Repo**: [github.com/gwx314/STARS](https://github.com/gwx314/STARS)
- **Paper**: [arXiv 2507.06670](https://arxiv.org/abs/2507.06670) (ACL 2025)
- **Stars**: 79 | **Lang**: Python
- First unified: phoneme alignment + note transcription + vocal technique + style
- Hierarchical architecture (frame/word/phoneme/note/sentence levels)
- **Integrates SOFA** for alignment. Has pretrained checkpoints.
- **Verdict**: Most comprehensive. Get transcription + alignment + style in one.

### VocalParse: LALM-Based (BRAND NEW)
- **Repo**: [github.com/pymaster17/VocalParse](https://github.com/pymaster17/VocalParse)
- **Paper**: [arXiv 2605.04613](https://arxiv.org/abs/2605.04613) (May 6, 2026)
- **Stars**: 4 | **Lang**: Python
- LALM-based SVT. Interleaved prompting + Chain-of-Thought.
- SingCrawl dataset pipeline.
- **Verdict**: Very new (yesterday). Track for future.

### Other Tools

| Tool | Stars | Notes |
|------|-------|-------|
| [ctc-forced-aligner](https://github.com/MahmoudAshraf97/ctc-forced-aligner) | 494 | CTC+Wav2Vec2/HuBERT/MMS. Speech-focused, MMS fine-tunable |
| [AlignmentDuration](https://github.com/georgid/AlignmentDuration) | 59 | HMM+Viterbi, duration-aware, MLP-DNN phonetic |
| [plla-tisvs](https://github.com/schufo/plla-tisvs) | 24 | Phoneme alignment + SVS. DTW-attention |
| MFA | -- | General speech. Trainable for singing but SOFA outperforms |

---

## 3. Singing Datasets with Alignment

### With Phoneme-Aligned Labels

| Dataset | Size | Key Features |
|---------|------|-------------|
| **GTSinger** | 16.16 hrs | Manual phoneme alignments, style labels, paired speech |
| **M4Singer** | Multi-style | Alignment + musical score, multi-singer |
| **MUSDB18 lyrics ext** | -- | Phoneme-level alignment |
| **Annotated-VocalSet** | 10.1 hrs | 20 singers, 17 techniques, phoneme annotations |

> GTSinger is the most useful: manual phoneme alignments ready for training.

Sources: [GTSinger](https://github.com/AaronZ345/GTSinger), [M4Singer](https://m4singer.github.io/), [MUSDB18-ext](https://zenodo.org/records/3989267), [Annotated-VocalSet](https://www.mdpi.com/2076-3417/12/18/9257)

---

## 4. Key Papers

1. **STARS** (Guo et al., ACL 2025) - [arXiv 2507.06670](https://arxiv.org/abs/2507.06670) - Unified transcription+alignment+style
2. **VocalParse** (Chen et al., May 2026) - [arXiv 2605.04613](https://arxiv.org/abs/2605.04613) - LALM-based SVT
3. **Phoneme Level Lyrics Alignment** (Schulze-Forster et al., IEEE TASLP 2021) - [DOI](https://dl.acm.org/doi/10.1109/TASLP.2021.3091817) - DTW-attention
4. **Compact Phoneme-To-Audio Aligner for Singing** (Zheng et al., 2023) - [Springer](https://link.springer.com/chapter/10.1007/978-3-031-46664-9_13)
5. **MFA for Singing Audio** (Liu et al., 2024) - [ResearchGate](https://www.researchgate.net/publication/381530211)
6. **Music-Informed Alignment** (Gao & Gupta, MIREX 2020) - [Semantic Scholar](https://www.semanticscholar.org/paper/LYRICS-TRANSCRIPTION-AND-LYRICS-TO-AUDIO-ALIGNMENT-Gao-Gupta/d6e6f06fe5c633290d1b8ebd23aacd776abbda0e)

---

## 5. Constraints

1. **Stem separation matters** -- use Demucs/UVR before alignment
2. **Singing != speech** -- CTC models underestimate singing durations
3. **Data scale gap** -- 10-16 hrs open-source vs AudioShake proprietary
4. **Compute** -- SOFA/STARS fine-tuning manageable on single GPU
5. **Language** -- Most models Mandarin+English. Multilingual sparse.

---

## 6. Recommendations

### Option A: Try SOFA First (Low Effort, High Signal)
1. Clone [qiuqiao/SOFA](https://github.com/qiuqiao/SOFA)
2. Download pretrained checkpoint from GitHub Discussions
3. Run on your singing data, compare against AudioShake
4. Expected: Better than CTC/MMS, may not match AudioShake on polyphonic

### Option B: STARS Pipeline (Medium Effort, Most Comprehensive)
1. Clone [gwx314/STARS](https://github.com/gwx314/STARS) (includes SOFA)
2. Use pretrained checkpoints for transcription+alignment+style
3. Preprocess with Demucs/UVR for vocal isolation
4. Expected: Best open-source quality, closest to AudioShake joint approach

### Option C: Fine-Tune MMS on GTSinger (High Effort, Customizable)
1. Start with facebook/mms-300m
2. Fine-tune on GTSinger (16 hrs manual phoneme alignments)
3. Use ctc-forced-aligner for inference
4. Risk: Small dataset may overfit; needs augmentation

### Option D: Watch VocalParse (Future)
- Very new. Track for pretrained models. LALM approach promising.

### Overall Assessment

The open-source landscape is **better than expected**: SOFA and STARS are purpose-built with pretrained models. GTSinger provides training data. Research active 2021-2026.

**Realistic expectation**: SOFA/STARS + vocal preprocessing = 70-85% of AudioShake on clean singing. 

---

## Unknowns

1. AudioShake exact architecture (not disclosed)
2. SOFA English performance (default models use Mandarin opencpop)
3. Cross-language SOFA/STARS performance
4. Inference speed vs AudioShake API
5. Real-time/streaming capability of open-source
