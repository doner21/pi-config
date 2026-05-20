# Graph Report - C:/Users/doner/moss_audio  (2026-05-08)

## Corpus Check
- 92 files · ~994,793 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 659 nodes · 981 edges · 49 communities (38 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AST Functions (41 functions)|AST Functions (41 functions)]]
- [[_COMMUNITY_AST Functions (39 functions)|AST Functions (39 functions)]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_CapatiNenFlow|Capati/NenFlow]]
- [[_COMMUNITY_AST Functions (36 functions)|AST Functions (36 functions)]]
- [[_COMMUNITY_Read lyrics file, split into stanzas, ex|Read lyrics file, split into stanzas, ex]]
- [[_COMMUNITY_AST Functions (27 functions)|AST Functions (27 functions)]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_AST Functions (22 functions)|AST Functions (22 functions)]]
- [[_COMMUNITY_AST Functions (20 functions)|AST Functions (20 functions)]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_AST Functions (15 functions)|AST Functions (15 functions)]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Validation of invariants I1-I7.|Validation of invariants I1-I7.]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Per-window quality gate and per-word fal|Per-window quality gate and per-word fal]]
- [[_COMMUNITY_Android Emulator|Android Emulator]]
- [[_COMMUNITY_AST Functions (10 functions)|AST Functions (10 functions)]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Center-Confidence Overlap Merging|Center-Confidence Overlap Merging]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Research|Alignment Research]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_convert_mp3_to_wav.py|convert_mp3_to_wav.py]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_AST Functions (4 functions)|AST Functions (4 functions)]]
- [[_COMMUNITY_Vite + Three.js Hero Image App|Vite + Three.js Hero Image App]]
- [[_COMMUNITY_Ci Labs London Hero|Ci Labs London Hero]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_Starman by David Bowie|Starman by David Bowie]]
- [[_COMMUNITY_Backup Artifact Archive|Backup Artifact Archive]]
- [[_COMMUNITY_lyrics_with_stanzas.json|lyrics_with_stanzas.json]]
- [[_COMMUNITY_word_timestamps.json|word_timestamps.json]]
- [[_COMMUNITY_Alignment Pipeline|Alignment Pipeline]]
- [[_COMMUNITY_OpenSinger (Multi-language)|OpenSinger (Multi-language)]]

