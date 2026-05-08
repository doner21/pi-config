---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260505-230000
context_saturation_estimate: "~18%"
---

[PLANNER CONTEXT — START]
self_estimate: ~18%
health: HEALTHY
[PLANNER CONTEXT — END]

## Task Statement

Build a local karaoke verification prototype that uses MOSS-Audio-4B-Instruct (Strategy B force-transcription with known lyrics) to extract word-level timestamps from a 257s David Bowie "Starman" vocal stem, stores them in a stanza-preserving JSON with syllable breakdowns, and renders them in a single self-contained HTML karaoke player with syllable-level progressive highlighting, dual-stem audio, independent volume sliders, and a seek bar.

---

## Invariants

Carried forward from INTAKE and extended from codebase inspection:

- **Source files immutable:** `moss_audio test/David Bowie - Starman[4K] (Vocal).mp3`, `moss_audio test/David Bowie - Starman[4K] (Band).mp3`, and `moss_audio test/starman` must NOT be modified or deleted
- **Model API only:** MOSS Audio must be accessed via its documented `MossAudioModel` + `MossAudioProcessor` API with `enable_time_marker=True`
- **Timestamps from model output:** No fabricated or hand-aligned timestamps; all timing data must originate from MOSS Audio inference
- **CPU-only inference:** No GPU available; model must run in CPU mode (`torch device="cpu"`)
- **Working directory:** All scripts, outputs, and artifacts created in `C:/Users/doner/moss_audio/`
- **Model provenance:** MOSS-Audio-4B-Instruct from `moss-music/MOSS-Audio-4B-Instruct` on HuggingFace
- **Player synchronisation:** Audio element `.currentTime` as timing source for highlight rendering, not separate timers
- **Syllable highlighting real:** Syllable-level fill must be driven by actual audio progress within each word time window, not pre-computed animation
- **No cloud services:** Everything runs locally

---

## Success Criteria

1. **SC1-Environment:** Python venv `moss_audio/venv_moss/` created with torch 2.9.1 (CPU), torchaudio 2.9.1, transformers >=4.57.1, MOSS-Audio installed from source, and a working FFmpeg binary accessible to Python
2. **SC2-Model-Load:** `MossAudioModel.from_pretrained("moss-music/MOSS-Audio-4B-Instruct")` loads successfully on CPU without OOM; `MossAudioProcessor` instantiates with `enable_time_marker=True`
3. **SC3-MP3-Load:** Vocal MP3 loads successfully via torchaudio (FFmpeg backend) or pre-converted WAV, producing a mono 16kHz tensor
4. **SC4-Segmentation:** Audio is split into <=120s segments (3 chunks of ~90s with 5s overlap) respecting `max_source_positions=1500`; each segment processed independently and timestamps merged with correct offsets
5. **SC5-Timestamp-Output:** MOSS Audio produces timestamped output containing bracketed `[xx.xx]word[yy.yy]` segments for the vocal audio; output is parseable by regex `\[(\d+\.\d+)\]([^\[]+)\[(\d+\.\d+)\]`
6. **SC6-JSON-Generated:** `moss_audio/karaoke_player/timing.json` exists with valid JSON containing `metadata`, `stanzas` array (10 stanzas), each stanza with `words` array, each word with `word`, `start`, `end`, `index`, and `syllables` array with sub-timing
7. **SC7-Player-Loads:** Opening `karaoke_player/karaoke.html` in a browser loads both MP3 stems, the timing JSON, and displays all lyrics rendered as clickable word spans
8. **SC8-Sync-Playback:** Pressing play starts both audio stems synchronously; word highlighting progresses through words as audio plays
9. **SC9-Syllable-Highlight:** Within each active word span, a CSS fill animation progresses syllable-by-syllable (for a 3-syllable word spanning 0.6s, the fill bar advances through three sub-segments at the word position)
10. **SC10-Volume-Sliders:** Two independent range sliders control vocal and band volume respectively (0.0-1.0), each modifying its respective `<audio>` element's `.volume`
11. **SC11-Seek-Bar:** A seek bar shows current playback position and total duration; dragging it sets `currentTime` on both audio elements and updates word highlighting to the new position
12. **SC12-Integration:** Full end-to-end run: start with raw MP3 + lyrics, run transcription pipeline, open player HTML, verify that word highlights align with audible vocal syllables across the full song

---

## Implementation Steps

### Phase A — Environment Setup

