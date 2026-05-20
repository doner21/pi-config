# Online/local research: STARS forced alignment suitability

## Sources consulted

- Upstream STARS README: https://github.com/gwx314/STARS and local `alignment_engine/STARS/README.md`
- HuggingFace model repository/API: https://huggingface.co/verstar/STARS and `https://huggingface.co/api/models/verstar/STARS`
- STARS demo page: https://gwx314.github.io/stars-demo/
- STARS paper HTML: https://arxiv.org/html/2507.06670v1
- GitHub issues/comments:
  - Inference limitations/background audio: https://github.com/gwx314/STARS/issues/1
  - English/bilingual checkpoint: https://github.com/gwx314/STARS/issues/2
  - Other-language support/training required: https://github.com/gwx314/STARS/issues/5
  - English preprocessing missing/recommended options: https://github.com/gwx314/STARS/issues/7
- Local upstream code inspected: `inference/stars.py`, `modules/stars/stars.py`, `modules/stars/utils.py`, `data_gen/stars_binarizer.py`, `scripts/process_ch.py`, `scripts/mixedtext2phoneme.py`, configs.

## Key findings

- **Metadata format:** upstream expects JSON entries with `item_name`, `wav_fn`, `word`, `ph`, `ph2words`; `word_durs` and `ph_durs` are optional. `ph2words` is 0-based and must map each phoneme to its word index. For English, use the bilingual checkpoint with `configs/stars_bilingual.yaml` and `chinese_and_english_phone_set.json`.
- **Durations are not required for inference, but they also do not appear to act as stabilizing priors.** README says missing durations “will be predicted automatically.” Local code confirms inference always runs frame-level phoneme prediction plus Viterbi forced alignment (`get_ph_word_bd`) when `train=False`; provided `ph_durs`/`word_durs` are loaded but overwritten for alignment output. They may affect technique prediction / TextGrid saving behavior, but not anchor word boundaries.
- **STARS predicts alignment from scratch given audio + phone sequence.** The paper says inference obtains phonemes/words from lyrics or ASR, then uses frame-level phoneme logits with Viterbi forced alignment to determine phoneme/word boundaries. It is not a duration-refinement model around MFA/TextGrid priors in the released inference path.
- **Pure vocals are important.** README says pure vocal audio yields better results. In issue #1, the author says the model was primarily trained on acapella audio after vocal-instrument separation and performs poorly with background sound; phoneme errors also affect inference.
- **Long full-song clips are outside the apparent operating envelope.** Issue #1 reports poor results on a 4-minute song. Local upstream `process_ch.py` splits long audio into 8–20s segments; `data_gen/stars_binarizer.py` rejects mel length >4000 frames (~21.3s at 24k/128 hop). Config `max_frames: 6000` is ~32s, but training/preprocess code strongly suggests short segments.
- **English support exists but is immature operationally.** Issue #2 says a bilingual Chinese/English checkpoint exists, but mixed-language performance is not well established because training data was pure English or pure Chinese. Issue #7 says there is currently only Chinese processing; for English, use `mfa_dict/english_mfa.dict` or adapt NATSpeech `en.py`/`g2p_en`.
- **Training/evaluation scope is not arbitrary karaoke.** Paper experiments use GTSinger Chinese/English subsets with TextGrid word/phoneme boundaries plus an extra 30h Chinese dataset. Demo examples are short phrases, including one short English phrase. This is evidence for short singing annotation, not robust full-song karaoke forced alignment.
- **Fragility mechanisms likely relevant to us:** monotonic Viterbi over long/repeated lyric regions can choose bad paths; OOV phones are silently mapped to `<Blank>` by `PhoneEncoder`; punctuation/contractions require careful normalization; repeated “la”/repeated lyrics need tight audio windows; long leading/trailing rests can be absorbed as `<SP>` and compress real words near segment tails.

## Likely setup mistakes / mismatches in our code

- Our STARS segments are too long for upstream assumptions: `SEGMENT_DURATION=30s` and `MAX_SEGMENT_DURATION=45s` exceed the upstream 20s splitter and ~21s training/binarizer limit.
- We are using STARS as both coarse full-song aligner and local refiner. Upstream evidence supports using it on short, already-localized vocal segments, not as a general arbitrary full-song karaoke aligner.
- Not providing `word_durs`/`ph_durs` is **not** itself a setup error; expecting them to stabilize inference would be. In released code they are not alignment priors.
- English phonemization should be validated against the bilingual phone set on every run. `g2p_en` is plausible, but upstream specifically points users to `english_mfa.dict` or NATSpeech `en.py`; OOV phones/blanks can silently degrade alignment.
- Segment windows with padding/rests and repeated lyric material likely cause the observed tail compression. STARS needs tighter line/phrase windows or an external coarse aligner.

## Recommended next engineering steps

1. Treat STARS as optional **local phrase aligner** only: pure-vocal 24k input, phrase/line windows about 8–20s, tight to actual singing, with overlap only for boundary words.
2. Reduce hard limits: make `MAX_SEGMENT_DURATION <= 20–22s`; avoid 30/45s STARS calls.
3. Add a metadata validator before STARS: all phones in `chinese_and_english_phone_set.json`, no `<Blank>`/OOV, `len(ph)==len(ph2words)`, each word has phones or is intentionally silence, contractions normalized.
4. Use an independent coarse alignment/windowing source (MERT/DTW, Whisper/ASR timestamps, vocal VAD + lyric structure, manual stanza times) before STARS; do not rely on STARS pass-1 if it already shows compression.
5. If duration priors are desired, either use the external timings directly or intentionally patch STARS inference to honor supplied `mel2ph`/`mel2word`/boundaries; upstream inference does not currently refine supplied durations.
6. Always inspect `--save_plot` DP matrices/TextGrids on representative English clips before accepting full-song output.

## Confidence

**Medium-high.** The strongest evidence is upstream README, author GitHub comments, paper inference description, and local code. Remaining uncertainty: no comprehensive upstream benchmark/issue specifically for “arbitrary full-song English karaoke,” but available evidence strongly suggests this is outside the tested/recommended use case and that our long-segment setup is a major contributor.
