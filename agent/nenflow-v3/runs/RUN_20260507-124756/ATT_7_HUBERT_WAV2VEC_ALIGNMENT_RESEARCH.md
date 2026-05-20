# ATT_7 — HuBERT / Wav2Vec2 / WhisperX / CTC Forced Alignment for Full-Song Lyric Timing in Singing

**Date:** 2026-05-07  
**Repo:** `C:/Users/doner/moss_audio`  
**Scope:** Research only. No production code edited.

## Executive verdict

**Best off-the-shelf candidate to test as the ONE primary coarse/full-song known-lyrics aligner:**

> **`MahmoudAshraf97/ctc-forced-aligner` with the default `MahmoudAshraf/mms-300m-1130-forced-aligner` model, or with a speech Wav2Vec2/HuBERT CTC model for commercial-license-safe experiments.**

Why: it is built for **audio + known transcript forced alignment**, supports word/char/sentence output, has long-audio chunking knobs, can run on CPU or CUDA, and is much easier to set up in this repo than STARS. It is the closest thing found to a drop-in full-song lyric aligner.

However, the critical caveat is unchanged:

> **I did not find a mature, widely validated, off-the-shelf HuBERT/Wav2Vec2/WhisperX/CTC forced aligner that is explicitly trained and validated for polyphonic singing vocals in English popular music.**

So the recommendation is **test CTC forced alignment as the operational primary coarse aligner**, not because it is proven singing-specialized, but because it is the fastest known-lyrics aligner to integrate and may outperform STARS in this repo operationally. If STARS can run on a proper CUDA machine, STARS remains the more singing-domain-specific model.

---

## Method notes

Required DuckDuckGo searches were attempted with:

```bash
ddgr --json -n 5 "ctc-forced-aligner"
ddgr --json -n 5 "WhisperX wav2vec2 forced alignment singing"
ddgr --json -n 5 "Wav2Vec2 forced alignment lyrics singing"
ddgr --json -n 5 "HuBERT singing alignment"
ddgr --json -n 5 "DALI lyrics alignment wav2vec2"
ddgr --json -n 5 "audio lyrics alignment wav2vec2 CTC"
ddgr --json -n 5 "HuggingFace wav2vec2 singing lyrics forced alignment"
```

`ddgr` returned `HTTP Error 202: Accepted` and empty JSON arrays in this environment. I then used GitHub API, HuggingFace model API, PyPI metadata, raw GitHub READMEs/source files, and arXiv API as fallbacks.

---

## Answers to the five requested questions

### (1) Is there an off-the-shelf aligner that can do most of the work?

**Yes, probably for a testable coarse-aligner baseline:** `ctc-forced-aligner`.

- **MahmoudAshraf97/ctc-forced-aligner**  
  URL: https://github.com/MahmoudAshraf97/ctc-forced-aligner  
  HF default model: https://huggingface.co/MahmoudAshraf/mms-300m-1130-forced-aligner
  - README says it aligns **text and audio** using HuggingFace CTC models.
  - Supports Wav2Vec2, HuBERT, MMS.
  - CLI takes `--audio_path`, `--text_path`, `--language`, `--split_size word|sentence|char`, `--window_size`, `--context_size`, `--device`.
  - Python API returns `word_timestamps` via `postprocess_results(...)`.
  - This is the most direct known-lyrics aligner found.

- **WhisperX**  
  URL: https://github.com/m-bain/whisperX
  - Excellent word timestamping for speech after ASR, but it is not primarily a known-lyrics full-song forced aligner.
  - Internally, `whisperx.align(transcript_segments, model_a, metadata, audio, ...)` can align provided segment dictionaries, but it expects rough segment `start`/`end` times.
  - It is therefore better as a **segment-local refinement tool** after another coarse segmenter, not as the one full-song aligner.

- **ctc-segmentation**  
  URL: https://github.com/lumaku/ctc-segmentation
  - Useful component, not standalone. Needs CTC logits from a model.

### (2) Is it trained/validated on singing vocals?

**For the mature off-the-shelf aligners: no.**

- `ctc-forced-aligner` default model is MMS forced-alignment / speech-derived, not a singing lyrics model. Its HF card says it is a conversion of the torchaudio MMS-300M forced-alignment checkpoint.
- WhisperX alignment models are speech CTC models; README says language-specific wav2vec2 alignment model is needed and limitations include dictionary coverage and overlapping speech. No singing validation is claimed.
- HuBERT/Wav2Vec2 default ASR models are trained/evaluated on speech corpora such as LibriSpeech, VoxPopuli, FLEURS, Common Voice, etc.

**Singing/lyrics-specific HF models were found, but none is a clear production aligner:**

