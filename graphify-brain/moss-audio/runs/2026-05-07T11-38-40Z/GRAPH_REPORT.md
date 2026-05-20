# Graph Report - .  (2026-05-07)

## Corpus Check
- Large corpus: 235 files · ~1,704,521 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1550 nodes · 2650 edges · 102 communities (77 shown, 25 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 413 edges (avg confidence: 0.62)
- Token cost: 15,000 input · 5,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_STARS Conformer Architecture|STARS Conformer Architecture]]
- [[_COMMUNITY_Chinese Text Normalization|Chinese Text Normalization]]
- [[_COMMUNITY_RMVPE Pitch Extraction|RMVPE Pitch Extraction]]
- [[_COMMUNITY_MOSS-Audio Finetuning Pipeline|MOSS-Audio Finetuning Pipeline]]
- [[_COMMUNITY_Alignment Research & Architecture|Alignment Research & Architecture]]
- [[_COMMUNITY_STARS Utility Functions|STARS Utility Functions]]
- [[_COMMUNITY_Alignment Engine Core|Alignment Engine Core]]
- [[_COMMUNITY_Phoneme Text Encoding|Phoneme Text Encoding]]
- [[_COMMUNITY_Karaoke Player UI|Karaoke Player UI]]
- [[_COMMUNITY_Transformer Layer Modules|Transformer Layer Modules]]
- [[_COMMUNITY_Gradio App Interface|Gradio App Interface]]
- [[_COMMUNITY_Relative Transformer Blocks|Relative Transformer Blocks]]
- [[_COMMUNITY_STARS Core Model|STARS Core Model]]
- [[_COMMUNITY_Convolution U-Net Blocks|Convolution U-Net Blocks]]
- [[_COMMUNITY_Dataset Utilities|Dataset Utilities]]
- [[_COMMUNITY_Audio IO Processing|Audio I/O Processing]]
- [[_COMMUNITY_WaveNet Blocks|WaveNet Blocks]]
- [[_COMMUNITY_STARS Data Generation|STARS Data Generation]]
- [[_COMMUNITY_Training Infrastructure|Training Infrastructure]]
- [[_COMMUNITY_Model Checkpointing|Model Checkpointing]]
- [[_COMMUNITY_Pitch Distance Metrics|Pitch Distance Metrics]]
- [[_COMMUNITY_DDP Training Utils|DDP Training Utils]]
- [[_COMMUNITY_Audio Mel Spectrogram|Audio Mel Spectrogram]]
- [[_COMMUNITY_STARS Binarizer Base|STARS Binarizer Base]]
- [[_COMMUNITY_TextGrid Processing|TextGrid Processing]]
- [[_COMMUNITY_SSIM Metrics|SSIM Metrics]]
- [[_COMMUNITY_TempProbs Analysis|TempProbs Analysis]]
- [[_COMMUNITY_MIDI Encoding|MIDI Encoding]]
- [[_COMMUNITY_Signal Processing Utils|Signal Processing Utils]]
- [[_COMMUNITY_MUSA-Net Data Binarization|MUSA-Net Data Binarization]]
- [[_COMMUNITY_G2P Phoneme Conversion|G2P Phoneme Conversion]]
- [[_COMMUNITY_Single Thread Environment|Single Thread Environment]]
- [[_COMMUNITY_Diagonal Metrics|Diagonal Metrics]]
- [[_COMMUNITY_Laplace Variance|Laplace Variance]]
- [[_COMMUNITY_GPU Memory Tracking|GPU Memory Tracking]]
- [[_COMMUNITY_Indexed Datasets|Indexed Datasets]]
- [[_COMMUNITY_Schedulers|Schedulers]]
- [[_COMMUNITY_Plot Utilities|Plot Utilities]]
- [[_COMMUNITY_STARS Task Runner|STARS Task Runner]]
- [[_COMMUNITY_STARS Dataset|STARS Dataset]]
- [[_COMMUNITY_Model Utils|Model Utils]]
- [[_COMMUNITY_Sequence Utils|Sequence Utils]]
- [[_COMMUNITY_Seq2Seq Utils|Seq2Seq Utils]]
- [[_COMMUNITY_DTW Metrics|DTW Metrics]]
- [[_COMMUNITY_Loss Functions|Loss Functions]]
- [[_COMMUNITY_Multi-process Utils|Multi-process Utils]]
- [[_COMMUNITY_Audio Pitch Extractors|Audio Pitch Extractors]]
- [[_COMMUNITY_TTS Utils|TTS Utils]]
- [[_COMMUNITY_Inference Pipeline|Inference Pipeline]]
- [[_COMMUNITY_Audio Base Task|Audio Base Task]]
- [[_COMMUNITY_STARS Config|STARS Config]]
- [[_COMMUNITY_STARS Encoder|STARS Encoder]]
- [[_COMMUNITY_STARS Vocoder|STARS Vocoder]]
- [[_COMMUNITY_MERT DTW Alignment|MERT DTW Alignment]]
- [[_COMMUNITY_VAD Processing|VAD Processing]]
- [[_COMMUNITY_Musan Binarizer|Musan Binarizer]]
- [[_COMMUNITY_Phoneme Conversion Scripts|Phoneme Conversion Scripts]]
- [[_COMMUNITY_Debug Alignment Tools|Debug Alignment Tools]]
- [[_COMMUNITY_Lyrics Audio HMM Aligner|Lyrics Audio HMM Aligner]]
- [[_COMMUNITY_Test Audio Files|Test Audio Files]]
- [[_COMMUNITY_Conversion Timing Tools|Conversion Timing Tools]]
- [[_COMMUNITY_Model Init Utils|Model Init Utils]]
- [[_COMMUNITY_Token Loss Computation|Token Loss Computation]]
- [[_COMMUNITY_Data Collation|Data Collation]]
- [[_COMMUNITY_AdamW Optimizer|AdamW Optimizer]]
- [[_COMMUNITY_Gradient Clipping|Gradient Clipping]]
- [[_COMMUNITY_Tensor Utils|Tensor Utils]]
- [[_COMMUNITY_Decoding Utils|Decoding Utils]]
- [[_COMMUNITY_MoE Layer Routing|MoE Layer Routing]]
- [[_COMMUNITY_Ngram Repeat|Ngram Repeat]]
- [[_COMMUNITY_STARS Architecture Config|STARS Architecture Config]]
- [[_COMMUNITY_Activation Checkpointing|Activation Checkpointing]]
- [[_COMMUNITY_FP16 Training|FP16 Training]]
- [[_COMMUNITY_Validation Metrics|Validation Metrics]]
- [[_COMMUNITY_Learning Rate Scheduler|Learning Rate Scheduler]]
- [[_COMMUNITY_Data Parallelism|Data Parallelism]]
- [[_COMMUNITY_Model Parallelism|Model Parallelism]]
- [[_COMMUNITY_Mixed Precision|Mixed Precision]]
- [[_COMMUNITY_Audio Resampling|Audio Resampling]]
- [[_COMMUNITY_Global Gradient Norm|Global Gradient Norm]]
- [[_COMMUNITY_Embedding Layer|Embedding Layer]]
- [[_COMMUNITY_Config Parsing|Config Parsing]]
- [[_COMMUNITY_STARS Inference|STARS Inference]]
- [[_COMMUNITY_RMVPE Init|RMVPE Init]]
- [[_COMMUNITY_STARS Utils Init|STARS Utils Init]]
- [[_COMMUNITY_Audio Utils Init|Audio Utils Init]]
- [[_COMMUNITY_Commons Utils Init|Commons Utils Init]]
- [[_COMMUNITY_Metrics Init|Metrics Init]]
- [[_COMMUNITY_NN Utils Init|NN Utils Init]]

