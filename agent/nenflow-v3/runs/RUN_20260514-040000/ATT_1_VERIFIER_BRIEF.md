---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260514-040000
context_saturation_estimate: "~8%"
---

# ATT_1_VERIFIER_BRIEF — Fix audio_separator module paths

## Success Criteria Verification

### Criterion 1: UVR-MDX-NET splitter produces vocals + band stems on CPU

**Status**: PASS ✓

**Evidence**:
- Command: `python -m audio_separator.utils.cli test_audio.wav --model_filename UVR-MDX-NET-Inst_Main.onnx --output_dir test_split_output --mdx_segment_size 256 --sample_rate 44100 --output_format MP3`
- Exit code: 0
- Output files produced (verified with `ls -la`):
  ```
  -rw-r--r--  test_audio_(Instrumental)_UVR-MDX-NET-Inst_Main.mp3  402,329 bytes
  -rw-r--r--  test_audio_(Vocals)_UVR-MDX-NET-Inst_Main.mp3        402,329 bytes
  ```
- Log output shows: `Separation complete! Output file(s): test_audio_(Vocals)_UVR-MDX-NET-Inst_Main.mp3 test_audio_(Instrumental)_UVR-MDX-NET-Inst_Main.mp3`

**Verifier check**: Run `ls -la` on output_dir after a separation call; both Vocals and Instrumental files must be > 0 bytes.

---

### Criterion 2: UVR-MDX-NET splitter produces vocals + band stems on GPU (if CUDA available)

**Status**: NOT TESTED (no CUDA GPU available in this environment)

**Rationale**: The fix only changes the Python module path from `audio_separator.separator` to `audio_separator.utils.cli`. GPU detection and usage are handled by `Separator.setup_accelerated_inferencing_device()` inside the `audio_separator` library, which is unchanged. The `-m` module path change does not affect GPU behavior.

**Verifier check**: On a CUDA-capable machine, run the same separation command and verify GPU utilization via `nvidia-smi` during processing. The output should still produce Vocals + Instrumental stems.

---

### Criterion 3: Demucs splitter unchanged (no regression)

**Status**: PASS ✓

**Evidence** (`grep -n "demucs" server/splitter/demucs-adapter.js`):
```
19:        this.name = 'demucs';
24:            await execAsync(`"${VENV_PYTHON}" -m demucs --help`);
97:        let cmd = `"${VENV_PYTHON}" -m demucs -n ${modelId} ...`;
111:                '-m', 'demucs',
```
- No `audio_separator` references anywhere in demucs-adapter.js
- All `-m` invocations point to `demucs`, not `audio_separator.*`

**Verifier check**: `grep -rn "audio_separator" server/splitter/demucs-adapter.js` → should produce no output.

---

### Criterion 4: Nothing else affected

**Status**: PASS ✓

**Files modified** (3 files total, 1 was a necessary deviation):
1. `server/splitter/uvr-mdx-net-adapter.js` — line 98: `'audio_separator.separator'` → `'audio_separator.utils.cli'`
2. `server/splitter/audio-separator-adapter.js` — line 61: `-m audio_separator.separator` → `-m audio_separator.utils.cli`
3. `venv/Lib/site-packages/audio_separator/utils/cli.py` — added `if __name__ == "__main__": main()` at end of file (DEVIATION — required for `-m` to work)

**No other files touched.**

**Verifier check**:
- `grep -rn "audio_separator.separator" --include="*.js" server/` → should show only the `checkHealth()` import on uvr-mdx-net-adapter.js line 30
- `grep -rn "\-m.*audio_separator" --include="*.js" server/` → should show only `-m audio_separator.utils.cli` references (not `.separator`)

---

## Invariant Verification

### Invariant: Demucs adapter untouched
**Status**: PASS ✓ — grep confirms demucs-adapter.js has zero `audio_separator` references

### Invariant: No `-m audio_separator.separator` references remain in any JS file
**Status**: PASS ✓ — grep finds only `-c "from audio_separator.separator import Separator"` in checkHealth(). No `-m` patterns remain.

### Invariant: checkHealth() for UVR still works (imports Separator class, not CLI module)
**Status**: PASS ✓ — uvr-mdx-net-adapter.js line 30 unchanged: `from audio_separator.separator import Separator`. Also verified `python -c "from audio_separator.separator import Separator; print('OK')"` prints "OK" with exit 0.

---

## Critical Deviation: cli.py `__main__` guard

The installed `venv/Lib/site-packages/audio_separator/utils/cli.py` module lacked `if __name__ == "__main__": main()`. Without this, `python -m audio_separator.utils.cli` silently exits with code 0, producing no output.

**Fix applied**: Added at end of file:
```python
if __name__ == "__main__":
    main()
```

This is verifiable by reading the end of `venv/Lib/site-packages/audio_separator/utils/cli.py`.

**Note**: The original `python -m audio_separator.separator` was also broken (package without `__main__.py`). The original code path was never functional.

---

## Final Verdict

**READY TO DEPLOY** — All testable success criteria pass. The one untested criterion (GPU) is architecturally unaffected by this change. The deviation (adding `__main__` guard to cli.py) is necessary and correct.