**A1. Create and activate Python virtual environment:**
```
cd C:/Users/doner/moss_audio
python -m venv venv_moss
```
Activate with: `venv_moss\Scripts\activate` (Windows cmd) or `source venv_moss/Scripts/activate` (Git Bash / MSYS2).

**A2. Install CPU PyTorch ecosystem:**
```
pip install torch==2.9.1 torchaudio==2.9.1 --index-url https://download.pytorch.org/whl/cpu
```
Verify: `python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available())"` — must print `2.9.1` and `CUDA: False`.

**A3. Install transformers and HuggingFace tooling:**
```
pip install "transformers>=4.57.1" huggingface_hub
```

**A4. Clone MOSS-Audio and install from source:**
```
git clone https://github.com/OpenMOSS/MOSS-Audio.git
cd MOSS-Audio
pip install -e .
cd ..
```
Verify import:
```
python -c "import sys; sys.path.insert(0,'MOSS-Audio/src'); from modeling_moss_audio import MossAudioModel; print('MossAudioModel imported OK')"
```

**A5. Install FFmpeg via imageio-ffmpeg (no system install needed):**
```
pip install imageio-ffmpeg
```
Verify and configure torchaudio backend:
```
python -c "
import os, imageio_ffmpeg
ffmpeg_dir = os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
os.environ['PATH'] = ffmpeg_dir + os.pathsep + os.environ.get('PATH','')
import torchaudio
backends = torchaudio.list_audio_backends()
print('Available backends:', backends)
"
```
If FFmpeg backend is not listed, use the **WAV fallback** (Step A6).

**A6. WAV fallback conversion (if FFmpeg backend unavailable):**
Install pydub (wraps ffmpeg):
```
pip install pydub
```
Write and run `C:/Users/doner/moss_audio/convert_mp3_to_wav.py`:
```python
import os, imageio_ffmpeg
from pydub import AudioSegment
AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()

test_dir = os.path.join(os.path.dirname(__file__), "moss_audio test")
for stem in ["Vocal", "Band"]:
    fname = f"David Bowie - Starman[4K] ({stem}).mp3"
    mp3_path = os.path.join(test_dir, fname)
    audio = AudioSegment.from_mp3(mp3_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    wav_path = os.path.join(test_dir, f"starman_{stem.lower()}_16k.wav")
    audio.export(wav_path, format="wav")
    print(f"Created {wav_path}  ({len(audio)/1000:.1f}s)")
```
If pydub cannot use imageio-ffmpeg binary, download standalone ffmpeg.exe:
URL: `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip`
Extract `ffmpeg.exe` to `C:/Users/doner/moss_audio/` and set `AudioSegment.converter = "C:/Users/doner/moss_audio/ffmpeg.exe"`.

**A7. Download MOSS-Audio-4B-Instruct model (~4.5GB):**
```
python -c "
from huggingface_hub import snapshot_download
snapshot_download('moss-music/MOSS-Audio-4B-Instruct', local_dir='models/MOSS-Audio-4B-Instruct')
"
```
If this fails with 401 (authentication required), run `huggingface-cli login` first (user needs a free HF account and access token). Estimated download: 5-15 min.
Verify:
```
python -c "from transformers import AutoConfig; c = AutoConfig.from_pretrained('models/MOSS-Audio-4B-Instruct', trust_remote_code=True); print('Config OK, max_source_positions:', c.audio_encoder_config.get('max_source_positions', 1500))"
```

**A8. Confirm encoder limit and determine segmentation:**
```
python -c "
from transformers import AutoConfig
config = AutoConfig.from_pretrained('models/MOSS-Audio-4B-Instruct', trust_remote_code=True)
msl = config.audio_encoder_config.get('max_source_positions', 1500)
print(f'Encoder max_source_positions: {msl}')
print(f'Max audio duration at 12.5 Hz: {msl * 0.08:.1f}s')
print(f'Track duration: 257.3s -> need ~3 segments')
"
```
Expected: msl=1500, max_dur=120s. Use 3 segments: **[0-90s], [85-175s], [170-257.3s]** with 5s overlap.

---

### Phase B — Transcription Pipeline

**B1. Create pipeline script at `C:/Users/doner/moss_audio/transcribe_starman.py`:**

The script implements 12 functions. Key specifications:

