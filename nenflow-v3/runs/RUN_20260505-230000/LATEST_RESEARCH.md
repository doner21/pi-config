---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260505-230000
context_saturation_estimate: "~14%"
---

## Investigation Scope

All 8 research areas from the INTAKE were investigated:

1. Timestamp ASR output format — confirmed as bracket format [xx.xx]text[yy.yy] via GitHub issue #7
2. Prompt engineering — official prompts from MOSS team GitHub issues #3, #6, #7
3. Word-level timing granularity — 2s markers, 80ms audio token resolution, ~50-200ms realistic precision
4. Parsing strategy — regex-based extraction from concatenated bracket format
5. Model setup prerequisites — nothing installed; full environment build required; CPU-only
6. Karaoke player design — self-contained HTML, dual audio sync, word highlighting via requestAnimationFrame
7. Timing data JSON schema — stanza-preserving word array with start/end float timestamps
8. Audio format — MP3 requires FFmpeg which is NOT installed; pre-convert to WAV recommended

Sources examined:

- MOSS-Audio GitHub repo (README, src/processing_moss_audio.py, infer.py, app.py, hf_inference.py,
  modeling_moss_audio.py, configuration_moss_audio.py, audio_io.py, pyproject.toml,
  moss_audio_usage_guide.md, finetune/FINETUNE.md)
- Hugging Face model pages (MOSS-Audio-4B-Instruct config.json, tokenizer_config.json,
  processor_config.json, chat_template.jinja, README.md)
- GitHub issues #3, #6, #7 — critical: official timestamp ASR prompt and output format from @Benioh
- Local disk: C:/Users/doner/moss_audio/ and moss_audio test/ subdirectory
- System: Windows 11 AMD64, Python 3.12.10, no GPU (nvidia-smi not found), no FFmpeg, no models cached

---

## Key Findings

### Finding 1: Timestamp ASR Output Format (RESEARCH AREA 1 — RESOLVED)

**Source:** GitHub issue #7, comment by Benioh (MOSS team member)

The official timestamp ASR output format uses bracket-delimited segments with centisecond
precision. Segments are concatenated without breaks, forming a continuous string:
```
[0.00]hello there[2.01][2.01]the weather is nice today[4.32][4.32]and so on[6.50]
```

Key properties:
- Format: [start_time]transcript_text[end_time]
- Timestamps: seconds with 2 decimal places (centiseconds)
- No whitespace or newlines between segments
- End time of segment N = start time of segment N+1 (seamless concatenation)
- This is the sentence-level format; word-level logically follows the same pattern

**The model's time-marker mechanism** (from src/processing_moss_audio.py):
- Time markers are injected INTO THE INPUT audio token stream, not generated as output
- Audio tokens flow at 12.5 Hz (every 80ms per token)
- Every 25 audio tokens (2.0 seconds), digit tokens for the current second count are inserted
- Digit token IDs in Qwen3 tokenizer: '0' goes to 15, '1' goes to 16, ..., '9' goes to 24
- The model learns during pretraining to associate audio content with time markers it sees

**Confirming evidence from code:**
- processor_config.json shows enable_time_marker: true as default
- app.py (Gradio) and infer.py both use enable_time_marker=True
- The processor _build_audio_tokens_with_time_markers() method handles injection

### Finding 2: Prompt Engineering for Timestamp ASR (RESEARCH AREA 2 — RESOLVED)

**Source:** GitHub issues #3, #6, #7 — official evaluation prompts from MOSS team