1. `ashanhr/wav2vec2-large-xls-r-300m-finetune-dali`  
   URL: https://huggingface.co/ashanhr/wav2vec2-large-xls-r-300m-finetune-dali  
   - Fine-tuned from `facebook/wav2vec2-xls-r-300m` on an unknown/DALI-like dataset.
   - License: Apache-2.0 per model card.
   - Reported WER: **0.7088**, which is very high.
   - Tokenizer vocab is English lowercase-ish but incomplete (`q`/`x` absent), so exact lyrics alignment may have OOV issues.
   - Not recommended as the primary model without empirical testing.

2. `ashanhr/wav2vec2-large-xls-r-2b-finetune-dali-480-minutes`  
   URL: https://huggingface.co/ashanhr/wav2vec2-large-xls-r-2b-finetune-dali-480-minutes  
   - DALI-related name, but model card lacks usable validation details and license field is missing.
   - Large/heavy and not clearly validated for alignment.

3. `gary109/ai-light-dance_singing_ft_wav2vec2-large-xlsr-53`  
   URL: https://huggingface.co/gary109/ai-light-dance_singing_ft_wav2vec2-large-xlsr-53  
   - Model card says fine-tuned on `GARY109/AI_LIGHT_DANCE - ONSET-SINGING`.
   - License: Apache-2.0.
   - Reported WER about **0.20** on its eval set.
   - But tokenizer vocab only includes `a-g`, digits, `#`, `|`, and special tokens. That looks like note/onset/symbol transcription rather than general English lyric text. Not suitable for normal English lyric forced alignment.

4. Vietnamese Whisper lyrics models, e.g. `kelvinbksoh/whisper-small-vietnamese-lyrics-transcription`  
   URL: https://huggingface.co/kelvinbksoh/whisper-small-vietnamese-lyrics-transcription  
   - Trained on 8,000 Vietnamese songs.
   - It is a **transcription** model, not a known-lyrics CTC forced aligner.
   - Language/domain mismatch for English songs.

Relevant arXiv evidence:

- DALI dataset: https://arxiv.org/abs/1906.10606  
  DALI contains 5,358 audio tracks with time-aligned vocal melody notes and lyrics.
- Low-resource audio-to-lyrics alignment: https://arxiv.org/abs/2102.09202  
  Notes long recordings are memory-intensive for single-pass alignment and highlights source separation importance.
- Mandarin lyrics transcription/alignment: https://arxiv.org/abs/2311.12488  
  Fine-tuned Whisper on Mandarin singing and reports strong alignment, but it is research/domain-specific, not a ready English aligner.

### (3) Can it align given known lyrics, not transcribe?

**`ctc-forced-aligner`: yes.** This is its main use case.

CLI from README:

```bash
ctc-forced-aligner \
  --audio_path "path/to/audio.wav" \
  --text_path "path/to/lyrics.txt" \
  --language "eng" \
  --romanize \
  --split_size "word"
```

Python API from README:

```python
from ctc_forced_aligner import (
    load_audio, load_alignment_model, generate_emissions,
    preprocess_text, get_alignments, get_spans, postprocess_results,
)

alignment_model, alignment_tokenizer = load_alignment_model(device)
audio_waveform = load_audio(audio_path, alignment_model.dtype, alignment_model.device)
emissions, stride = generate_emissions(alignment_model, audio_waveform, batch_size=4)
tokens_starred, text_starred = preprocess_text(text, romanize=True, language="eng")
segments, scores, blank_token = get_alignments(emissions, tokens_starred, alignment_tokenizer)
spans = get_spans(tokens_starred, segments, blank_token)
word_timestamps = postprocess_results(text_starred, spans, stride, scores)
```

**WhisperX: partially.** It can align known text if you construct WhisperX-style segment dicts:

```python
segments = [{"start": 0.0, "end": duration, "text": lyrics_text}]
model_a, metadata = whisperx.load_align_model(language_code="en", device=device)
result = whisperx.align(segments, model_a, metadata, audio, device)
```

But this is not a turnkey full-song lyrics mode. GitHub issue #1009 explicitly says known transcript use is tracked elsewhere and suggests constructing segments manually. PR #1284 adds `--text_file`, but it is open and post-processes/matches text rather than providing mature fixed-transcript full-song forced alignment.

Sources:
- WhisperX README: https://github.com/m-bain/whisperX
- WhisperX alignment source: https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py
- Known transcript issue: https://github.com/m-bain/whisperX/issues/1009
- Fixed transcript issue: https://github.com/m-bain/whisperX/issues/1308
- Text-file PR: https://github.com/m-bain/whisperX/pull/1284