**Imports and paths:**
```python
import re, json, os, sys, time
import torch, numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'MOSS-Audio', 'src'))
from modeling_moss_audio import MossAudioModel
from processing_moss_audio import MossAudioProcessor

TEST_DIR = os.path.join(os.path.dirname(__file__), 'moss_audio test')
LYRICS_PATH = os.path.join(TEST_DIR, 'starman')
VOCAL_MP3 = os.path.join(TEST_DIR, 'David Bowie - Starman[4K] (Vocal).mp3')
VOCAL_WAV = os.path.join(TEST_DIR, 'starman_vocal_16k.wav')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'MOSS-Audio-4B-Instruct')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'karaoke_player')
OUTPUT_JSON = os.path.join(OUTPUT_DIR, 'timing.json')
TRACK_DURATION = 257.3
SAMPLE_RATE = 16000
```

**Function 1 — load_model(model_path):**
```python
model = MossAudioModel.from_pretrained(model_path, torch_dtype=torch.float32,
    device_map="cpu", trust_remote_code=True)
model.eval()
processor = MossAudioProcessor.from_pretrained(model_path, enable_time_marker=True,
    trust_remote_code=True)
return model, processor
```

**Function 2 — load_audio(filepath_or_mp3, fallback_wav=None):**
Try `torchaudio.load(filepath)` first. On failure, try `torchaudio.load(fallback_wav)`.
Downmix to mono with `.mean(dim=0, keepdim=True)`. Resample to 16kHz with `torchaudio.functional.resample`.
Return 1D tensor via `.squeeze(0)`.

**Function 3 — load_lyrics(lyrics_path):**
Read text file, split by blank lines (double newline). Assign labels:
`["Intro", "Verse 1", "Chorus", "Bridge", "Verse 2", "Chorus", "Bridge", "Chorus/Outro", "Bridge", "La La La Outro"]`.
For each stanza, extract words from lines (split on whitespace, preserve punctuation).
Return list of `{index, label, lines, words}` dicts.

**Function 4 — segment_audio(waveform, sample_rate, max_duration_s=90, overlap_s=5):**
Compute boundaries: start at 0, advance by `max_duration_s - overlap_s`.
Return list of `(segment_tensor, start_time_s, end_time_s)`.
For 257.3s audio: 3 segments covering [0-90], [85-175], [170-257.3].

**Function 5 — build_prompt(stanzas):**
Assemble Strategy B force-transcription prompt:
```
Here are the lyrics:

{FULL_LYRICS_TEXT}

Transcribe the audio and align each word to its exact timestamp using the format [xx.xx]word[yy.yy], where xx.xx and yy.yy are centisecond precision timestamps rounded to two decimal places. Output each word separately with its own start and end timestamp. Concatenate consecutive words without breaks. Do not include any additional content such as explanations, headings, or annotations.
```
Provide ALL lyrics (not just per-segment) — the model will only timestamp what it hears.

**Function 6 — run_inference(model, processor, waveform_1d, prompt):**
```python
inputs = processor(text=prompt, audios=waveform_1d, sampling_rate=SAMPLE_RATE, return_tensors="pt")
inputs = {k: v.to("cpu") if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
with torch.no_grad():
    output_ids = model.generate(**inputs, max_new_tokens=2000, do_sample=False,
        temperature=0.0, pad_token_id=processor.tokenizer.pad_token_id)
input_len = inputs["input_ids"].shape[1]
generated_ids = output_ids[0][input_len:]
raw_output = processor.decode(generated_ids, skip_special_tokens=True)
return raw_output
```

**Function 7 — parse_timestamps(raw_output, segment_start_offset=0.0):**
Regex: `r'\[(\d+\.\d+)\]([^\[]+)\[(\d+\.\d+)\]'`
For each match, offset start/end by `segment_start_offset`.
For multi-word segments: split text, distribute duration proportionally.
Validate: reject words where `end <= start` or `start < 0`.
Return list of `{word, start, end}` dicts sorted by start time.

**Function 8 — merge_segment_results(all_segment_words, overlap_s=5):**
Concatenate words from all segments. For overlap regions (word start within `overlap_s/2` of previous segment boundary), keep the word from the segment where the word is farthest from the boundary. Final dedup: remove words within 0.05s of previous word.

**Function 9 — count_syllables(word):**
```python
cleaned = word.strip(",.!?;:'\"()[]").lower()
vowels = re.findall(r'[aeiouy]+', cleaned)
count = max(1, len(vowels))
if cleaned.endswith('e') and count > 1 and not cleaned.endswith('le'):
    count -= 1
    count = max(1, count)
return count
```

**Function 10 — split_word_into_syllable_strings(word, count):**
Equal-length character split: syllable i gets chars `[i*n/count, (i+1)*n/count]`.

