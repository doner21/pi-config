---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260508-001012
context_saturation_estimate: "~52%"
---

## Investigation Scope

Research practical feasibility of fine-tuning CTC forced alignment models (facebook/mms-300m-1130-forced-aligner) on singing voice data. Scope per INTAKE: datasets, self-generation pipeline, VRAM/hardware requirements, fine-tuning methodology, existing models.

## 1. Singing Datasets with Phoneme/Word Timing Annotations

### 1.1 GTSinger (NeurIPS 2024) - BEST OVERALL

| Field | Detail |
|-------|--------|
| Hours | 80.59 singing + 16.16 paired speech |
| Languages | 9 (Mandarin, English, Japanese, Korean, Russian, Spanish, French, German, Italian) |
| Singers | 20 professional singers |
| Annotation | Manual phoneme-to-audio alignments, global style labels, realistic music scores |
| License | Research use |
| Download | github.com/liangsw20/GTSinger / huggingface.co/datasets/YGGYY/GTSinger |

### 1.2 Opencpop

| Field | Detail |
|-------|--------|
| Hours | ~5.2 hours (3,756 utterances) |
| Language | Mandarin Chinese |
| Annotation | Phoneme boundaries, note boundaries, pitch types |
| License | CC-BY-NC-4.0 |
| Download | github.com/wenet-e2e/opencpop / huggingface.co/datasets/espnet/ace-opencpop-segments |

### 1.3 M4Singer

| Field | Detail |
|-------|--------|
| Language | Mandarin Chinese |
| Annotation | Musical scores, phoneme-level alignments |
| Download | github.com/M4Singer/M4Singer (Google Drive) |

### 1.4 NUS-48E

| Field | Detail |
|-------|--------|
| Size | 48 songs (~2-3 hours) |
| Language | English |
| Annotation | Balanced phoneme distribution |
| Note | Too small for training alone |

### 1.5 OpenSinger

| Field | Detail |
|-------|--------|
| Languages | Multiple |
| Download | Via Amphion toolkit (github.com/open-mmlab/Amphion) |

### 1.6 SVCC 2025

| Field | Detail |
|-------|--------|
| Download | huggingface.co/datasets/lestervioleta/svcc2025 |

### Dataset Summary

| Dataset | Hours | Languages | Phoneme Alignments | Best For |
|---------|-------|-----------|-------------------|----------|
| **GTSinger** | 80.59 | 9 | Yes - Manual | Primary training |
| **Opencpop** | 5.2 | Mandarin | Yes - Semi-auto+manual | Supplementary |
| **M4Singer** | ~10-20 | Mandarin | Yes - Musical scores | Supplementary |
| **NUS-48E** | ~2-3 | English | Limited | Eval only |
| **OpenSinger** | ? | Multi | Unclear | Supplementary |

## 2. Self-Generated Data Pipeline

### 2.1 Pipeline Concept

Music files -> Vocal stem extraction (Demucs/UVR) -> Segment into phrases -> Run CTC aligner -> Use alignments as training data

### 2.2 Vocal Extraction Tools

| Tool | Quality | Speed | GPU |
|------|---------|-------|-----|
| Demucs (htdemucs_ft) | Best | ~30s/min on GPU | Yes |
| UVR (Ultimate Vocal Remover) | Very Good | Moderate | Yes |
| Spleeter | Good | Fast | Optional |

Demucs is Metas open-source SOTA. Outputs separate stems (vocals.wav, drums.wav, bass.wav, other.wav).

### 2.3 Semi-Supervised Loop

1. Extract vocals via Demucs/UVR
2. Segment into 3-15 second phrases (VAD or manual)
3. Transcribe lyrics for each segment
4. Align using existing MMS-300M forced aligner
5. Filter low-confidence alignments
6. Fine-tune on high-confidence data
7. Re-align with improved model -> more data -> retrain

### 2.4 Documentation Status

- STARS paper (arxiv.org/pdf/2507.06670): automatic singing annotation pipeline
- TIPAA-SSL (mdpi.com/2624-599X/6/3/42): text-independent phone alignment using SSL
- Semi-supervised singing voice separation (jmvalin.ca/papers/semi_supervised_svs.pdf)
- No published Demucs->CTC->retrain loop for singing specifically, but all components exist

### 2.5 Viability

| Factor | Assessment |
|--------|------------|
| Technical feasibility | High - all components exist |
| Quality of self-generated data | Medium - depends on extraction + initial aligner |
| Bootstrap problem | Need decent initial aligner |
| Published precedent | None for exact pipeline |
| Engineering effort | Medium - custom pipeline required |