## God Nodes (most connected - your core abstractions)
1. `StarsTask` - 39 edges
2. `LayerNorm` - 38 edges
3. `ConvBlocks` - 27 edges
4. `Trainer` - 27 edges
5. `BaseTask` - 25 edges
6. `ResidualBlock` - 23 edges
7. `MossAudioModel` - 22 edges
8. `ConformerLayers` - 21 edges
9. `STARS` - 21 edges
10. `MemTracker` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Quality Gates (word duration, coverage)` --guards--> `timing.json word timestamps`  [EXTRACTED]
  transcribe_full_v2.py → karaoke_player/timing.json
- `MERT+DTW Alignment Engine` --feeds--> `Karaoke HTML Player`  [EXTRACTED]
  alignment_engine/mert_dtw_align.py → karaoke_player/karaoke.html
- `aeneas DTW aligner` --conceptually_related_to--> `Dynamic Time Warping Alignment`  [INFERRED]
  research_alignment/CONSERVATIVE_RESEARCH.md → alignment_engine/mert_dtw_align.py
- `Convert alignment to timing.json` --writes--> `timing.json word timestamps`  [EXTRACTED]
  alignment_engine/convert_to_timing.py → karaoke_player/timing.json
- `Alignment diagnostics quality gates` --validates--> `timing.json word timestamps`  [EXTRACTED]
  alignment_engine/diagnose_alignment.py → karaoke_player/timing.json

## Hyperedges (group relationships)
- **Starman Karaoke Alignment Pipeline** — Convert_MP3_to_WAV, Vocal_Stem, MERT_DTW_Aligner, MERT_Model, DTW_Alignment, Iterative_Refinement, Convert_To_Timing, Timing_JSON, Karaoke_Player, Stanza_Labels, Diagnose_Alignment [EXTRACTED 1.00]
- **Alignment Research Landscape** — Intake_Doc, Conservative_Research, Speculative_Research, Alignment_Roadmap, MFA_Aligner, STARS_Aligner, MERT_DTW_Aligner, Aeneas_DTW, DALI_Dataset [EXTRACTED 1.00]
- **MOSS-Audio Model Family** — MOSS_Audio_4B_Instruct, MOSS_Audio_4B_Thinking, MOSS_Audio_8B_Instruct, MOSS_Audio_8B_Thinking, MOSS_Audio_Encoder, Qwen3_4B, Qwen3_8B, DeepStack_Module, Time_Marker, Modality_Adapter [EXTRACTED 1.00]

## Communities (102 total, 25 thin omitted)

### Community 0 - "STARS Conformer Architecture"
Cohesion: 0.05
Nodes (46): ConformerDecoder, ConformerEncoder, ConformerLayers, ConformerLayersMOE, FastConformerLayers, FeedForwardMOE, :param src_tokens: [B, T]         :return: [B x T x C], :param x: [B, T, H]         :param padding_mask: [B, T]         :return: [B, T (+38 more)

### Community 1 - "Chinese Text Normalization"
Cohesion: 0.05
Nodes (36): object, add_bdr(), cut_long_audio(), get_phone(), pinyin_with_en(), postprocess(), preprocess_text(), process() (+28 more)

### Community 2 - "RMVPE Pitch Extraction"
Cohesion: 0.05
Nodes (23): get_wav_num_frames(), resample_align_curve(), Dataset, ConvBlockRes, Decoder, DeepUnet0, Encoder, Intermediate (+15 more)

### Community 3 - "MOSS-Audio Finetuning Pipeline"
Cohesion: 0.07
Nodes (22): _compute_audio_tokens(), DataArguments, extract_mel(), FinetuneArguments, ModelArguments, MossAudioDataset, MOSS-Audio SFT fine-tuning script.  Minimal single-file trainer supporting LoR, Three stride-2 convolutions → downsampled token count. (+14 more)

### Community 4 - "Alignment Research & Architecture"
Cohesion: 0.05
Nodes (46): Adapter Tuning SSL plus PEFT, aeneas DTW aligner, Full-song alignment orchestrator, Alignment Technology Roadmap, Audio I/O load audio, Starman Band Stem 16kHz WAV, Conservative Research Report, Convert MP3 to 16kHz WAV (+38 more)

### Community 5 - "STARS Utility Functions"
Cohesion: 0.08
Nodes (25): boundary2Interval(), denorm_f0(), interp_f0(), melody_eval_pitch_and_itv(), midi2NoteInterval(), midi2NotePitch(), midi_COn_eval(), midi_COnP_eval() (+17 more)

### Community 6 - "Alignment Engine Core"
Cohesion: 0.08
Nodes (39): align_full_song(), align_stanza(), analyze_quality(), basic_stats(), build_timing_json(), count_syllables(), estimate_stanza_boundaries(), load_lyrics() (+31 more)

### Community 7 - "Phoneme Text Encoding"
Cohesion: 0.07
Nodes (17): build_token_encoder(), is_sil_phoneme(), Encoder based on a user-supplied vocabulary (file or list)., Initialize from a file or list, one token per line.          Handling of reser, Converts a space-separated string of tokens to a list of ids., Load vocab from a file.          Args:         filename: The file to load voc, Initialize tokens from a list of tokens.          It is ok if reserved tokens, Initialize vocabulary with tokens from token_generator. (+9 more)

### Community 8 - "Karaoke Player UI"
Cohesion: 0.12
Nodes (36): buildAssetUrl(), createAnalysisPanel(), createAudioPanel(), createBarGradient(), createExpandableBlock(), createImagePanel(), createPill(), createPromptPanel() (+28 more)

### Community 9 - "Transformer Layer Modules"
Cohesion: 0.09
Nodes (14): LayerNorm, Layer normalization module.     :param int nout: output dim size     :param in, DecSALayer, EncSALayer, FastSpeechDecoder, FastSpeechEncoder, FFTBlocks, get_embedding() (+6 more)

### Community 10 - "Gradio App Interface"
Cohesion: 0.08
Nodes (14): convert_media_to_mp3(), format_status(), get_inference(), resolve_media_path(), run_inference(), MossAudioHFInference, HuggingFace inference wrapper for MOSS-Audio., Thin wrapper that loads model + processor and exposes a single     ``generate`` (+6 more)

### Community 11 - "Relative Transformer Blocks"
Cohesion: 0.1
Nodes (14): convert_pad_shape(), ConvReluNorm, Encoder, FFN, LayerNorm, MultiHeadAttention, x: [b, h, l, m]         y: [h or 1, m, d]         ret: [b, h, l, d], x: [b, h, l, d]         y: [h or 1, m, d]         ret: [b, h, l, m] (+6 more)

### Community 12 - "STARS Core Model"
Cohesion: 0.14
Nodes (14): ConvBlocks, :param x: [B, T, H]         :return:  [B, T, H], Decodes the expanded phoneme encoding into spectrograms, This module produces sinusoidal positional embeddings of any length.      Padd, Maximum number of supported positions., SinusoidalPositionalEmbedding, NoteFramePredictor, PhFramePredictor (+6 more)

### Community 13 - "Convolution U-Net Blocks"
Cohesion: 0.11
Nodes (11): ConditionalConvBlocks, get_act_builder(), get_norm_builder(), LambdaLayer, :param txt_tokens: [B, T]         :return: {             'encoder_out': [B x T, Implements conv->PReLU->norm n-times, ResidualBlock, TextConvEncoder (+3 more)

### Community 14 - "Dataset Utilities"
Cohesion: 0.1
Nodes (19): BaseConcatDataset, batch_by_size(), collate_1d(), collate_1d_or_2d(), collate_2d(), collate_xd(), data_loader(), _is_batch_full() (+11 more)

### Community 15 - "Audio I/O Processing"
Cohesion: 0.15
Nodes (26): align_words_to_window(), analyze_overall_quality(), analyze_segment_quality(), backup_existing_outputs(), basic_stats(), build_prompt(), build_segments(), build_timing_json() (+18 more)

### Community 16 - "WaveNet Blocks"
Cohesion: 0.11
Nodes (26): build_prompt(), build_timing_json(), count_syllables(), load_audio(), load_lyrics(), load_model(), main(), merge_segment_results() (+18 more)

### Community 17 - "STARS Data Generation"
Cohesion: 0.11
Nodes (26): build_stanza_segments(), build_stanza_word_map(), load_lyrics(), load_phone_set(), main(), merge_segments(), merge_stanza_segments(), parse_stanzas() (+18 more)

### Community 18 - "Training Infrastructure"
Cohesion: 0.12
Nodes (9): BatchNormConv, CBHG, ConvNorm, DecoderRNN, HighwayNetwork, PreNet, Calls `flatten_parameters` on all the rnns used by the WaveRNN. Used         to, RNNEncoder (+1 more)

### Community 19 - "Model Checkpointing"
Cohesion: 0.09
Nodes (22): fill_with_neg_inf(), fill_with_neg_inf2(), get_diagonal_focus_rate(), _get_full_incremental_state_key(), get_incremental_state(), group_hidden_by_segs(), make_non_pad_mask(), make_pad_mask() (+14 more)

### Community 20 - "Pitch Distance Metrics"
Cohesion: 0.12
Nodes (12): Unet, CMUEncoder, CrossAttenLayer, get_ph_word_bd(), group_hidden_by_segs(), _make_guided_attention_mask(), perform_viterbi_bd(), :param ref_mels: [B, T, C]         :return: [B, 1, H] (+4 more)

### Community 21 - "DDP Training Utils"
Cohesion: 0.18
Nodes (4): move_to_cuda(), Sanity check a few things before starting actual training.          :param tas, Logs the metric dict passed in.          :param metrics:, Trainer

### Community 22 - "Audio Mel Spectrogram"
Cohesion: 0.1
Nodes (20): fill_with_neg_inf(), fill_with_neg_inf2(), _get_full_incremental_state_key(), get_incremental_state(), group_hidden_by_segs(), make_non_pad_mask(), make_pad_mask(), make_positions() (+12 more)

### Community 23 - "STARS Binarizer Base"
Cohesion: 0.15
Nodes (20): analyze_quality(), basic_stats(), build_timing_json(), count_syllables(), get_audio_duration(), label_stanza(), load_lyrics(), LyricToken (+12 more)

### Community 24 - "TextGrid Processing"
Cohesion: 0.16
Nodes (18): add_bdr(), BaseTxtProcessor, ChineseTxtProcessor, fetch_phonemes(), get_phone(), get_txt_processor_cls(), is_sil_phoneme(), LatinTxtProcessor (+10 more)

### Community 25 - "SSIM Metrics"
Cohesion: 0.2
Nodes (19): analyze_raw_segments(), analyze_timing(), basic_stats(), compare_raw_to_json(), estimate_highlight_bursts(), likely_lyric_position(), load_lyric_tokens(), load_timing_words() (+11 more)

### Community 26 - "TempProbs Analysis"
Cohesion: 0.11
Nodes (7): GradientReverseFunction, GRL, Permute, Construct an LayerNorm object., Apply layer normalization.         :param torch.Tensor x: input tensor, Reshape, Function

### Community 27 - "MIDI Encoding"
Cohesion: 0.15
Nodes (7): BoundaryEditRatio, Metric, The boundary edit distance divided by the total duration of target intervals., A torchmetrics.Metric-like class with similar methods but lowered computing over, 编辑距离除以target的总长度     Edit distance divided by total length of target., StyleAcc, VlabelerEditRatio

### Community 28 - "Signal Processing Utils"
Cohesion: 0.16
Nodes (4): BaseTask, Loss used in RetinaNet for dense detection: https://arxiv.org/abs/1708.02002., sigmoid_focal_loss(), StarsTask

### Community 29 - "MUSA-Net Data Binarization"
Cohesion: 0.18
Nodes (6): _build_mel_config(), _conv3_downsample_len(), MelConfig, MossAudioProcessor, _normalize_mel_config(), ProcessorMixin

### Community 31 - "Single Thread Environment"
Cohesion: 0.18
Nodes (16): clean_lyrics(), load_lyrics(), load_phone_set(), lyrics_to_phonemes(), main(), merge_segments(), preprocess_audio(), STARS Full-Song Alignment ========================= Runs STARS forced alignment (+8 more)

### Community 32 - "Diagonal Metrics"
Cohesion: 0.15
Nodes (6): BatchNorm1dTBC, ConvNorm, EncSALayer, GroupNorm1DTBC, LayerNorm(), Swish

### Community 34 - "GPU Memory Tracking"
Cohesion: 0.14
Nodes (6): BaseBinarizer, IndexedDatasetBuilder, chunked_multiprocess_run(), MUSANBinarizer, process_data(), STARSBinarizer

### Community 35 - "Indexed Datasets"
Cohesion: 0.2
Nodes (9): get_mel2ph(), mel2token_to_dur(), BinarizationError, align_ph(), align_word(), process_item(), # NOTE: if above 3 lines don't work, comment them and uncomment the following 2, align_ph() (+1 more)

### Community 36 - "Schedulers"
Cohesion: 0.13
Nodes (8): ConvBlock, ConvGlobalStacks, ConvLSTMStacks, ConvStacks, :param x: [B, C, T]         :return: [B, C, T], :param x: [B, T, H]         :return: [B, T, H], :param x: [B, T, H]         :return: [B, T, H], :param x: [B, T, H]         :return: [B, T, H]

### Community 37 - "Plot Utilities"
Cohesion: 0.2
Nodes (9): f0_to_coarse(), get_all_ckpts(), get_last_checkpoint(), load_ckpt(), AlignInfer, check_slur_cnt(), get_textgrid(), parse_args() (+1 more)

### Community 38 - "STARS Task Runner"
Cohesion: 0.21
Nodes (13): convert_to_timing_json(), create_metadata(), extract_stars_output(), load_phone_set(), lyrics_to_phonemes(), main(), STARS CPU Inference Wrapper ============================ Converts English lyrics, Extract word-level timing from STARS output. (+5 more)

### Community 39 - "STARS Dataset"
Cohesion: 0.3
Nodes (3): Linear(), MultiheadAttention, Input shape: Time x Batch x Channel          Args:             key_padding_ma

### Community 40 - "Model Utils"
Cohesion: 0.15
Nodes (5): ConvTBC, LinearNorm, :param input: [B, H, T]         :return: input: [B, H, T], Reshape, ResidualLayer

### Community 41 - "Sequence Utils"
Cohesion: 0.22
Nodes (6): dynamic_range_compression_torch(), dynamic_range_decompression_torch(), mel_spectrogram(), MelNet, spectral_de_normalize_torch(), spectral_normalize_torch()

### Community 42 - "Seq2Seq Utils"
Cohesion: 0.23
Nodes (4): BaseDataset, IndexedDataset, Converts a space-separated string of tokens to a list of ids., StarsDataset

### Community 43 - "DTW Metrics"
Cohesion: 0.22
Nodes (4): BaseBinarizer, test_item_names(), train_item_names(), valid_item_names()

### Community 44 - "Loss Functions"
Cohesion: 0.19
Nodes (5): AlignInferDataset, get_mel_len(), PhoneEncoder, Base class for converting from ints to/from human readable strings., Initialize vocabulary with tokens from token_generator.

### Community 45 - "Multi-process Utils"
Cohesion: 0.26
Nodes (3): NoneSchedule, RSQRTSchedule, WarmupSchedule

### Community 46 - "Audio Pitch Extractors"
Cohesion: 0.29
Nodes (4): get_mem_space(), MemTracker, Class used to track pytorch memory usage     Arguments:         detail(bool, d, Track the GPU memory usage

### Community 47 - "TTS Utils"
Cohesion: 0.24
Nodes (4): multiprocess_run(), multiprocess_run_tqdm(), MultiprocessManager, Multiprocessing running chunked jobs.      Examples:     >>> for res in tqdm(

### Community 48 - "Inference Pipeline"
Cohesion: 0.2
Nodes (5): :param outputs:         :return: loss_output: dict, :param sample:         :param batch_idx:         :return: total loss: torch.Te, :param sample:         :param batch_idx:         :param optimizer_idx:, AvgrageMeter, tensors_to_scalars()

### Community 49 - "Audio Base Task"
Cohesion: 0.24
Nodes (7): build_dataloader(), get_textgrid(), onset_offset_to_point_tier(), remove_ignored_phonemes(), test_dataloader(), train_dataloader(), val_dataloader()

### Community 50 - "STARS Config"
Cohesion: 0.3
Nodes (4): Parameters         ----------         pattern : regex to extract pattern, Only supports IntervalTier currently, remove_empty_lines(), TextGrid

### Community 51 - "STARS Encoder"
Cohesion: 0.2
Nodes (5): librosa_pad_lr(), librosa_wav2spec(), compute right padding (final frame) or both sides padding (first and final frame, Ensures that segments without voice in the waveform remain no longer than a, trim_long_silences()

### Community 52 - "STARS Vocoder"
Cohesion: 0.31
Nodes (9): basic_stats(), diagnose(), extract_words(), main(), percentile(), print_report(), Print formatted diagnostic report., Extract flat word list from either format.     Returns (list of word dicts, form (+1 more)

### Community 53 - "MERT DTW Alignment"
Cohesion: 0.2
Nodes (3): BaseDataset, Return an example's size as a float or tuple. This value is used when         f, Return an ordered list of indices. Batches will be constructed based         on

### Community 54 - "VAD Processing"
Cohesion: 0.22
Nodes (4): ConvGLUStacks, Permute, :param x: [T, B, C]         :return: [T, B, C], :param x: [B, T, H]         :return: [B, T, H]

### Community 56 - "Phoneme Conversion Scripts"
Cohesion: 0.31
Nodes (6): add_gaussian_noise(), get_filter_1d(), get_gaussian_kernel_1d(), get_hann_kernel_1d(), get_triangle_kernel_1d(), get_soft_label_filter()

### Community 57 - "Debug Alignment Tools"
Cohesion: 0.29
Nodes (5): get_embedding(), Input is expected to be of size [bsz x seqlen]., Maximum number of supported positions., This module produces sinusoidal positional embeddings of any length.      Padd, SinusoidalPositionalEmbedding

### Community 59 - "Test Audio Files"
Cohesion: 0.29
Nodes (4): DDP, # TODO: DDPSink is currently enabled for unused parameter detection and, Override the forward call in lightning so it goes to training and validation ste, DistributedDataParallel

### Community 61 - "Model Init Utils"
Cohesion: 0.38
Nodes (3): fused_add_tanh_sigmoid_multiply(), script_function(), WN

### Community 62 - "Token Loss Computation"
Cohesion: 0.38
Nodes (3): extract_pitch(), extract_pitch_simple(), get_pitch_extractor()

### Community 64 - "AdamW Optimizer"
Cohesion: 0.48
Nodes (4): create_window(), gaussian(), Adapted from https://github.com/Po-Hsun-Su/pytorch-ssim, _ssim()

### Community 65 - "Gradient Clipping"
Cohesion: 0.47
Nodes (5): convert_mp3_to_wav(), main(), Convert MP3 to 16kHz mono WAV using imageio-ffmpeg binary., Load WAV with soundfile and return duration in seconds., verify_wav()

### Community 68 - "MoE Layer Routing"
Cohesion: 0.47
Nodes (5): accelerated_dtw(), dtw(), Computes Dynamic Time Warping (DTW) of two sequences in a faster way.     Inste, Computes Dynamic Time Warping (DTW) of two sequences.      :param array x: N1*, _traceback()

### Community 69 - "Ngram Repeat"
Cohesion: 0.6
Nodes (5): align_from_distances(), cal_localnorm_dist(), get_local_context(), LoNDTWDistance(), time_warp()

### Community 74 - "Learning Rate Scheduler"
Cohesion: 0.83
Nodes (3): count_syllables(), main(), split_syllables()

### Community 75 - "Data Parallelism"
Cohesion: 0.83
Nodes (3): analyze_timing_json(), audit_stars_outputs(), main()

## Knowledge Gaps
- **233 isolated node(s):** `Convert MP3 to 16kHz mono WAV using imageio-ffmpeg binary.`, `Load WAV with soundfile and return duration in seconds.`, `Estimate segment-local lyric range from song position with generous overlap.`, `Drop near-duplicate overlap words, preferring later segment context.`, `Load MOSS-Audio-4B-Instruct model and processor in CPU/float32 mode.      Return` (+228 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StarsTask` connect `Signal Processing Utils` to `Decoding Utils`, `STARS Utility Functions`, `Seq2Seq Utils`, `Loss Functions`, `Multi-process Utils`, `Mixed Precision`, `Audio Resampling`, `Dataset Utilities`, `Audio Base Task`, `TTS Utils`, `Lyrics Audio HMM Aligner`, `MIDI Encoding`, `G2P Phoneme Conversion`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Trainer` connect `DDP Training Utils` to `MOSS-Audio Finetuning Pipeline`, `STARS Architecture Config`, `Test Audio Files`, `G2P Phoneme Conversion`, `Data Collation`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `STARS` connect `Lyrics Audio HMM Aligner` to `Plot Utilities`, `Transformer Layer Modules`, `STARS Core Model`, `Loss Functions`, `Audio Pitch Extractors`, `Convolution U-Net Blocks`, `Mixed Precision`, `Signal Processing Utils`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `StarsTask` (e.g. with `BaseTask` and `BaseConcatDataset`) actually correct?**
  _`StarsTask` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `LayerNorm` (e.g. with `LambdaLayer` and `ResidualBlock`) actually correct?**
  _`LayerNorm` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `ConvBlocks` (e.g. with `LayerNorm` and `PitchDecoder`) actually correct?**
  _`ConvBlocks` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Trainer` (e.g. with `BaseTask` and `DDP`) actually correct?**
  _`Trainer` has 4 INFERRED edges - model-reasoned connections that need verification._