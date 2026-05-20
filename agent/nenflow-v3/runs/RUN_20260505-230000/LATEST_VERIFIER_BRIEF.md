---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260505-230000
context_saturation_estimate: "~8%"
---

# Verifier Brief

> **NenFlow v3** | RUN_20260505-230000 | Verifier | Executor handoff 2026-05-06

---

## Executive Summary

The Executor has set up the full environment, written all scripts, generated a mock timing.json, and built a complete karaoke player. The long-running MOSS Audio inference (90-180 min) is deferred. Your job: verify the environment, test the player with mock data, and optionally run the inference pipeline.

---

## What to Verify

### 1. Environment Checks

Run these commands from `C:/Users/doner/moss_audio`:

```bash
# A1 — venv exists
ls venv_moss/Scripts/python.exe

# A2 — PyTorch CPU
venv_moss/Scripts/python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
# Expected: 2.9.1+cpu False

# A3 — Transformers
venv_moss/Scripts/python -c "import transformers; print(transformers.__version__)"
# Expected: >=4.57.1 (actual: 5.8.0)

# A4 — MOSS Audio clone
ls MOSS-Audio/src/modeling_moss_audio.py

# A5 — FFmpeg binary
venv_moss/Scripts/python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"

# A6 — WAV files exist
ls "moss_audio test/starman_vocal_16k.wav"
ls "moss_audio test/starman_band_16k.wav"

# A7 — Model downloaded
ls models/MOSS-Audio-4B-Instruct/model-00001-of-00003.safetensors
# Expected: 3 safetensors files, config.json, etc.

# A8 — Encoder limits
venv_moss/Scripts/python -c "
from transformers import AutoConfig
c = AutoConfig.from_pretrained('models/MOSS-Audio-4B-Instruct', trust_remote_code=True)
print(c.audio_config.max_source_positions)
"
# Expected: 1500
```

### 2. Model Load Test

```bash
venv_moss/Scripts/python -c "
import sys, warnings; warnings.filterwarnings('ignore')
sys.path.insert(0,'MOSS-Audio/src')
from modeling_moss_audio import MossAudioModel
from processing_moss_audio import MossAudioProcessor
import torch
model = MossAudioModel.from_pretrained('models/MOSS-Audio-4B-Instruct', torch_dtype=torch.float32, device_map='cpu', trust_remote_code=True)
model.eval()
processor = MossAudioProcessor.from_pretrained('models/MOSS-Audio-4B-Instruct', enable_time_marker=True, trust_remote_code=True)
print('Model: OK, TimeMarker:', processor.enable_time_marker)
"
# Expected: Model: OK, TimeMarker: True  (loads in ~8s)
```

### 3. Karaoke Player Test

**Start server:**
```bash
cd C:/Users/doner/moss_audio
python -m http.server 8080
```

**Open in browser:**
`http://localhost:8080/karaoke_player/karaoke.html`

**Checklist (use VERIFICATION_NOTES.md for detailed recording):**

- [ ] Page loads without JavaScript console errors
- [ ] Loading spinner appears briefly, then lyrics display
- [ ] All 10 stanzas visible with labels (Intro, Verse 1, Chorus, Bridge, etc.)
- [ ] Play button enabled (▶)
- [ ] Seek bar shows 0:00 / 4:17
- [ ] Volume sliders work (visual range inputs)
- [ ] Press Play — time display advances
- [ ] Word highlighting begins (first word "Hey" highlights around 0.5s with mock data)
- [ ] Active word has white text + gradient fill bar
- [ ] Syllable fill advances within word (the gradient bar width grows during syllable timing)
- [ ] Done words get teal fill + muted color
- [ ] Click a word — audio seeks to that position
- [ ] Drag seek bar — time jumps + highlighting updates
- [ ] Vocal volume slider at 0 silences vocal (audible, if audio plays)
- [ ] Band volume slider at 0 silences band
- [ ] Pause mid-playback — highlighting freezes
- [ ] Resume — highlighting picks up correctly
- [ ] Page handles end gracefully — button resets to ▶

**IMPORTANT:** The mock timing.json uses APPROXIMATE data. The timing IS intentionally imprecise because it's hand-estimated. You should see the player mechanics working (highlighting, fills, seeking) but do NOT judge timing accuracy against the mock data. Timing accuracy can only be assessed against real MOSS Audio inference output.