**Function 11 — build_timing_json(merged_words, stanzas, audio_duration):**
Walk through `merged_words` and match to stanza word sequences (case-insensitive, strip punctuation).
For each matched word, add syllable array with interpolated timing:
  - For N syllables in word [start, end]: syllable i gets [start + i*(end-start)/N, start + (i+1)*(end-start)/N]
  - Round to 3 decimal places
Build output JSON with `metadata` and `stanzas` sections.
Write to `OUTPUT_JSON`.

**Function 12 — main():**
Orchestrates: load model -> load lyrics -> load audio -> segment -> for each segment: run_inference + parse_timestamps -> merge -> build_timing_json -> validate.

**B2. Run the pipeline:**
```
cd C:/Users/doner/moss_audio
source venv_moss/Scripts/activate
python transcribe_starman.py
```
Expected runtime: 90-180 minutes (3 segments x 30-60 min CPU inference each).
Output: `karaoke_player/timing.json` (~300 words with syllable breakdown, ~15-20KB).

**B3. Validate timing.json:**
```python
import json
with open("karaoke_player/timing.json") as f:
    data = json.load(f)
print(f"Stanzas: {len(data['stanzas'])}")
total = sum(len(s['words']) for s in data['stanzas'])
print(f"Total words: {total}")
print(f"Duration: {data['metadata']['duration_s']}s")
# Check last word
for s in reversed(data['stanzas']):
    if s['words']:
        last = s['words'][-1]
        print(f"Last word: {last['word']} ends at {last['end']}s")
        assert last['end'] <= data['metadata']['duration_s'] + 1.0
        break
# Check syllables
for stanza in data['stanzas']:
    for w in stanza['words']:
        assert len(w['syllables']) >= 1
        assert w['syllables'][0]['start'] >= w['start'] - 0.01
        assert w['syllables'][-1]['end'] <= w['end'] + 0.01
print("VALIDATION PASSED")
```

---

### Phase C — Karaoke Player

**C1. Create output directory:**
```
mkdir C:/Users/doner/moss_audio/karaoke_player
```

**C2. Write `C:/Users/doner/moss_audio/karaoke_player/karaoke.html`:**

A single self-contained HTML file with the following architecture:

**DOM Structure:**
- `<div id="app">` — root container with dark theme
- `<header id="title-bar">` — "Starman — David Bowie (MOSS Audio Verification)"
- `<div id="controls">` — play/pause button, seek range input, time display
- `<div id="volume-controls">` — vocal slider, band slider (both `<input type="range">`)
- `<div id="lyrics-area">` — stanza `<div>` blocks populated from timing.json
- `<footer id="metadata-footer">` — generation timestamp and model info
- `<audio id="audio-vocal" preload="auto">` — vocal stem
- `<audio id="audio-band" preload="auto">` — band stem

**Audio source configuration:**
```javascript
const VOCAL_SRC = "../moss_audio test/David Bowie - Starman[4K] (Vocal).mp3";
const BAND_SRC  = "../moss_audio test/David Bowie - Starman[4K] (Band).mp3";
```

**Initialization flow:**
1. `fetch("timing.json")` — load timing data
2. Build flat `allWords` array from all stanzas (each word gets `.stanzaIndex` added)
3. Set `vocalAudio.src` and `bandAudio.src`
4. Set `seekBar.max = timingData.metadata.duration_s`
5. Call `renderLyrics()` to build DOM
6. Call `bindEvents()` to wire up controls
7. Start `requestAnimationFrame(updateHighlight)` loop

**Lyrics rendering (renderLyrics):**
For each stanza: create `<div class="stanza">` with `data-stanza-index`.
For each word: create `<span class="word">` with `data-word-index`, `data-start`, `data-end`. Text content = `word.word`. Append space after each word span.

**Syllable-level highlight mechanism (updateHighlight callback):**
1. Read `currentTime = vocalAudio.currentTime`
2. Binary search `allWords` for word where `currentTime >= start && currentTime < end`
3. On active word change: remove `.active` from previous, add `.active` to new, mark words with `end <= currentTime` as `.done`
4. For active word, compute syllable progress:
```javascript
const word = allWords[activeWordIndex];
const syls = word.syllables;
let sylIdx = 0, sylProgress = 0.0;
for (let si = 0; si < syls.length; si++) {
    if (currentTime >= syls[si].start && currentTime < syls[si].end) {
        sylIdx = si;
        sylProgress = (currentTime - syls[si].start) / (syls[si].end - syls[si].start);
        break;
    }
    if (currentTime >= syls[si].end && si === syls.length - 1) {
        sylIdx = si; sylProgress = 1.0;
    }
}
const fillPercent = ((sylIdx + sylProgress) / syls.length) * 100;
activeWordEl.style.setProperty('--word-fill', fillPercent + '%');
```
5. Update seek bar: `seekBar.value = currentTime`
6. Update time display: `MM:SS / MM:SS`
7. `requestAnimationFrame(updateHighlight)` — loop continues