## God Nodes (most connected - your core abstractions)
1. `_import_module()` - 49 edges
2. `_load_json()` - 35 edges
3. `_ctc_flat_words()` - 24 edges
4. `run_pipeline()` - 15 edges
5. `refine_ctc_with_stars()` - 13 edges
6. `main()` - 12 edges
7. `main()` - 12 edges
8. `CtcForcedAlignTests` - 12 edges
9. `_import_alignment_module()` - 12 edges
10. `main()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `YingMusic-Singer-Plus Zero-Shot SVS` --related_to--> `STARS Singing Alignment System (gwx314/STARS)`  [INFERRED]
  SPECULATIVE_RESEARCH.md → STARS_RESULT.md
- `CTC Forced Aligner (MahmoudAshraf97)` --uses--> `HuBERT Self-Supervised Speech Model`  [INFERRED]
  handoff.md → SPECULATIVE_RESEARCH.md
- `Naive Index-Based Word Mapping Bug` --is_bug_in--> `transcribe_full.py (v1 pipeline)`  [EXTRACTED]
  ATT_1_RESEARCH.md → ALIGNMENT_V2_README.md
- `Full-Lyrics Prompt Bug` --is_bug_in--> `transcribe_full.py (v1 pipeline)`  [EXTRACTED]
  ATT_1_RESEARCH.md → ALIGNMENT_V2_README.md
- `max_new_tokens=2000 Constraint` --is_constraint_in--> `transcribe_full.py (v1 pipeline)`  [EXTRACTED]
  ATT_1_RESEARCH.md → ALIGNMENT_V2_README.md

## Communities (49 total, 11 thin omitted)

### Community 0 - "AST Functions (41 functions)"
Cohesion: 0.08
Nodes (39): align_full_song(), align_stanza(), analyze_quality(), basic_stats(), build_timing_json(), count_syllables(), estimate_stanza_boundaries(), load_lyrics() (+31 more)

### Community 1 - "AST Functions (39 functions)"
Cohesion: 0.09
Nodes (37): analyze_ctc_candidate(), build_arg_parser(), build_ctc_timing_json(), _call_with_supported_kwargs(), coerce_ctc_words(), CtcDependencyError, detect_local_compression(), _first_present() (+29 more)

### Community 2 - "Alignment Pipeline"
Cohesion: 0.06
Nodes (39): MOSS-Audio-4B-Instruct Model, align_words_to_window() with SequenceMatcher, alignment_engine, Bracket Timestamp Format, build_prompt() Function (v2), choose_lyric_window() Function, convert_to_timing.py, CPU-Only Constraint (+31 more)

### Community 3 - "Alignment Pipeline"
Cohesion: 0.07
Nodes (38): DALI Singing Alignment Dataset, DiffRhythm 2 Block Flow Matching, JAM Flow-Matching Song Generator, MERT+DTW Cosine-Distance Alignment Pipeline, MERT-v1-330M Music Understanding Model, Montreal Forced Aligner (MFA), STARS Singing Alignment System (gwx314/STARS), WhisperX Alignment Tool (+30 more)

### Community 4 - "Alignment Pipeline"
Cohesion: 0.08
Nodes (37): _add_catchup_window(), assemble_output(), build_ctc_windows(), build_stanza_ctc_windows(), _ctc_flat_words(), _ctc_global_index_map(), extract_stars_real_words(), gate_window_output() (+29 more)

### Community 5 - "Capati/NenFlow"
Cohesion: 0.06
Nodes (37): AgentInput, AGENTS.md, ApprovalCard, Audit Log, Capati Memory System, capati-memory pi-package, Conversation History, DeepSeek V4 Flash API (+29 more)

### Community 6 - "AST Functions (36 functions)"
Cohesion: 0.09
Nodes (35): assess_local_compression(), build_stanza_segments(), build_stanza_word_map(), load_lyrics(), load_phone_set(), main(), merge_segments(), merge_stanza_segments() (+27 more)

### Community 7 - "Read lyrics file, split into stanzas, ex"
Cohesion: 0.08
Nodes (30): count_syllables(), main(), split_syllables(), build_prompt(), build_timing_json(), count_syllables(), load_audio(), load_lyrics() (+22 more)

### Community 8 - "AST Functions (27 functions)"
Cohesion: 0.15
Nodes (26): align_words_to_window(), analyze_overall_quality(), analyze_segment_quality(), backup_existing_outputs(), basic_stats(), build_prompt(), build_segments(), build_timing_json() (+18 more)

### Community 9 - "Alignment Pipeline"
Cohesion: 0.13
Nodes (22): _import_alignment_module(), Deterministic regression tests for suspected STARS alignment compression bugs., Pass-1 cache reuse must reject same-identity timings with local collapse., No segment should include words whose pass-1 span falls outside its audio window, Cleaning must not expand one raw lyric token into multiple timing tokens., The checked-in Starman lyrics must stay one cleaned token per raw token., Hyphen punctuation must be deleted within tokens, not converted to spaces., Contraction rewrites must remain cardinality-preserving. (+14 more)

### Community 10 - "AST Functions (22 functions)"
Cohesion: 0.15
Nodes (20): analyze_quality(), basic_stats(), build_timing_json(), count_syllables(), get_audio_duration(), label_stanza(), load_lyrics(), LyricToken (+12 more)

### Community 11 - "AST Functions (20 functions)"
Cohesion: 0.2
Nodes (19): analyze_raw_segments(), analyze_timing(), basic_stats(), compare_raw_to_json(), estimate_highlight_bursts(), likely_lyric_position(), load_lyric_tokens(), load_timing_words() (+11 more)

### Community 12 - "Alignment Pipeline"
Cohesion: 0.14
Nodes (12): _ctc_flat_words(), Density-aware window construction from CTC word boundaries., 24 words in 15s span → 1 window., 40 words in 30s → 2+ windows with correct overlap., Words with >5s inter-word gap → split into separate windows., No window has >MAX_WORDS_PER_SEGMENT words., No window audio span (without padding) exceeds max_secs., Every CTC word index appears in at least one window. (+4 more)

### Community 13 - "Alignment Pipeline"
Cohesion: 0.13
Nodes (12): Pure unit tests for ctc_stars_refine pipeline.  No STARS model inference require, 3 words in 2s span → window skipped (below MIN_WORDS)., Center-confidence merge for overlapping windows., Single window (no overlap) → all words kept., Two overlapping windows → center-positioned words preferred., Build a minimal STARS output dict from word_list + word_durs., Both STARS candidates single-frame → CTC prevails., Merge preserves exact word count. (+4 more)

### Community 14 - "Alignment Pipeline"
Cohesion: 0.15
Nodes (11): _load_json(), Stanza-boundary window construction from CTC candidate stanza structure., 5-word Intro yields exactly 1 window, no splitting., 18-word Bridge yields exactly 1 window., 57-word verse splits into 3 windows with 6-word overlap., 41-word chorus splits into 2 windows at 'minds' repeat point., Windows never cross stanza boundaries., All CTC words (post-la-la-la) appear in at least one window. (+3 more)

### Community 16 - "Alignment Pipeline"
Cohesion: 0.21
Nodes (13): convert_to_timing_json(), create_metadata(), extract_stars_output(), load_phone_set(), lyrics_to_phonemes(), main(), STARS CPU Inference Wrapper ============================ Converts English lyrics, Extract word-level timing from STARS output. (+5 more)

### Community 17 - "Alignment Pipeline"
Cohesion: 0.14
Nodes (8): Individual per-word quality decisions., STARS duration <= 0.017s → use CTC., STARS duration > single-frame and >= 40% CTC → keep STARS., STARS duration < 40% of CTC → use CTC., Zero or negative duration → use CTC., Edge word: STARS < 60% CTC → use CTC., Edge word: STARS >= 60% CTC and not single-frame → keep STARS., TestPerWordQuality

### Community 18 - "Validation of invariants I1-I7."
Cohesion: 0.17
Nodes (7): Validation of invariants I1-I7., I1: Word count unchanged after refinement., I2: Word order remains monotonic., I3: No words silently dropped or duplicated., I4: All timestamps in valid range., Non-monotonic output detected., TestInvariants

### Community 19 - "Alignment Pipeline"
Cohesion: 0.21
Nodes (8): _import_module(), remove_lalala_from_ctc uses deep copy, never mutates original., Import ctc_stars_refine stubbing heavy deps if needed., Removal of la-la-la outro (stanza 9) from CTC candidate and lyrics., Stanza 9 removed, metadata updated, other stanzas intact., la-la-la lines filtered from lyrics text., la' in 'Lotta soul' / 'rock n roll' is NOT removed., TestLaLaLaRemoval

### Community 20 - "Per-window quality gate and per-word fal"
Cohesion: 0.17
Nodes (7): Per-window quality gate and per-word fallback logic., All words with good durations → PASS., Edge words single-frame → identified for CTC fallback., Internal burst of single-frame words → window passes but bursts flagged for CTC., Word with 0.000s duration → flagged for CTC fallback., Word count mismatch → FAIL., TestQualityGate

### Community 21 - "Android Emulator"
Cohesion: 0.18
Nodes (12): Android Emulator, Pi Bridge Server, LAN WiFi Network, Model Switching, Physical Android Phone, pi-bridge.md, server.cjs, Pi CLI Safe Args (+4 more)

### Community 22 - "AST Functions (10 functions)"
Cohesion: 0.31
Nodes (9): basic_stats(), diagnose(), extract_words(), main(), percentile(), print_report(), Print formatted diagnostic report., Extract flat word list from either format.     Returns (list of word dicts, form (+1 more)

### Community 23 - "Alignment Pipeline"
Cohesion: 0.2
Nodes (10): Badlani et al. RAD-TTS (arXiv 2021), Contrastive Alignment (Discriminative), Forward-Sum Algorithm (RAD-TTS), Guo et al. STARS (ACL 2025), RAD-TTS Aligner (NVIDIA Contrastive), STARS Bilingual Checkpoint (678MB), STARS max_frames=6000 (~32s limit), STARS (Singing Transcription & Alignment Model) (+2 more)

### Community 24 - "Center-Confidence Overlap Merging"
Cohesion: 0.22
Nodes (9): Center-Confidence Overlap Merging, Edge Phoneme Distortion (Padding Zone), GTX 1080 Ti (11GB VRAM), MMS Adapter Training (2.5M params), LoRA/PEFT Fine-Tuning, QLoRA (4-bit Quantization), run_stars_full.py (Even-Split), run_stars_stanza.py (STARS Segment Runner) (+1 more)

### Community 25 - "Alignment Pipeline"
Cohesion: 0.25
Nodes (9): CTC Forced Aligner (MahmoudAshraf97), HuBERT Self-Supervised Speech Model, Matchmaker Score Following Library, STARS Local Refinement Strategy, ctc_forced_align.py (CTC Pipeline), ctc_stars_refine.py (Hybrid), Duration Capping (STARS anchor), CTC to STARS Duration-Only Refinement (+1 more)

### Community 26 - "Alignment Pipeline"
Cohesion: 0.22
Nodes (9): CTC Peaky Posterior Problem, diagnose_boundary_compression.py, La-La-La Outro (70 Words), NUS-48E (48 English Songs), Segment-Boundary Compression Bug, Single-Frame Word (0.016s Artifact), Inter-Word Space Budget Analysis, Starman Lyrics (10 Stanzas) (+1 more)

### Community 27 - "Alignment Research"
Cohesion: 0.22
Nodes (9): Annotated-VocalSet (10.1h), CLAP / Music-CLAP (Global Contrastive), GTSinger (80.59h Singing Dataset), M4Singer (Mandarin Singing), MERT-330M (Music Understanding SSL), Neural Contrastive Aligner Architecture, Opencpop (5.2h Mandarin Singing), SOFA (Singing-Oriented Forced Aligner) (+1 more)

### Community 28 - "Alignment Pipeline"
Cohesion: 0.29
Nodes (7): AudioShake (Proprietary Singing Aligner), ctc-forced-aligner (MahmoudAshraf), ctc-segmentation (lumaku), DALI (5358 Audio Tracks), Demucs (htdemucs_ft Vocal Extraction), Jam-ALT Benchmark (AudioShake), WhisperX (Word Timestamping)

### Community 29 - "Alignment Pipeline"
Cohesion: 0.29
Nodes (7): AMD APU (128GB Unified ROCm), Huang et al. Less Peaky CTC (ICASSP 2024), Less Peaky CTC via Label Priors, MMS-300M-1130 Forced Aligner, Qwen3-ForcedAligner-0.6B, RTX 4090 (24GB VRAM), End-to-End Lyrics Aligner (Stoller 2019)

### Community 30 - "convert_mp3_to_wav.py"
Cohesion: 0.47
Nodes (5): convert_mp3_to_wav(), main(), Convert MP3 to 16kHz mono WAV using imageio-ffmpeg binary., Load WAV with soundfile and return duration in seconds., verify_wav()

### Community 31 - "Alignment Pipeline"
Cohesion: 0.33
Nodes (4): Full pipeline on synthetic data (no real STARS inference)., Output preserves CTC stanza index/label/word membership., run_refine_pipeline with mocked STARS (no inference)., TestEndToEnd

### Community 32 - "Alignment Pipeline"
Cohesion: 0.33
Nodes (4): Full pipeline integration with stanza-boundary windowing., Full pipeline with mocked STARS using stanza-boundary windows., Verify that the real CTC candidate produces ~16 windows., TestFullPipelineStanza

### Community 33 - "Alignment Pipeline"
Cohesion: 0.4
Nodes (5): Instrumental-Gap Viterbi Collapse, Mechanical CTC Sliding Windows, Silence-Based Segmentation (librosa), Stanza-Boundary Windowing Strategy, Two-Pass Stanza-Aware Alignment

### Community 34 - "AST Functions (4 functions)"
Cohesion: 0.83
Nodes (3): analyze_timing_json(), audit_stars_outputs(), main()

### Community 35 - "Vite + Three.js Hero Image App"
Cohesion: 1.0
Nodes (3): Vite + Three.js Hero Image App, Point-Cloud Dispersion/Reintegration Effect, Ripple / Displacement Image Effect

## Knowledge Gaps
- **267 isolated node(s):** `Convert MP3 to 16kHz mono WAV using imageio-ffmpeg binary.`, `Load WAV with soundfile and return duration in seconds.`, `Estimate segment-local lyric range from song position with generous overlap.`, `Drop near-duplicate overlap words, preferring later segment context.`, `Load MOSS-Audio-4B-Instruct model and processor in CPU/float32 mode.      Return` (+262 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MERT+DTW Cosine-Distance Alignment Pipeline` connect `Alignment Pipeline` to `Alignment Pipeline`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `g2p_en Phoneme Conversion` connect `Alignment Pipeline` to `Alignment Pipeline`, `AST Functions (36 functions)`, `Alignment Pipeline`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `STARS Singing Alignment System (gwx314/STARS)` connect `Alignment Pipeline` to `Center-Confidence Overlap Merging`, `Alignment Pipeline`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **What connects `Convert MP3 to 16kHz mono WAV using imageio-ffmpeg binary.`, `Load WAV with soundfile and return duration in seconds.`, `Estimate segment-local lyric range from song position with generous overlap.` to the rest of the system?**
  _267 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AST Functions (41 functions)` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `AST Functions (39 functions)` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Alignment Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._