### (4) Can we set it up in this repo quickly?

**Yes for `ctc-forced-aligner` and WhisperX; no for STARS in current CPU-only conditions.**

The repo has Python 3.12.10 in `python`, `venv_align`, and `venv_moss`. Both `ctc-forced-aligner` and WhisperX support Python >=3.10. STARS README expects Python 3.10, PyTorch 2.4.0, CUDA 12.8, and repo notes say current STARS integration was blocked by `torch.cuda.is_available() == False` and hardcoded CUDA device construction.

Recommended quick test path:

```bash
cd C:/Users/doner/moss_audio
venv_align/Scripts/python -m pip install "git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git"
```

Then run against the separated vocal stem and known lyrics, preferably resampled to 16 kHz mono if needed:

```bash
venv_align/Scripts/ctc-forced-aligner \
  --audio_path "alignment_engine/stars_full_work/starman_vocal_24k.wav" \
  --text_path "path/to/clean_lyrics.txt" \
  --language "eng" \
  --romanize \
  --split_size "word" \
  --device "cpu" \
  --batch_size 1 \
  --window_size 30 \
  --context_size 2
```

If the console script is not on PATH:

```bash
venv_align/Scripts/python -m ctc_forced_aligner.align \
  --audio_path "..." \
  --text_path "..." \
  --language "eng" \
  --romanize
```

For CUDA machine:

```bash
ctc-forced-aligner --audio_path vocal.wav --text_path lyrics.txt --language eng --romanize --device cuda --compute_dtype float16 --batch_size 8
```

WhisperX setup:

```bash
venv_align/Scripts/python -m pip install whisperx
```

Known-lyrics alignment requires custom Python segment construction. Recommended only after coarse stanza boundaries exist.

### (5) Is it better as a coarse aligner than STARS?

**Operationally in this repo: yes, CTC forced alignment is likely better to try first.**  
**Model-domain-wise: no, STARS is more singing-specific if it can run.**

STARS facts from this repo and README:

- URL/source in repo: `alignment_engine/STARS/README.md`
- License: MIT.
- Purpose-built for singing transcription/alignment/style annotation.
- Inference expects pure vocal audio and metadata with words, phonemes, and `ph2words`.
- Pretrained model checkpoints exist for Chinese and Chinese-English.
- Tested with Python 3.10, PyTorch 2.4.0, CUDA 12.8.
- Current repo result says `STARS_VIABLE = FALSE` because inference hardcodes CUDA and no CUDA is available.

Comparison:

| Criterion | `ctc-forced-aligner` | WhisperX | STARS |
|---|---|---|---|
| Known lyrics input | Yes, primary API | Partial/manual segments | Yes, via word/phoneme metadata |
| Singing-specific training | No for mature/default models | No | Yes |
| Full-song/coarse setup | Good: whole audio + text + chunking | Weak: needs rough segments | More complex: segment metadata, phonemes, CUDA |
| CPU viability | Yes | Yes but slow | No in current repo |
| License | Code/model caveats; default model NC | BSD-2, model licenses vary | MIT |
| Best role | Primary quick coarse aligner candidate | ASR/refinement baseline | Singing-specialized aligner when CUDA available |

**Bottom line:**

- If the goal is **quickly produce plausible coarse/full-song word timings in this repo**, test `ctc-forced-aligner` first.
- If the goal is **best singing-aware forced alignment and a CUDA GPU is available**, STARS should still be evaluated because it is explicitly designed for singing.
- If STARS fails due to CUDA/setup/metadata fragility, `ctc-forced-aligner` is the best off-the-shelf fallback candidate.

---

## Tool/model details and licensing

### 1. MahmoudAshraf97 `ctc-forced-aligner`

- Repo: https://github.com/MahmoudAshraf97/ctc-forced-aligner
- Default model: https://huggingface.co/MahmoudAshraf/mms-300m-1130-forced-aligner
- Install: `pip install git+https://github.com/MahmoudAshraf97/ctc-forced-aligner.git`
- Input: audio path + text path + ISO-639-3 language.
- Output: JSON-like segments with start/end/text.
- Supports `--split_size sentence|word|char`.
- Supports long audio chunking via `--window_size` and `--context_size`.
- License caveat:
  - README says project is BSD, but `pyproject.toml` declares `CC-BY-NC 4.0`; GitHub API shows no detected license file.
  - Default HF model is `cc-by-nc-4.0`.
  - **For commercial use, do not assume the default model is OK. Use/license-check an Apache/BSD/MIT speech model instead.**

### 2. Deskpai `ctc_forced_aligner`

- Repo: https://github.com/deskpai/ctc_forced_aligner
- PyPI: package `ctc_forced_aligner`, version 1.0.2.
- Install:

