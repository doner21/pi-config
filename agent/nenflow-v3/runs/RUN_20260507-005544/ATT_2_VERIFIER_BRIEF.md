---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260507-005544
for_role: VERIFIER
---

# Verifier Brief — STARS Forced Alignment Integration

## What Was Built

MERT+DTW cosine-distance forced alignment engine for singing voice, integrated into
the moss_audio karaoke project. Replaces MOSS Audio forced alignment which produced
pathological 0.080s median word durations. New system produces 0.707s median with
0.5% short words.

## Quality Gate Outcomes

All gates PASS (verified by `diagnose_alignment.py`):

| Gate | Threshold | Actual | Status |
|------|-----------|--------|--------|
| Median word duration >= 0.15s | 0.15s | 0.707s | PASS |
| Short words (<=0.08s) <= 10% | 10% | 0.5% | PASS |
| Negative durations = 0 | 0 | 0 | PASS |
| Non-monotonic = 0 | 0 | 0 | PASS |
| Zero-duration = 0 | 0 | 0 | PASS |
| Coverage >= 85% | 85% | 100.0% | PASS |
| Median gap < 0.5s (warn) | 0.5s | 0.001s | OK |

## Verification Checklist

### File Existence (100% required)

- [ ] `C:/Users/doner/moss_audio/alignment_engine/__init__.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/extract_test_clip.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/mert_dtw_align.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/convert_to_timing.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/diagnose_alignment.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/align_full.py`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/STARS_RESULT.md`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/TEST_REPORT.md`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/test_clip_30s.wav`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/test_clip_lyrics.txt`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/test_clip_mert_dtw_output.json`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/full_alignment_output.json`
- [ ] `C:/Users/doner/moss_audio/alignment_engine/STARS/` (repo + downloaded model weights)
- [ ] `C:/Users/doner/moss_audio/karaoke_player/timing.json` (new, quality=pass)
- [ ] `C:/Users/doner/moss_audio/karaoke_player/timing_candidate.json`
- [ ] `C:/Users/doner/moss_audio/karaoke_player/backups/20260507_011912_pre_alignment_engine/`
- [ ] `C:/Users/doner/moss_audio/venv_align/` (Python 3.12)

### Existing File Integrity (must be UNCHANGED)

- [ ] `C:/Users/doner/moss_audio/karaoke_player/karaoke.html` — not modified
- [ ] `C:/Users/doner/moss_audio/transcribe_full_v2.py` — not modified
- [ ] `C:/Users/doner/moss_audio/convert_mp3_to_wav.py` — not modified
- [ ] `C:/Users/doner/moss_audio/quick_transcribe.py` — not modified
- [ ] `C:/Users/doner/moss_audio/transcribe_full.py` — not modified
- [ ] `C:/Users/doner/moss_audio/transcribe_starman.py` — not modified
- [ ] `C:/Users/doner/moss_audio/moss_audio test/starman` (lyrics) — not modified
- [ ] `C:/Users/doner/moss_audio/moss_audio test/starman_vocal_16k.wav` — not modified

### Diagnostic Independence (the diagnostic script should validate the output)

Run this command and confirm exit code 0:
```bash
cd C:/Users/doner/moss_audio
source venv_align/Scripts/activate
python alignment_engine/diagnose_alignment.py --input karaoke_player/timing.json --full-song
echo "Exit code: $?"
```

Expected output ends with "PASS - All quality gates met" and exit code 0.

### Timing.json Schema (spot-check structure)

The `karaoke_player/timing.json` must contain:
- [ ] `metadata.duration_s` = 257.3
- [ ] `metadata.quality_status` = "pass"
- [ ] `metadata.total_words` = 367
- [ ] `stanzas` array with 10 entries
- [ ] Each stanza has: `index`, `label`, `words[]`
- [ ] Each word has: `word`, `start`, `end`, `syllables[]`
- [ ] Each syllable has: `text`, `start`, `end`

### Word Duration Plausibility (spot-check 10 random words)

Load `karaoke_player/timing.json`, pick 10 random words, verify:
- [ ] All durations > 0.08s (or at most 2 exceptions)
- [ ] All durations < 3.0s
- [ ] All words have start < end
- [ ] All words appear in order (start[i] <= start[i+1])

### MOSS Pipeline Isolation

- [ ] No new files in `research_alignment/`
- [ ] No modifications to `venv_moss/`
- [ ] No modifications to `MOSS-Audio/`
- [ ] `transcribe_full_v2.py` still references `venv_moss` deps only

### Venv Isolation

- [ ] `venv_align/` exists and is separate from `venv_moss/`
- [ ] `pip list` in venv_align shows torch, transformers, dtaidistance
- [ ] `venv_moss/` should NOT have dtaidistance or transformers

## Key Evidence to Trust

1. **MERT+DTW test clip**: `test_clip_mert_dtw_output.json` — 57 words, median 0.507s, 0% short
2. **Full alignment data**: `full_alignment_output.json` — 367 words, median 0.707s, 0.5% short
3. **Diagnostic output**: captured in execution session — all gates PASS
4. **timing.json**: final output at `karaoke_player/timing.json` — quality_status="pass"
5. **Backup**: `karaoke_player/backups/20260507_011912_pre_alignment_engine/` — 9 files preserved

## Comparison Baseline

For reference, the old MOSS baseline:
- `karaoke_player/backups/20260507_011912_pre_alignment_engine/timing.json`
  - quality_status: "fail"
  - median word duration: 0.080s
  - short word ratio: 72.6%

## STARS Status

STARS is cloned and model weights are downloaded, but cannot run (no CUDA GPU).
If GPU becomes available:
```bash
cd alignment_engine/STARS
# Build metadata.json with English phonemes via g2p_en
# Run: python inference/stars.py --ckpt checkpoints/stars_chinese_english_bilingual/model_ckpt_steps_300000.ckpt --config configs/stars_bilingual.yaml --phset chinese_and_english_phone_set.json --metadata metadata.json -o stars_output
```

---

*This brief provides the Verifier with everything needed to independently determine PASS or FAIL.*
