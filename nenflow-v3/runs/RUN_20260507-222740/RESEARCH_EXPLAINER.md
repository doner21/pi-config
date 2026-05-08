# Research Explainer: Singing Forced Alignment Landscape

## What We Found

The open-source landscape for singing forced alignment is **surprisingly mature**. You have real, working alternatives to AudioShake.

## The Short Version

**SOFA** ([github.com/qiuqiao/SOFA](https://github.com/qiuqiao/SOFA)) is the closest thing to AudioShake's singing aligner in open source. It's a purpose-built forced aligner for singing voice, with pretrained models, MIT license, and 219 GitHub stars. You can download it and try it today.

**STARS** ([github.com/gwx314/STARS](https://github.com/gwx314/STARS)) goes further -- it does transcription, alignment, and style annotation in one pipeline. It actually integrates SOFA as its alignment component. 79 stars, pretrained checkpoints available.

## What You Should Do Next

### Immediate: Try SOFA

```bash
git clone https://github.com/qiuqiao/SOFA
# Download a pretrained .ckpt from their GitHub Discussions
# Run inference on a few of your singing tracks
python infer.py --ckpt checkpoint.ckpt --folder your_audio/
```

Compare the output (TextGrid files) against AudioShake's alignment on the same tracks. This gives you a baseline in under an hour.

### If SOFA works well: Try STARS

STARS gives you transcription + alignment + style annotation in one shot. Clone [gwx314/STARS](https://github.com/gwx314/STARS), use their pretrained checkpoints.

### Key preprocessing tip

AudioShake's secret sauce includes stem separation BEFORE alignment. Use Demucs or UVR to isolate vocals first, then feed the clean vocal to SOFA/STARS.

### If neither matches AudioShake quality

Fine-tune `facebook/mms-300m` on GTSinger ([GitHub](https://github.com/AaronZ345/GTSinger)) -- 16 hours of singing with manual phoneme alignments. Then use [ctc-forced-aligner](https://github.com/MahmoudAshraf97/ctc-forced-aligner) for inference.

## What's Realistic

| Approach | Quality vs AudioShake | Effort |
|----------|----------------------|--------|
| Raw CTC/MMS (current) | ~50-60% | Done |
| SOFA with vocal isolation | ~70-85% | 1-2 hours |
| STARS full pipeline | ~75-85% | 2-4 hours |
| Fine-tuned MMS on GTSinger | ~75-90% | Days |
| Custom trained model | Potentially competitive | Weeks-months |

**Realistic best case**: SOFA/STARS + vocal stem isolation gets you to 70-85% of AudioShake quality on clean singing vocals. The last 15-30% likely requires AudioShake's data scale and proprietary engineering.

## What AudioShake Likely Does (That's Hard to Replicate)

1. **Stem separation as preprocessing** -- you can replicate this with Demucs/UVR
2. **Massive proprietary singing dataset** -- you can approximate with GTSinger/M4Singer
3. **Production engineering** -- API latency, streaming, error handling you'd need to build yourself

## Papers Worth Reading

- STARS paper: [arXiv 2507.06670](https://arxiv.org/abs/2507.06670) -- unified singing alignment framework
- VocalParse: [arXiv 2605.04613](https://arxiv.org/abs/2605.04613) -- very new (May 6, 2026), uses large audio language models

## Bottom Line

You don't need to build from scratch. SOFA exists, works, and is MIT-licensed. Try it first. If you need more, STARS gives you the full pipeline. Only go to custom training if those don't meet your quality bar.