## 3. Hardware Requirements

### 3.1 Model Size

MMS-300M = ~300M params (CNN encoder + 24 transformer layers + CTC head).
Critical: MMS adapter training only trains ~2.5M params per language, freezing the 300M base.

### 3.2 VRAM Requirements for MMS-300M Fine-Tuning

Based on community reports (Hugging Face forums discuss 15416) and Modal.com VRAM formula (16GB per 1B params for fp16 full fine-tune):

| Method | Precision | Batch 1 | Batch 2 | Batch 4 | Batch 8 |
|--------|-----------|---------|---------|---------|---------|
| Full fine-tune | fp32 | 16-18 GB | 18-22 GB | 24-30 GB | OOM 24GB |
| Full fine-tune | fp16 mixed | 10-12 GB | 13-16 GB | 18-22 GB | 28-32 GB |
| LoRA (r=8) | fp16 | 5-7 GB | 6-8 GB | 8-10 GB | 12-14 GB |
| LoRA (r=16) | fp16 | 6-8 GB | 7-9 GB | 10-12 GB | 14-16 GB |
| QLoRA (4-bit) | nf4 | 3-5 GB | 4-5 GB | 5-7 GB | 8-10 GB |
| Adapter only (MMS) | fp16 | 4-5 GB | 5-6 GB | 6-8 GB | 9-11 GB |
| CTC head only | fp16 | 4-5 GB | 5-6 GB | 6-8 GB | 9-11 GB |

Gradient checkpointing reduces VRAM by 30-40% with ~20% speed penalty.

### 3.3 Hardware Tier Assessment

**GTX 1080 Ti (11GB):**
- Full fine-tune: NO (even fp16 borderline, OOM risk)
- LoRA (r=8) fp16: YES, batch 2-4
- QLoRA 4-bit: YES, batch 4-8
- Adapter only: YES, batch 4-8
- Verdict: Can do adapter/LoRA. Cannot full fine-tune.

**AMD APU 128GB Unified (ROCm):**
- ROCm supports PyTorch and wav2vec2 (confirmed: rocm.blogs.amd.com)
- Unsloth supports AMD (unsloth.ai/docs/get-started/install/amd)
- Windows requires WSL2 (tillcode.com/amd-rocm-in-wsl2-pytorch-installation-limitations)
- 128GB unified = CPU offloading possible (slow)
- Verdict: Possible but high friction. Prefer 1080 Ti.

**RTX 4090 (24GB):**
- Full fine-tune fp16: YES, batch 4-8
- LoRA fp16: YES, batch 8-16+
- 4-5x faster than 1080 Ti
- Verdict: Enables full fine-tuning and fast iteration.

**RTX 5090 (32GB speculated):**
- Full fine-tune with large batches
- Can LoRA fine-tune MMS-1B
- Verdict: Overkill for MMS-300M unless you need 1B model.

### 3.4 Training Time Estimates (10-20 hours singing data)

| Hardware | Method | Per Epoch | 10 Epochs |
|----------|--------|-----------|-----------|
| 1080 Ti | Adapter/LoRA | 2-4 hours | 20-40 hours |
| 1080 Ti | QLoRA 4-bit | 3-5 hours | 30-50 hours |
| 4090 | Full fine-tune fp16 | 0.5-1 hour | 5-10 hours |
| 4090 | Adapter/LoRA | 0.3-0.5 hour | 3-5 hours |
| Cloud A100 40GB | Full fine-tune | 0.2-0.4 hour | 2-4 hours |
| AMD APU ROCm | Adapter/LoRA | 4-8 hours | 40-80 hours |

## 4. Fine-Tuning Methodology

### 4.1 MMS Adapter Training (RECOMMENDED)

Official Hugging Face blog: huggingface.co/blog/mms_adapters

Steps:
1. Load base model (facebook/mms-300m or facebook/mms-1b-all)
2. Add adapter layers (bottleneck: linear down -> activation -> linear up) after attention blocks
3. Freeze base model, train only adapters (~2.5M params for 1B)
4. Use CTC loss (standard Wav2Vec2ForCTC)
5. Data: audio files + transcriptions + tokenizer

Key notebook by Patrick von Platen:
colab.research.google.com/github/patrickvonplaten/notebooks/blob/master/Fine_Tune_MMS_on_Common_Voice.ipynb

Covers: tokenizer creation, data preprocessing, Wav2Vec2ForCTC, adapter loading, trainer setup.
Reports: low WER after 10-20 minutes of fine-tuning for low-resource ASR.

