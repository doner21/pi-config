---
artifact_type: RESEARCH
role: RESEARCHER
run_id: run-2026-05-13-export-stall
context_saturation_estimate: "~25%"
aliased_from: ATT_4_RESEARCH.md
---

This is the LATEST alias. Read ATT_4_RESEARCH.md for the full report.

Summary:
- GPU probe bug CONFIRMED: ffmpeg -encoders lists compiled-in encoders, not runtime-available
- h264_amf encoder args researched from ffmpeg -h encoder=h264_amf
- Streaming fallback BROKEN: tries to re-encode corrupt video_only.mp4
- 12 locations across 3 files need AMF support added
- resolveGpuConfig('auto', caps) returns h264_nvenc on AMD (false positive)