```bash
pip install ctc_forced_aligner          # ONNX CPU
pip install ctc_forced_aligner[gpu]     # ONNX GPU
pip install ctc_forced_aligner[torch]   # PyTorch
```

- API:

```python
from ctc_forced_aligner import AlignmentTorch
at = AlignmentTorch()
at.generate_srt("audio.mp3", "lyrics.txt", "output.srt", model_type="WAV2VEC2_ASR_LARGE_LV60K_960H")
at.generate_webvtt("audio.mp3", "lyrics.txt", "output.vtt")
```

- Supports Wav2Vec2, VoxPopuli, HuBERT, and MMS_FA models per README.
- License caveat:
  - Includes BSD-2 torchaudio code and MahmoudAshraf code.
  - Deskpai modifications are under DOSL-1.0.
  - Default ONNX weights are based on `MahmoudAshraf/mms-300m-1130-forced-aligner` and are CC-BY-NC 4.0.
  - **Use only after license review.**

### 3. WhisperX

- Repo: https://github.com/m-bain/whisperX
- PyPI: `whisperx`, version 3.8.5.
- License: BSD-2-Clause.
- Install: `pip install whisperx`
- README says it provides word-level timestamps using wav2vec2 alignment.
- Limitations from README:
  - transcript words with chars outside model dictionary cannot be aligned,
  - overlapping speech not handled well,
  - language-specific wav2vec2 model required.
- Singing-specific GitHub issues:
  - Missing words in music can be caused by VAD treating song parts as non-speech: https://github.com/m-bain/whisperX/issues/465
  - User doing song lyrics was advised to isolate vocals with Demucs: https://github.com/m-bain/whisperX/issues/731
  - Known transcript support is not a mature CLI workflow: https://github.com/m-bain/whisperX/issues/1009 and https://github.com/m-bain/whisperX/issues/1308

### 4. `ctc-segmentation`

- Repo: https://github.com/lumaku/ctc-segmentation
- License: Apache-2.0.
- Install: `pip install ctc-segmentation`
- README explicitly says it is not standalone; it needs a neural network with CTC output.
- Useful if we choose a HF Wav2Vec2/HuBERT CTC model and want custom alignment logic.

### 5. Torchaudio CTC forced alignment

- Tutorial/source: https://github.com/pytorch/audio/blob/main/examples/tutorials/forced_alignment_tutorial.py
- License: BSD-2-Clause.
- Important note in current tutorial: APIs described are deprecated in torchaudio 2.8 and removed in 2.9; torchaudio recommends `Wav2Vec2FABundle` / forced-alignment bundle APIs.
- Good building block, but not a singing aligner by itself.

---

## Recommended experiment plan for this repo

1. **Prepare clean input:** separated vocal stem, mono 16 kHz or 24 kHz accepted by loader, clean lyrics text with repeated sections preserved exactly.
2. **Run `ctc-forced-aligner` on the full song** with `--split_size word`, CPU first if no CUDA.
3. **Convert output to existing `timing.json` candidate format** in a scratch file only.
4. **Run existing diagnostics** from `alignment_engine/diagnose_alignment.py` or equivalent quality gates:
   - monotonic timestamps,
   - median word duration not compressed,
   - coverage close to vocal/song duration,
   - no opening-lyrics repetition in later song positions,
   - start/end bounds plausible.
5. **Compare to MERT+DTW and STARS artifacts** using the same diagnostics.
6. If default MMS model fails on singing, try a commercial-safe speech CTC model such as `facebook/wav2vec2-large-960h-lv60-self` or torchaudio `WAV2VEC2_ASR_LARGE_LV60K_960H`; expect speech-domain mismatch but licensing may be simpler than MMS.
7. Do **not** use the obscure singing HF models as primary until tokenizer coverage and language/domain are validated.

---

## Final recommendation

Use **`ctc-forced-aligner` as the first off-the-shelf primary coarse-aligner experiment** for known full-song lyrics. It is the only found option that directly matches “audio + known lyrics -> word timings” with minimal setup.

Do **not** claim it is singing-validated. Treat it as an operational baseline. If it passes repo diagnostics on the Starman vocal stem, it can become the primary coarse aligner. If it fails, the next most credible route is a custom hybrid: vocal separation + self-supervised music/speech embeddings or singing CTC model + CTC segmentation/DTW refinement.

STARS remains the more singing-specialized aligner, but in this repo it is blocked by CUDA and has heavier metadata/phoneme requirements. CTC forced alignment is therefore better to test now for coarse full-song timing, while STARS is better to revisit on a CUDA machine for singing-domain accuracy.