### 4.2 Full Fine-Tuning (Wav2Vec2ForCTC)

Canonical guides:
- huggingface.co/blog/fine-tune-wav2vec2-english
- huggingface.co/blog/fine-tune-xlsr-wav2vec2
- github.com/khanld/ASR-Wav2vec-Finetune



### 4.3 LoRA via PEFT



### 4.4 CTC Head Only

Freeze encoder, train only final linear projection (lm_head). Least expensive.

### 4.5 Forced Alignment vs ASR Fine-Tuning

CRITICAL: User wants alignment accuracy, not transcription.
- CTC loss is the same for both tasks
- For alignment: frame-level phoneme probabilities matter more than final argmax text
- The mms-300m-1130-forced-aligner model uses CTC segmentation algorithm to convert probabilities to time boundaries
- GitHub: github.com/MahmoudAshraf97/ctc-forced-aligner
- PyTorch tutorial: docs.pytorch.org/audio/stable/tutorials/forced_alignment_tutorial.html

### 4.6 Alternative: Montreal Forced Aligner (HMM-based)

MFA (montreal-forced-aligner.readthedocs.io) uses HMM approach.
Some researchers find HMM more robust than CTC for alignment.
MFA has pre-trained acoustic models. Could bootstrap with MFA -> train CTC.

## 5. Existing Fine-Tuned Models

### 5.1 No Singing-Specific Models Found

Searched Hugging Face for singing voice + wav2vec2/MMS + forced alignment.
No publicly available fine-tuned MMS/wav2vec2 model for singing voice found.

### 5.2 Related Checkpoints

| Model | Type | Link |
|-------|------|------|
| facebook/mms-300m-1130-forced-aligner | MMS-300M for forced alignment | HF Hub (MahmoudAshraf) |
| facebook/mms-1b-all | MMS 1B + 1162 language adapters | HF Hub |
| facebook/wav2vec2-xls-r-300m | Predecessor to MMS | HF Hub |
| STARS (ACL 2025) | Singing annotation framework | No public checkpoint found |

### 5.3 Qwen3-ForcedAligner-0.6B

New model (github.com/QwenLM/Qwen3-ASR, arxiv.org/pdf/2601.21337) supports timestamp prediction for arbitrary units in 11 languages. Claims timestamp accuracy surpassing E2E forced-alignment models. Could serve as alternative or baseline.

## 6. Recommendations

### 6.1 Hardware Verdict

| Tier | Hardware | What You Can Do | Verdict |
|------|----------|-----------------|---------|
| Minimum viable | GTX 1080 Ti (11GB) | Adapter fine-tune, batch 2-4 | Start here |
| Comfortable | RTX 4090 (24GB) | Full fine-tune, batch 4-8, fast | Upgrade target |
| Overkill | RTX 5090 (~32GB) | Full MMS-1B fine-tune | Only for 1B model |
| Avoid | AMD APU ROCm | Adapter/LoRA, slower | Too much friction |

### 6.2 Recommended Path

1. Quick start (days): GTSinger + Opencpop -> adapter fine-tune MMS-300M on 1080 Ti -> evaluate
2. Self-generated data (weeks): Demucs vocals -> segment -> base MMS align -> filter -> fine-tune on real+generated
3. Full pipeline (months): Combine 1+2, upgrade to 4090, full fine-tune, iterate

### 6.3 Key Risks

1. Singing != speech: MMS pre-trained on speech, not singing. Fine-tuning may not transfer.
2. Held notes: CTC struggles with long-held phonemes (monotonic alignment with blank tokens).
3. Data quality: Self-generated alignments may be noisy. Garbage in, garbage out.
4. Pioneer territory: No one has published this exact approach. Unknown if it works.

### 6.4 Cost Summary

| Scenario | Hardware | Data | Time | Risk |
|----------|----------|------|------|------|
| LoRA on existing datasets | 1080 Ti (owned) | Free (GTSinger+Opencpop) | 1-3 days | Medium |
| Full fine-tune | 4090 (~600) | Free datasets | 1-2 days | Lower |
| Self-generated + fine-tune | 4090 | Engineering time | 2-4 weeks | Higher |

## Unknowns Remaining

1. Baseline MMS-300M alignment quality on singing (how bad is it without fine-tuning?)
2. GTSinger exact license terms for derivative model training
3. AMD APU specific ROCm performance (depends on model/version)
4. RTX 5090 exact specs (32GB is speculative)
5. CTC held-note accuracy ceiling (no published research found)
6. STARS model weight availability