**Audio controls (bindEvents):**
- **Play/Pause toggle:** If playing, pause both audio elements and set `isPlaying=false`. If paused, sync `bandAudio.currentTime = vocalAudio.currentTime`, then play both.
- **Seek:** `vocalAudio.currentTime = bandAudio.currentTime = parseFloat(seekBar.value)`
- **Volume sliders:** `vocalAudio.volume = vocalVolume.value` (independent), `bandAudio.volume = bandVolume.value` (independent)
- **On ended:** Reset play button, seek bar to 0
- **On play/pause events:** Update `isPlaying` state and button text (▶ / ⏸)

**Key CSS rules for syllable-level fill:**
```css
:root {
    --bg: #1a1a2e;
    --text: rgba(255,255,255,0.9);
    --fill-start: #ff6b6b;
    --fill-end: #ffd93d;
    --done-color: #4ecdc4;
}
body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; }
.word {
    position: relative; display: inline-block;
    padding: 2px 4px; margin: 0 2px; border-radius: 3px;
    color: rgba(255,255,255,0.35); overflow: hidden; z-index: 0;
    transition: color 0.12s ease;
}
.word::before {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0;
    width: var(--word-fill, 0%);
    background: linear-gradient(90deg, var(--fill-start), var(--fill-end));
    opacity: 0.45; z-index: -1; transition: width 0.04s linear;
}
.word.active { color: #ffffff; }
.word.active::before { opacity: 0.7; }
.word.done { color: rgba(255,255,255,0.65); }
.word.done::before { width: 100%; opacity: 0.25; background: var(--done-color); }
.stanza { margin: 18px 0; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
#lyrics-area { max-width: 800px; margin: 0 auto; padding: 20px; line-height: 2.2; font-size: 1.2em; }
#controls, #volume-controls { text-align: center; margin: 15px 0; }
```

