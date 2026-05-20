# RESEARCH EXPLAINER: Singing Alignment Architecture Deep-Dive

Run ID: RUN_20260508-002820 | May 8, 2026

---

## Here's What You Should Do and Why

### The short version

**Fine-tune your CTC model (MMS-300M) on GTSinger singing data.** Do NOT build a contrastive aligner from scratch yet. Do NOT try audio slicing with STARS again.

### Why?

#### CTC is close to working (better than it looks)

Your CTC experiment (median 0.18s word duration, 19.9% short words) looks bad, but it has two fixable problems:

1. **CTC's "peaky" output** - the model spikes probability on token onsets but can't predict offsets. This is a known, well-studied problem. The paper "Less Peaky and More Accurate CTC Forced Alignment" (Huang et al., ICASSP 2024) provides a fix: add label priors during training that penalize too many blanks. Their code is in TorchAudio. This can be applied to fine-tuning.

2. **Wrong acoustic prior** - MMS-300M was trained on 300,000 hours of SPEECH. Speech vowels are 50-200ms. Singing vowels are 200-3000ms. The model is doing what it learned. Fine-tuning on GTSinger (80h of singing with phoneme labels) retrains this prior.

The open question from INTAKE - "Is it CTC or the data?" - the answer is: **BOTH, but both are fixable via fine-tuning with label priors.**

#### STARS slicing already failed (don't repeat)

You ran exactly the experiment INTAKE proposed: cut Starman into 19 overlapping windows, run STARS on each, stitch. Result: FAIL. 10.1% of words were single-frame (essentially duration=0), 17.7% under 0.08s, 87 compression bursts.

The failure happened inside properly-sized windows - not at boundaries. STARS compresses rapid singing passages regardless of window size. Slicing doesn't fix the underlying model problem.

STARS was worth testing on GPU (previously you were CPU-only), but the stanza-window experiment shows the quality problem isn't the length limit - it's STARS' internal alignment behavior.

#### A contrastive aligner is too risky right now

The concept is architecturally superior (explicit duration modeling via forward-sum, better handling of acoustic variation). BUT:

- No published contrastive aligner for singing exists anywhere
- 80h GTSinger is viable but small for contrastive learning
- Training stability is hard (contrastive collapse, initialization sensitivity)
- GTX 1080 Ti means batch sizes of 4-8, 4-7 days of training
- **60% chance of failure** - may not converge or may produce worse results than CTC

This is the *right long-term bet* but the *wrong immediate investment*. Only pursue it if CTC fine-tuning fails.

### What to do this week

1. Set up LoRA fine-tuning of MMS-300M on GTSinger with label priors + optional duration prediction head
2. Train on GTX 1080 Ti (2-3 days)
3. Target: median word duration on Starman moves from 0.18s to 0.4s+
4. In parallel: test STARS on GTX 1080 Ti on a single 30s clip to see if GPU improves quality

### Why this beats AudioShake's approach

AudioShake likely uses a custom supervised model trained on proprietary singing data. We don't have their data, but we have GTSinger (80h of ground-truth phoneme alignments). Fine-tuning MMS-300M with label priors gives us the closest approximation: a strong pretrained acoustic model + singing-specific duration awareness.

### If it doesn't work

The MERT+DTW pipeline you already built (median 0.707s, PASS quality) is the fallback. It's worse than what a fine-tuned neural model could be, but it's already a viable karaoke aligner. Enhance it with TTS-synthesized references and more refinement passes.

The contrastive aligner becomes the next step only if both CTC fine-tuning AND MERT+DTW enhancement fail to reach AudioShake quality.

---

*For detailed technical analysis with math, architecture comparisons, and all paper references, see ATT_1_RESEARCH.md.*