**Official sentence-level timestamp ASR prompt** (verbatim from issue #7, @Benioh):

```
Transcribe the audio into sentence-level timestamps using the format [xx.xx]text[yy.yy], where xx.xx and yy.yy are centisecond precision timestamps rounded to two decimal places. Concatenate consecutive segments without breaks. For example: [0.00]hello there[2.01][2.01]the weather is nice today[4.32]. Do not include any additional content such as explanations, headings, or annotations.
```

**Official speaker-diarization-with-timestamps prompt** (verbatim from issue #6):

```
Transcribe the audio into text. Each sentence should begin with a start timestamp and a speaker label ([S01], [S02], [S03], ...), followed by the corresponding spoken content, and end with an end timestamp to clearly indicate the time span of that sentence.
```

**Plain ASR prompt** (verbatim from issue #3): Transcribe the audio.

**infer.py default:** Describe this audio.

**app.py Gradio defaults:** Describe this audio, Please transcribe this audio, etc.
Note: Gradio app uses enable_time_marker=True by default, so model can reference
injected time markers even with generic prompts.

**RECOMMENDED WORD-LEVEL PROMPTS** (synthesized from official patterns):

**Strategy A — Direct word-level request:**

```
Transcribe the audio into word-level timestamps using the format [xx.xx]word[yy.yy], where xx.xx and yy.yy are centisecond precision timestamps rounded to two decimal places. Output each word separately with its own start and end timestamp. Concatenate consecutive words without breaks. Do not include any additional content such as explanations, headings, or annotations.
```

**Strategy B — Force transcription with known lyrics** (aligns with user terminology):

```
Here are the lyrics:
[FULL LYRICS TEXT]

Transcribe the audio and align each word to its exact timestamp using the format [xx.xx]word[yy.yy], where xx.xx and yy.yy are centisecond precision timestamps rounded to two decimal places. Concatenate consecutive words without breaks. Do not include any additional content such as explanations, headings, or annotations.
```

Strategy B is recommended as primary — it addresses the user's force transcription language
and reduces ASR errors on singing audio by constraining vocabulary to known lyrics.

**Hypothetical expected output** (for Strategy A on 'Hey now, now / Goodbye, love'):

```
[0.00]Hey[0.52][0.52]now[1.03][1.03]now[1.89][1.89]Goodbye[2.54][2.54]love[3.21]
```

### Finding 3: Word-Level Timing Granularity (RESEARCH AREA 3 — PARTIALLY RESOLVED)

**Quantitative breakdown from source code and configs:**

| Component | Resolution |
|---|---|
| Mel spectrogram hop | 10ms per frame (hop_length=160 at 16kHz) |
| After 3x conv2d stride-2 | 80ms per audio token (12.5 Hz) |
| Time marker interval | Every 2 seconds (every 25 audio tokens) |
| Model claimed precision | Centisecond / 0.01s (per prompt format) |
| Audio tokens for 257.3s audio | ~3,216 tokens |
| Time markers inserted | ~128 markers (one per 2s) |
| Extra digit tokens from markers | ~331 tokens (digits for seconds 2, 4, ..., 256) |

**Analysis:**

- Raw temporal resolution of the audio encoder is 80ms per token — model cannot
  perceive events finer than 80ms
- Time markers are separated by 2000ms (2 seconds). The model must INTERPOLATE
  between markers to produce sub-2-second timings
- README states: 'Supports both word-level and sentence-level timestamp alignment'
  — confirming word-level is a trained capability
- Evaluation: MOSS-Audio-8B-Instruct achieves AAS 35.77 on AISHELL-1 and 131.61
  on LibriSpeech, dramatically outperforming Qwen3-Omni (833.66)
- The centisecond precision claim (0.01s) exceeds encoder resolution (0.08s) —
  the model likely interpolates within 2-second windows based on audio content
- **Realistic expected precision: 50-200ms** for word boundaries in practice

**Risk:** Timestamp ASR was evaluated on speech (AISHELL-1 Chinese, LibriSpeech
English). Singing voice (David Bowie) is a different domain. The model ranks #1
on singing ASR (CER 9.81 for 8B, 10.79 for 4B) which is promising, but timestamp
alignment accuracy on singing is completely untested.

### Finding 4: Parsing Strategy (RESEARCH AREA 4 — RESOLVED)

Given the output format [xx.xx]text[yy.yy], parsing is straightforward:

**Regex:** `\[(\d+\.\d+)\]([^\[]+)\[(\d+\.\d+)\]`

**Python parsing approach:**

```python
import re, json

output = '[0.00]Hey now[1.52][1.52]now[2.03][2.03]Goodbye[3.21]...'

# Extract all [start]text[end] segments
pattern = r'\[(\d+\.\d+)\]([^\[]+)\[(\d+\.\d+)\]'
matches = re.findall(pattern, output)

words = []
for start, text, end in matches:
    # Handle multi-word segments: split and distribute time proportionally
    subwords = text.strip().split()
    if len(subwords) == 1:
        words.append({"word": subwords[0], "start": float(start), "end": float(end)})
    else:
        duration = float(end) - float(start)
        per_word = duration / len(subwords)
        for i, w in enumerate(subwords):
            words.append({
                "word": w,
                "start": float(start) + i * per_word,
                "end": float(start) + (i + 1) * per_word
            })
```

**Edge cases to handle:**
- Model may output text before/after timestamp segments (guard against this)
- Malformed or missing timestamps (log and optionally ignore)
- Multi-word segments: split and distribute time proportionally (shown above)
- Validation: end time of word N should roughly equal start time of word N+1
- Model might output sentence-level timestamps even when asked for word-level
  — the parser handles both by splitting multi-word segments

### Finding 5: Model Setup Prerequisites (RESEARCH AREA 5 — CRITICAL)

**Current state — NOTHING is installed:**

| Requirement | Status | Details |
|---|---|---|
| Python 3.12 | PRESENT | 3.12.10 (compatible) |
| CUDA GPU | ABSENT | nvidia-smi not found; CPU-only |
| torch 2.9.1 | ABSENT | Available: torch-2.9.1-cp312-cp312-win_amd64.whl from PyPI |
| torchaudio 2.9.1 | ABSENT | Available from PyPI |
| transformers 4.57.1 | ABSENT | Required by MOSS Audio |
| MOSS-Audio model | ABSENT | 4B-Instruct = ~4.5GB download |
| FFmpeg | ABSENT | Required for MP3 decoding in torchaudio |
| HuggingFace cache | EMPTY | Only Systran/faster-whisper-base.en cached |
| conda env moss-audio | ABSENT | No conda environments exist |
| numpy | PRESENT | 2.4.4 |
| scipy | PRESENT | 1.17.1 |

**Model choice for CPU — only one viable option:**

- MOSS-Audio-4B-Instruct (~4.6B params, ~4.5GB download) — RECOMMENDED, only viable for CPU
- MOSS-Audio-4B-Thinking — chain-of-thought adds overhead, slower
- MOSS-Audio-8B-Instruct (~8.6B params, ~8-9GB download) — too large for CPU
- MOSS-Audio-8B-Thinking — same size plus CoT overhead

**CPU inference estimate for 257.3s audio:**

- ~3,216 audio tokens + ~331 time marker tokens + ~50 chat template tokens = ~3,600 input tokens
- 4.6B model on CPU: expect 30-60 minutes for single inference
- Generation length: word-level output for ~300 words could be 500-2,000 output tokens
- Memory: ~9-10GB RAM for 4B model in fp32 (less if bf16 works on CPU)

**Windows-specific concern from pyproject.toml:**

The [torch-runtime] extras define torch only for Linux (cu128) and macOS (darwin).
Windows is NOT listed. However, PyPI has Windows builds of torch 2.9.1.
For CPU, use: pip install torch==2.9.1 torchaudio==2.9.1

### Finding 6: Karaoke Player Design (RESEARCH AREA 6 — RESOLVED)

**Architecture: Single self-contained HTML file**

Player layout:
- Top: Title bar (song/artist)
- Control bar: Play/Pause button, seek bar with time display
- Volume section: Two sliders for band and vocal stems, independently adjustable
- Lyrics area: Stanza-by-stanza display with word highlighting
- Footer: Generation metadata

**Technical approach per feature:**

| Feature | Implementation |
|---|---|
| Audio playback | Two <audio> elements, one per stem |
| Synchronization | Shared play/pause/seek controls update both simultaneously |
| Word highlighting | requestAnimationFrame reading vocal audio currentTime, comparing against timing JSON |
| Volume control | Each slider sets audioElement.volume (0.0-1.0) independently |
| Seek bar | input type=range with max=duration; onchange sets currentTime on both |
| Timing data loading | fetch('timing.json') at page load |
| Lyrics display | div with span per word; active word gets .highlight CSS |
| Stanza navigation | Auto-advance when all words in current stanza done |

**Key implementation details:**

- Vocal stem audio element acts as master for timing reference
- requestAnimationFrame preferred over setInterval for smooth highlighting
- Binary search through timing array for O(log n) word lookup per frame
- Volume sliders persist state independently per stem
- Seek scrubs both audio elements to same position
- Play/pause toggles both elements
- CSS: dark theme, karaoke-style fill animation on active word, smooth transitions

**Web Audio API vs simple audio elements:**
For this verification prototype, simple audio elements with .volume are sufficient
and simpler. The Web Audio API (AudioContext, MediaElementAudioSourceNode, GainNode)
adds complexity. Only upgrade if sync drift between elements becomes noticeable.

### Finding 7: Timing Data Format (RESEARCH AREA 7 — RESOLVED)

**Recommended JSON schema (stanza-preserving):**

```json
{
  "metadata": {
    "song": "Starman",
    "artist": "David Bowie",
    "duration_s": 257.3,
    "generated_by": "MOSS-Audio-4B-Instruct",
    "generated_at": "2026-05-05T23:00:00Z"
  },
  "stanzas": [
    {
      "index": 0,
      "label": "Intro",
      "words": [
        {"word": "Hey", "start": 0.00, "end": 0.52, "index": 0},
        {"word": "now", "start": 0.52, "end": 1.03, "index": 1},
        {"word": "now", "start": 1.03, "end": 1.89, "index": 2},
        {"word": "Goodbye", "start": 1.89, "end": 2.54, "index": 3},
        {"word": "love", "start": 2.54, "end": 3.21, "index": 4}
      ]
    }
  ]
}
```

Design rationale:
- stanzas array preserves blank-line structure from original lyrics file
- Each word has start and end in floating-point seconds
- index is global word position (0-based across all stanzas)
- label is optional human-readable stanza name
- metadata records provenance for verification

**Stanza structure from actual lyrics file** (10 stanzas, ~300 words):

| Stanza | Type | Approx words |
|---|---|---|
| 0 | Intro (2 lines) | ~5 |
| 1 | Verse 1 (6 lines) | ~35 |
| 2 | Chorus (6 lines) | ~40 |
| 3 | Bridge (4 lines) | ~15 |
| 4 | Verse 2 (6 lines) | ~40 |
| 5 | Chorus (6 lines) | ~40 |
| 6 | Bridge (4 lines) | ~15 |
| 7 | Chorus/Outro (6 lines) | ~40 |
| 8 | Bridge (4 lines) | ~15 |
| 9 | La la la Outro (12 lines) | ~60 |

### Finding 8: Audio Format Considerations (RESEARCH AREA 8 — RESOLVED)

**Audio file details:**

| Property | Value |
|---|---|
| Vocal file | David Bowie - Starman[4K] (Vocal).mp3 |
| Band file | David Bowie - Starman[4K] (Band).mp3 |
| Size (both) | 10,293,289 bytes (9.81 MB) each |
| Duration | 257.3 seconds (4:17) |
| Bitrate | 320 kbps |
| Sample rate | 44,100 Hz |

Both files are identical in size — confirming they are stereo stems from the same source.

**torchaudio MP3 support:**

- src/audio_io.py uses torchaudio.load(path) which requires FFmpeg backend for MP3
- torchaudio backends: FFmpeg (supports MP3), SoX (limited), SoundFile (WAV/FLAC)
- After loading, audio is downmixed to mono and resampled to 16kHz
- Optional torchcodec package might provide MP3 support without FFmpeg (untested on Windows)

**Resolution options:**

| Option | Method | Reliability |
|---|---|---|
| A | Install FFmpeg via conda | Highest (matches MOSS Audio docs) |
| B | Pre-convert MP3 to WAV externally | High |
| C | Use torchcodec package | Untested on Windows |
| D | scipy + manual MP3 decode | Low |

**Recommendation: Option A** — install FFmpeg as part of conda setup.

**Filename warnings:**
- Spaces and brackets in filenames require careful shell quoting
- Lyrics file starman has no extension — code must not assume .txt

**Browser playback:** MP3 universally supported. HTML player can reference files directly.

---

## Constraints Identified

### Hard constraints (confirmed or newly discovered):

1. **CPU-only inference** — no GPU available. 4B-Instruct is the only viable model. Expect 30-60 min inference for 257s audio.
2. **No FFmpeg on system** — must install via conda or pre-convert MP3 to WAV.
3. **Windows platform** — not listed in pyproject.toml torch-runtime extras. Use standard torch from PyPI.
4. **~10GB RAM needed** — 4.6B model in fp32. System needs 16GB+ RAM total.
5. **No existing MOSS Audio environment** — full setup: conda, packages, model download (~4.5GB), FFmpeg.
6. **Model requires internet download** — ~4.5GB from Hugging Face. Stable connection needed.
7. **Path with space** — moss_audio test/ directory needs careful quoting in all commands.
8. **Brackets in filenames** — [4K] in audio filenames requires shell quoting.
9. **Lyrics file has no extension** — starman not starman.txt. Code must handle this.
10. **Source files INVARIANT** — must not modify or delete MP3 files or lyrics file.

### Soft constraints (recommendations):

1. Prefer 4B Instruct over 4B Thinking — faster, no chain-of-thought overhead.
2. Use temperature=0.0 and do_sample=False for deterministic timestamp output.
3. Pre-convert MP3 to WAV as safety net for FFmpeg installation issues.
4. Validate pipeline with 5-10 second test clip before full 257s run.

---

## Existing Patterns

### MOSS-Audio codebase patterns:

- **Processor:** MossAudioProcessor wraps Qwen3 tokenizer; handles audio token injection,
  time marker insertion, mel spectrogram extraction
- **Model:** MossAudioModel extends Qwen3ForCausalLM with MOSS-Audio-Encoder +
  DeepStack cross-layer injection (from encoder layers 8, 16, 24 into LLM)
- **Inference flow:** load_audio() => processor(text, audios) => model.generate() =>
  processor.decode()
- **Audio processing:** WhisperFeatureExtractor mel => 3x conv2d stride-2 =>
  transformer encoder (32 layers) => projection => LLM embedding space
- **Time markers:** Injected every 2s between audio token groups; digits 0-9 map to
  token IDs 15-24 in Qwen3 tokenizer
- **Chat format:** Qwen3 <|im_start|>system/user/assistant<|im_end|> with
  <|audio_bos|>...<|audio_eos|> placeholders

### Lyrics file structure:

10 stanzas separated by blank lines. Plain text, no extension. Contains punctuation
(commas, semicolons, quotes). Final stanzas are 'La, la, la' patterns with hyphens.
Approximately 300 words total across 58 lines.

---

## Recommendations

### For the Planner:

1. **Model: MOSS-Audio-4B-Instruct** — only viable option for CPU. Download size ~4.5GB.
2. **Two-phase approach:** (A) Environment + model setup, (B) Transcription run + player build.
   The player can be built in parallel with Phase A using mock timing data.
3. **Prompt: Strategy B** (known lyrics force transcription) as primary. Strategy A as fallback.
4. **FFmpeg:** Install via conda. Documented in MOSS Audio README: conda install -c conda-forge ffmpeg=7
5. **Safety net:** Pre-convert MP3 to WAV (trivial, ~20MB per file) to decouple from FFmpeg.
6. **Player:** Self-contained HTML, simple audio elements, can be built independently with mock data.
7. **JSON schema:** Stanza-preserving format recommended for respecting lyric structure.
8. **Validate first:** Run 5-10 second test before full 257s audio to confirm format and pipeline.
9. **Set user expectations:** Warn that CPU inference will take 30-60 minutes, possibly more.
10. **Verify conda availability** as a prerequisite step — conda may not be installed on this machine.

### For Force Transcription clarification:

The user's phrase 'force transcription properties' most likely means: providing known
lyrics as reference so the model constrains its output to match those words while
determining timestamps. This is NOT an official MOSS Audio feature name. It aligns
with Strategy B prompt (known lyrics + timestamp request). The Planner should confirm
this interpretation with the user per INTAKE clarification question #2.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CPU inference too slow (60+ min) | High | Delays project | Warn user upfront; suggest overnight run |
| Model outputs wrong format | Medium | Parsing fails | Fallback prompts; robust regex + error handling |
| Word timestamps on singing inaccurate | Medium-High | Karaoke highlight misaligned | Verification tool framing accepts imperfection |
| OOM on CPU with 4.6B model | Low-Medium | Cannot run inference | Check RAM before starting; consider offloading |
| FFmpeg install fails | Low | Cannot load MP3 | Pre-convert to WAV as workaround |
| HuggingFace download fails | Low-Medium | Cannot get model | Use hf download --resume; try HF mirrors |
| conda not installed | Medium | Cannot create env easily | Use pip + venv as fallback |
| Path issues from spaces/brackets | Medium | File not found errors | Careful quoting; copy files to simpler paths if needed |

---

## Unknowns Remaining

Areas not fully resolved that the Planner should be aware of:

1. **Word-level timestamp output not confirmed by example.** The bracket format is
   inferred from sentence-level documentation. No actual word-level MOSS Audio output
   example exists in any public documentation. The Executor must validate this.

2. **Force transcription is not official MOSS Audio terminology.** The user's intent
   needs clarification (INTAKE question #2). May mean something different than
   providing known lyrics.

3. **Timestamp accuracy on singing voice is untested.** MOSS Audio was evaluated on
   speech timestamps (AISHELL-1, LibriSpeech). Singing voice timing alignment has no
   published evaluation.

4. **CPU memory usage for 257s audio.** Exact RAM requirements for 3,600+ input tokens
   plus KV cache during prefill are not precisely known. Should be verified before
   starting the full run.

5. **Model files elsewhere on user machine.** Only default HuggingFace cache was
   checked. The user might have the model in a custom location.

6. **Conda availability not confirmed.** conda env list produced no output (not even
   an error), suggesting conda may not be installed or not in PATH. The PLAN must
   verify conda as a prerequisite step. If conda is unavailable, a pip + venv approach
   would need to be designed.

7. **torchcodec as FFmpeg alternative.** Listed in pyproject.toml optional deps
   (torchcodec==0.9.*). Might provide MP3 decoding on Windows without FFmpeg.
   Not investigated in depth.

8. **Whether generic prompts (like 'Describe this audio.') with enable_time_marker=True
   produce any timestamp information.** The timestamps are injected into input only.
   If the prompt does not explicitly ask for timestamps, the model may or may not
   reference them in its output. The Gradio app's generic examples may not be testing
   timestamp ASR at all.

9. **Whether the model can handle the full 4:17 audio in a single inference pass.**
   The encoder config max_source_positions=1500 limits encoder positions. At 12.5 Hz,
   1500 tokens = 120 seconds. For 257s audio (3,216 tokens), the encoder would need
   to handle 3,216 positions. This may EXCEED the max_source_positions limit, causing
   either truncation or an error. The PLAN must investigate this constraint further.
   The audio may need to be processed in segments and results merged.