**Dark theme:** Charcoal background (#1a1a2e), white/off-white lyric text, warm gradient fill (red-to-yellow), done words in teal (#4ecdc4). Stanzas separated by subtle horizontal rules.

---

### Phase D — Integration Test

**D1. Serve the player (HTTP required for fetch):**
```
cd C:/Users/doner/moss_audio
python -m http.server 8080
```
Serve from `moss_audio/` root so relative paths `../moss_audio test/...` resolve correctly for both MP3 files and `karaoke_player/timing.json`.

**D2. Open in browser:**
Navigate to `http://localhost:8080/karaoke_player/karaoke.html` in Chrome or Edge.

**D3. Manual verification checklist:**
- [ ] Lyrics display correctly with all 10 stanzas visible and readable
- [ ] Press Play — both audio stems start playing simultaneously
- [ ] Word highlighting begins and progresses through lyrics in order
- [ ] Active word fills syllable-by-syllable — visible gradient bar advances within the word span in discrete syllable steps
- [ ] Completed words remain highlighted in done state (muted color, teal fill)
- [ ] Vocal volume slider reduces vocal stem volume independently (audible difference)
- [ ] Band volume slider reduces band stem volume independently (audible difference)
- [ ] Dragging seek bar jumps to correct position — highlighting updates to match new position
- [ ] Seek bar and time display update continuously (no jank) during playback
- [ ] Pause mid-song and resume — highlighting freezes and resumes at correct word
- [ ] Play through full song — no JavaScript console errors, all words eventually get highlighted
- [ ] Page handles song end gracefully — play button resets, seek bar returns to 0

**D4. Document findings:**
Create `C:/Users/doner/moss_audio/karaoke_player/VERIFICATION_NOTES.md` with:
- Per-stanza assessment of timing accuracy (good / ok / poor)
- Specific examples of misalignment: "Word 'starman' at ~45s — highlight appears 0.3s early"
- Any systemic issues: consistent offset, drift over time, silence-region problems
- Overall assessment: whether MOSS Audio timestamps are usable for karaoke on sung vocals
- The player IS the verification tool — mismatch between highlight and audio IS the finding

---

## Handoff Notes

### Critical Path Decisions

1. **Segmentation is mandatory.** `max_source_positions=1500` (hardcoded in `configuration_moss_audio.py`) limits the audio encoder to 120s at 12.5 Hz. The 257.3s track requires 3 segments of ~90s with 5s overlap. Timestamps offset-corrected; overlaps deduplicated.

2. **No conda — use venv + pip.** conda is not installed on this machine. Use Python built-in `venv` and CPU PyTorch wheels from `download.pytorch.org/whl/cpu`.

3. **FFmpeg via imageio-ffmpeg.** `pip install imageio-ffmpeg` bundles standalone ffmpeg.exe (~31MB). Primary: use for torchaudio backend. Fallback: pydub + same binary to pre-convert MP3 to WAV.

4. **Strategy B prompt.** Provide ALL lyrics text to every segment, ask for word-level timestamps. The model only timestamps what it hears. Full lyrics give complete context.

5. **Syllable-level interpolation.** MOSS Audio outputs word-level timestamps only. Syllable boundaries are interpolated evenly within word time window. Syllable string splitting uses vowel-group heuristic `[aeiouy]+` with silent-e adjustment.

6. **Player requires HTTP server.** Browsers block `fetch()` from `file://` URLs. Serve from `moss_audio/` root with `python -m http.server 8080`.

### File Paths

| Purpose | Absolute Path |
|---|---|
| Vocal MP3 (SOURCE — READ ONLY) | `C:/Users/doner/moss_audio/moss_audio test/David Bowie - Starman[4K] (Vocal).mp3` |
| Band MP3 (SOURCE — READ ONLY) | `C:/Users/doner/moss_audio/moss_audio test/David Bowie - Starman[4K] (Band).mp3` |
| Lyrics (SOURCE — READ ONLY) | `C:/Users/doner/moss_audio/moss_audio test/starman` |
| Python venv | `C:/Users/doner/moss_audio/venv_moss/` |
| MOSS-Audio repo | `C:/Users/doner/moss_audio/MOSS-Audio/` |
| Model cache | `C:/Users/doner/moss_audio/models/MOSS-Audio-4B-Instruct/` |
| Transcription script | `C:/Users/doner/moss_audio/transcribe_starman.py` |
| MP3 converter (fallback) | `C:/Users/doner/moss_audio/convert_mp3_to_wav.py` |
| Timing JSON output | `C:/Users/doner/moss_audio/karaoke_player/timing.json` |
| Karaoke player HTML | `C:/Users/doner/moss_audio/karaoke_player/karaoke.html` |
| Verification notes | `C:/Users/doner/moss_audio/karaoke_player/VERIFICATION_NOTES.md` |
| Pre-converted WAVs (if needed) | `C:/Users/doner/moss_audio/moss_audio test/starman_vocal_16k.wav` and `..._band_16k.wav` |

### Known Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| HF model download requires auth | Medium | Run `huggingface-cli login` before download; free HF account needed |
| imageio-ffmpeg binary incompatible | Low | Download standalone ffmpeg.exe from BtbN GitHub releases |
| CPU inference >60 min per segment | High | Warn user upfront; log progress; consider overnight run |
| Model outputs sentence-level timestamps | Medium | Regex parser handles multi-word segments by splitting proportionally |
| Word alignment fails on some words | Medium | Parser matches by sequence; unmatched words skipped |
| Browser CORS blocks fetch() | High | Use `python -m http.server` from moss_audio root |
| MOSS-Audio install requires extra deps | Medium | Check error output; likely need accelerate, einops — install as needed |
| 65GB RAM insufficient for 4.6B model | Low | System confirmed 65GB — plenty of headroom for ~10GB model |

### What the Executor Must NOT Do

- Do NOT modify or delete any source file in `moss_audio test/`
- Do NOT fabricate timestamps — if inference fails, report failure
- Do NOT skip segmentation — the 257s audio WILL exceed `max_source_positions=1500`
- Do NOT use GPU paths — `device_map="cpu"`, `torch_dtype=torch.float32`
- Do NOT use the 8B model or Thinking variant
- Do NOT skip validation (Step B3) before building the player
- Do NOT attempt MP3 load with torchaudio if FFmpeg backend is unavailable without first converting to WAV
- Do NOT try to open karaoke.html directly via file:// — MUST use http://localhost server