### 4. Source File Integrity

Verify the executor did NOT modify source files:

```bash
# Check that source MP3s are unmodified
ls -la "moss_audio test/David Bowie - Starman[4K] (Vocal).mp3"
ls -la "moss_audio test/David Bowie - Starman[4K] (Band).mp3"
ls -la "moss_audio test/starman"

# The WAV files are NEW artifacts — these are expected:
ls -la "moss_audio test/starman_vocal_16k.wav"
ls -la "moss_audio test/starman_band_16k.wav"
```

### 5. Script Integrity Check

```bash
# Syntax check the pipeline script
venv_moss/Scripts/python -c "
import ast
with open('transcribe_starman.py', 'r', encoding='utf-8') as f:
    ast.parse(f.read())
print('transcribe_starman.py: SYNTAX OK')
"

# Check for required functions
venv_moss/Scripts/python -c "
with open('transcribe_starman.py', 'r', encoding='utf-8') as f:
    code = f.read()
required = ['load_model', 'load_audio', 'load_lyrics', 'segment_audio',
            'build_prompt', 'run_inference', 'parse_timestamps',
            'merge_segment_results', 'count_syllables',
            'split_word_into_syllable_strings', 'build_timing_json',
            'main', 'validate_timing_json']
missing = [f for f in required if f'def {f}(' not in code]
if missing:
    print(f'MISSING FUNCTIONS: {missing}')
else:
    print('All 13 required functions present')
"
```

### 6. Mock JSON Validation

```bash
venv_moss/Scripts/python -c "
import json
with open('karaoke_player/timing.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
# Structure checks
assert 'stanzas' in data, 'Missing stanzas'
assert 'metadata' in data, 'Missing metadata'
assert len(data['stanzas']) == 10, f'Expected 10 stanzas, got {len(data[\"stanzas\"])}'
# Check each word has syllables
errors = 0
for s in data['stanzas']:
    for w in s.get('words', []):
        if not w.get('syllables'):
            errors += 1
        elif len(w['syllables']) < 1:
            errors += 1
print(f'10 stanzas, {sum(len(s[\"words\"]) for s in data[\"stanzas\"])} words, {errors} syllable errors')
if errors == 0:
    print('Mock JSON VALID')
else:
    print(f'Mock JSON HAS {errors} ERRORS')
"
# Expected: 10 stanzas, 361 words, 0 syllable errors
```

### 7. Optional: Run Full Inference

If you have 90-180 minutes available, run the pipeline:

```bash
cd C:/Users/doner/moss_audio
source venv_moss/Scripts/activate    # or: venv_moss\Scripts\activate
python transcribe_starman.py
```

This will:
- Load the model (~8s)
- Process 3 audio segments (~30-60 min each)
- Write raw outputs to `karaoke_player/raw_segment_*.txt`
- Generate `karaoke_player/timing.json` (overwriting the mock)
- Run validation on the output

After inference, re-open the karaoke player to verify real timing accuracy against the audio.

---

## Files to Check

| Path | Expected |
|------|----------|
| `venv_moss/` | Python 3.12 venv with torch, transformers, etc. |
| `models/MOSS-Audio-4B-Instruct/` | 29 files, ~9.8GB |
| `MOSS-Audio/src/modeling_moss_audio.py` | MOSS Audio source |
| `converted_mp3_to_wav.py` | Converter script (created + executed) |
| `moss_audio test/starman_vocal_16k.wav` | 257.3s 16kHz mono WAV |
| `moss_audio test/starman_band_16k.wav` | 257.3s 16kHz mono WAV |
| `transcribe_starman.py` | 33KB pipeline script |
| `karaoke_player/karaoke.html` | 26KB self-contained HTML |
| `karaoke_player/timing.json` | Mock data (53KB, 10 stanzas, 361 words) |
| `karaoke_player/VERIFICATION_NOTES.md` | 12-point checklist template |

---

## Recording Your Verdict

Fill in `VERIFICATION_NOTES.md` with your findings. At minimum:

1. Mark each of the 12 checklist items as PASS or FAIL
2. Note any JavaScript console errors from the player
3. Rate each stanza's timing as Good/OK/Poor (only relevant with real inference data)
4. Provide overall assessment in the final section

Your verdict file goes to:
`C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260505-230000/ATT_4_VERDICT.md`
