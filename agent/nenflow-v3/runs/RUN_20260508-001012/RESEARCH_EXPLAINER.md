# Research Explainer: Fine-Tuning CTC Forced Aligners for Singing Voice

## Here is what you need and what it costs.

---

### THE SHORT ANSWER

**Yes, you can do this on your GTX 1080 Ti using adapter/LoRA fine-tuning.** You will need 10-80 hours of singing data with phoneme timestamps. The best existing dataset is GTSinger (80 hours, 9 languages, manual phoneme alignments). No one has published a fine-tuned singing voice forced alignment model yet, so you would be among the first.

---

### WHAT DATASETS CAN YOU USE?

**GTSinger is your best bet.** It is 80.59 hours of professional singing with manual phoneme-to-audio alignments in 9 languages (Mandarin, English, Japanese, Korean, Russian, Spanish, French, German, Italian). Available on GitHub and Hugging Face. This is the only large-scale singing dataset with reliable phoneme boundaries.

**Opencpop** adds 5.2 hours of Mandarin Chinese pop with phoneme boundaries. **M4Singer** adds more Mandarin singing with musical scores. NUS-48E is too small for training (48 songs, ~2-3 hours).

Combined, you have roughly **90-100 hours** of usable training data across multiple languages. This is enough for fine-tuning.

---

### CAN YOU MAKE YOUR OWN TRAINING DATA?

**Yes, but with caveats.** The pipeline would be:

1. Rip vocal stems from songs using Demucs (free, open-source, best quality)
2. Segment vocals into short phrases (3-15 seconds)
3. Get lyric text for each segment
4. Run an existing CTC aligner (MMS-300M) to generate phoneme timestamps
5. Keep only high-confidence alignments
6. Use these as training data

This is technically feasible. All the pieces exist. No one has published this exact pipeline, but similar semi-supervised approaches exist in the literature. The main risk is that your self-generated labels might be noisy, and noisy labels produce bad models.

---

### CAN YOUR GTX 1080 Ti (11GB) HANDLE THIS?

**Yes, with adapter/LoRA fine-tuning. No for full fine-tuning.**

- **Adapter/LoRA fine-tuning (recommended):** Uses only 5-7 GB VRAM at batch size 2-4. Fits comfortably on your 1080 Ti.
- **QLoRA (4-bit):** Uses 3-5 GB. Even more headroom.
- **Full fine-tuning:** Needs 10-18 GB minimum. Your 1080 Ti will run out of memory.

Training time on 1080 Ti: roughly **20-40 hours** for 10 epochs with adapter/LoRA. You can leave this running overnight for a couple of nights.

---

### SHOULD YOU UPGRADE TO A 4090?

**If you want full fine-tuning, yes.** A 4090 (24GB) lets you:
- Full fine-tune all 300M parameters (the 1080 Ti cannot)
- Train 4-5x faster (5-10 hours instead of 20-40)
- Use larger batch sizes for better convergence
- Fine-tune the 1B parameter MMS model with LoRA

But for adapter/LoRA fine-tuning of MMS-300M, the 1080 Ti is sufficient. Start there.

---

### WHAT ABOUT YOUR AMD APU (128GB, ROCm)?

**It works, but I would not recommend it for this project.** ROCm supports PyTorch and wav2vec2 fine-tuning. However:
- You need WSL2 on Windows (extra setup)
- Community support is thinner than CUDA
- Training speed is slower (no tensor cores equivalent to NVIDIA)
- Debugging compatibility issues takes time

Use the 1080 Ti instead. It will be simpler and faster.

---

### WHAT DOES THE TRAINING PIPELINE LOOK LIKE?

1. **Get GTSinger** (and optionally Opencpop, M4Singer)
2. **Install Hugging Face Transformers, PEFT, and PyTorch** on your Windows machine with CUDA
3. **Load ** using 
4. **Add LoRA adapters** via PEFT library (or use MM built-in adapter training)
5. **Preprocess data**: audio -> 16kHz, text -> tokenizer. GTSinger already has phoneme boundaries.
6. **Train with CTC loss** using Hugging Face Trainer
7. **Evaluate** alignment quality on held-out songs
8. **Optionally iterate**: generate more data (self-generation pipeline), retrain

Reference notebook (adapt for your data):


Reference code for forced alignment:


---

### WHAT ARE THE RISKS?

1. **Singing is not speech.** MMS was trained on 500K+ hours of spoken language. Singing has held notes, vibrato, pitch changes, and different acoustics. Fine-tuning may not fully bridge the gap.
2. **Held notes are hard for CTC.** CTC alignment assumes monotonic progression through phonemes with possible blank tokens. A 3-second held note means the model outputs the same phoneme for 3 seconds. This is outside CTS normal operating range.
3. **You would be pioneering.** No published singing voice CTC aligner fine-tune exists. You are in uncharted territory. It might work beautifully or barely improve.
4. **Self-generated data risk.** If you generate your own training labels using the base MMS model, you are training the model on its own outputs. This can amplify errors.

---

### BOTTOM LINE

| Question | Answer |
|----------|--------|
| Is there enough data? | Yes - GTSinger (80h) + Opencpop (5h) |
| Can 1080 Ti do it? | Yes - adapter/LoRA fine-tuning only |
| Should you buy a 4090? | Not yet - try on 1080 Ti first |
| What will it cost? | Free (datasets) + electricity + your time |
| How long will it take? | 2-5 days for first results on 1080 Ti |
| Has anyone done this before? | No - you would be among the first |

**Recommendation**: Start with GTSinger + adapter fine-tuning on your 1080 Ti. If results are promising, decide whether to invest in a 4090 for full fine-tuning.
