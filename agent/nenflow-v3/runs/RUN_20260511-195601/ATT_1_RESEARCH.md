---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260511-195601
context_saturation_estimate: "~18%"
---

# Research: Local Gemma-family 27B/26B Configuration for Pi Harness

## Investigation Scope

Investigated the current official Gemma-family naming, local Ollama/GGUF availability, MoE vs dense variants, local hardware/runtime state, current Pi model configuration, KV-cache compression options, and the user's terms "Gemma4/Gemmaform/turbo quant/KB cache". No deletion or configuration changes were performed.

## Key Findings

### 1. Terminology correction: official current names are Gemma 4, not Gemmaform; no official "Gemma 4 27B"

- Google AI docs list **Gemma 4** sizes as **E2B, E4B, 26B A4B, and 31B**; not 27B.
- The **Gemma 4 26B A4B** variant is the MoE/workstation model; Google/Ollama describe it as **26B total with ~4B active parameters**.
- The **Gemma 4 31B** variant is **dense**.
- **Gemma 3** has a **27B** model, with 128K context, but that is Gemma 3, not Gemma 4, and it is not the MoE variant the user is describing.

Evidence:
- Google Gemma 4 overview: https://ai.google.dev/gemma/docs/core
- Google Gemma 4 model card: https://ai.google.dev/gemma/docs/core/model_card_4
- Ollama Gemma 4 page: https://ollama.com/library/gemma4:26b
- Ollama Gemma 3 27B page: https://ollama.com/library/gemma3:27b

### 2. Current local runtime is Ollama, already wired into Pi

Local environment evidence:

- OS: Windows 11 Home 64-bit (`10.0.26200`) via Git Bash/MINGW.
- CPU: `AMD RYZEN AI MAX+ 395 w/ Radeon 8060S`, 16 cores / 32 logical processors.
- RAM: Windows reports ~63.65 GB visible physical memory; physical modules total 128 GB.
- GPU: `AMD Radeon(TM) 8060S Graphics`; no `nvidia-smi`; no NVIDIA GPU detected.
- Ollama installed at `C:\Users\doner\AppData\Local\Programs\Ollama\ollama`, version `0.20.7`.
- `llama-server` / `llama-cli` were not on PATH and no local llama.cpp executable was found under `~` by a shallow search.
- Listening ports:
  - `11434`: Ollama.
  - `1234`: LM Studio.
  - `8080`: Python `http.server`, not llama.cpp.

Current Ollama env/log evidence:
- Current shell has `OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q8_0`, `OLLAMA_NUM_PARALLEL=1`.
- Ollama logs also show `OLLAMA_FLASH_ATTENTION:true`, `OLLAMA_KV_CACHE_TYPE:q8_0`, `OLLAMA_NUM_PARALLEL:1`, `OLLAMA_VULKAN:false`.

### 3. Current local Gemma inventory contains duplicate/aliased Gemma 4 entries only

`ollama list` / `/api/tags` shows:

| Local name | Size | Digest | Notes |
|---|---:|---|---|
| `gemma4:26b-200k` | 17 GB | `fb457d02...` | custom/alias with `num_ctx 204800` |
| `gemma4-200k:latest` | 17 GB | `fb457d02...` | same digest as above |
| `gemma4:31b` | 19 GB | `6316f062...` | dense 31B Q4_K_M |
| `gemma4:31b-it-q4_K_M` | 19 GB | `6316f062...` | same digest as above |
| `gemma4:26b` | 17 GB | `5571076f...` | official/default 26B MoE Q4_K_M |

`ollama show` evidence:
- `gemma4:26b` and `gemma4:26b-200k`: architecture `gemma4`, parameters `25.8B`, context length `262144`, quantization `Q4_K_M`, capabilities include `vision`, `tools`, `thinking`.
- `gemma4:31b`: architecture `gemma4`, parameters `31.3B`, quantization `Q4_K_M`.
- `ollama show --modelfile gemma4:26b-200k` shows `PARAMETER num_ctx 204800`; plain `gemma4:26b` does **not** include that forced `num_ctx` parameter.

### 4. Current Pi config likely selects the slow/bad entries

Pi custom model config file: `C:\Users\doner\.pi\agent\models.json`

Relevant current entries:

- `gemma4:26b-200k`
  - name: `Local Gemma 4 26B (200k, Thinking)`
  - `contextWindow`: `204800`
  - `maxTokens`: `32768`
  - `reasoning`: `true`
- `gemma4:31b-it-q4_K_M`
  - name: `Local Gemma 4 31B Q4 Instruct`
  - `contextWindow`: `131072`
  - `reasoning`: `true`

Risk: the 200K alias forces a very large runtime context, which can make a 26B local model feel broken/very slow. The 31B dense model is also the wrong architecture if the user wants the "experts" model and is heavier than the 26B A4B MoE.

Pi custom models docs confirm `~/.pi/agent/models.json` is the correct integration point for local Ollama/OpenAI-compatible models, with Ollama provider settings like `baseUrl: http://localhost:11434/v1`, `api: openai-completions`, and compatibility flags. Source: local Pi docs `docs/models.md`.

### 5. Recommended runtime path: Ollama first; llama.cpp only if more control is required

Best fit for this harness right now:

- **Use Ollama** because it is already installed, running, and configured in Pi.
- Use the official/current Ollama tag **`gemma4:26b`** for the Gemma 4 MoE/A4B model.
- Avoid the current `gemma4:26b-200k` forced context alias for default Pi coding use.

Alternative:

- Use `llama.cpp`/`llama-server` only if the executor needs finer control than Ollama exposes, e.g. separate K/V cache type flags (`--cache-type-k`, `--cache-type-v`), custom quant files (Q5/Q6), or an OpenAI endpoint on `localhost:8080/v1`.
- Google's llama.cpp docs show Gemma GGUF can be run via `llama-cli -hf ...` and served via `llama-server ...` with OpenAI endpoint support: https://ai.google.dev/gemma/docs/integrations/llamacpp

### 6. Quantization recommendation for local 26B coding use

For this machine and Pi coding harness workflows:

- **Default recommended model weight quant:** `Q4_K_M` via Ollama `gemma4:26b`.
  - It is already present locally at ~17 GB.
  - It is the official Ollama default for Gemma 4 26B and should fit the host.
  - It is the safest compatibility choice.
- **If quality is inadequate and runtime supports custom GGUF:** consider `Q5_K_M` or `Q6_K` from a reputable GGUF repo such as `bartowski/google_gemma-4-26B-A4B-it-GGUF` or `unsloth/gemma-4-26B-A4B-it-GGUF`; expect larger disk/RAM and slower load/generation.
- **Avoid Q8/bf16 for the default Pi model** unless the user explicitly prefers quality over speed/RAM; ggml-org offers Q8_0/bf16 for Gemma 4 26B/31B, but these are heavier and not needed for the first stable fix.
- **Avoid Q2/Q3/IQ2-class quants for coding** unless the goal is maximum speed/minimum memory; quality risk is too high for code-agent workflows.

HF/GGUF availability evidence:
- `ggml-org/gemma-4-26B-A4B-it-GGUF` exposes `Q4_K_M`, `Q8_0`, and `bf16` GGUF files.
- `bartowski/google_gemma-4-26B-A4B-it-GGUF` exposes many quants including `Q4_K_M`, `Q5_K_M`, `Q6_K`, and `Q8_0`.
- `unsloth/gemma-4-26B-A4B-it-GGUF` exposes many quants including Q4/Q5/Q6 and MXFP4 MoE variants.

### 7. KV-cache quantization/compression: real setting is KV cache, not "KB cache"

The user likely meant **KV cache** (Key/Value attention cache), not "KB cache".

Current Ollama support:

- Ollama source exposes `OLLAMA_KV_CACHE_TYPE` and `OLLAMA_FLASH_ATTENTION`.
- Ollama source supports KV cache types `f16`, `q8_0`, and `q4_0` for GGUF; quantized KV cache requires Flash Attention.
- Ollama source estimates per-element KV memory roughly as:
  - `f16`: 2 bytes/default
  - `q8_0`: 1 byte (~half f16)
  - `q4_0`: 0.5 bytes (~quarter f16)

Evidence:
- Ollama source `envconfig/config.go`: `OLLAMA_KV_CACHE_TYPE`, `OLLAMA_FLASH_ATTENTION`, `OLLAMA_CONTEXT_LENGTH`.
- Ollama source `fs/ggml/ggml.go`: `SupportsKVCacheType` accepts `q8_0`, `q4_0`; comments/warnings require flash attention for quantized KV.

llama.cpp support:

- `llama-server` supports `--cache-type-k TYPE` / `--cache-type-v TYPE` with values including `f32`, `f16`, `bf16`, `q8_0`, `q4_0`, `q4_1`, `iq4_nl`, `q5_0`, `q5_1`; default is `f16`.
- It also exposes `--ctx-size` and `--flash-attn`.
- Source: llama.cpp server README: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md

Practical recommendation:

- Keep `OLLAMA_FLASH_ATTENTION=1` and `OLLAMA_KV_CACHE_TYPE=q8_0` as the safe default.
- Do **not** jump to `q4_0` KV cache for default coding-agent use unless memory pressure demands it or long context is absolutely required; `q4_0` saves more memory but has greater quality/stability risk.
- Prefer reducing default context to 32K/64K before using aggressive KV quantization.

### 8. "TurboQuant" has a real research meaning, but it is not a current Ollama/llama.cpp production flag

- TurboQuant is a 2025 research method: **"TurboQuant: Online Vector Quantization with Near-optimal Distortion Rate"** (`arXiv:2504.19874`). The abstract claims KV-cache quality neutrality around 3.5 bits/channel and marginal degradation around 2.5 bits/channel.
- There is a llama.cpp discussion about integrating TurboQuant, but current llama.cpp documented server flags do **not** list a `turbo`, `tq3`, or `tq4` cache type; supported current cache types are the standard GGML types listed above.
- Therefore the closest real production equivalent today is **KV-cache quantization** (`q8_0` safest; `q4_0` more aggressive) plus right-sizing `num_ctx`.

Sources:
- arXiv TurboQuant: https://arxiv.org/abs/2504.19874
- llama.cpp discussion: https://github.com/ggml-org/llama.cpp/discussions/20969
- llama.cpp server flags: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md

## Constraints Identified for Planner/Executor

1. Do not delete any non-Gemma model or any llama/LM Studio installation.
2. Do not delete model blobs directly. If cleanup is approved, use `ollama rm <tag>` only after recording `ollama list`, `ollama show`, and Pi config backups.
3. Preserve `gemma4:26b` unless deliberately replacing it with the same official tag; it is the closest correct installed model for "Gemma4 experts".
4. Treat `gemma4:26b-200k` and `gemma4-200k:latest` as suspect because they force `num_ctx 204800`.
5. Treat `gemma4:31b` / `gemma4:31b-it-q4_K_M` as dense 31B, not the MoE/expert model.
6. If updating Pi config, back up `C:/Users/doner/.pi/agent/models.json` first.
7. Use `~/.pi/agent/models.json` provider config for Pi; keep Ollama compatibility flags `supportsDeveloperRole:false`, `supportsReasoningEffort:false`, `maxTokensField:"max_tokens"`.
8. Use `contextWindow` metadata in Pi conservatively; do not advertise 200K as the default local coding model unless runtime testing proves acceptable.
9. Keep `OLLAMA_FLASH_ATTENTION=1` when using `OLLAMA_KV_CACHE_TYPE=q8_0` or `q4_0`.
10. Do not assume "TurboQuant" is configurable in Ollama 0.20.7; document it as unavailable/future unless a newer runtime provides explicit support.

## Existing Patterns

- Pi local models are configured in `C:/Users/doner/.pi/agent/models.json` under provider `ollama` with OpenAI-compatible endpoint `http://localhost:11434/v1`.
- Current provider compatibility is appropriate for Ollama: `api: openai-completions`, `apiKey: ollama`, `supportsDeveloperRole:false`, `supportsReasoningEffort:false`, `maxTokensField:"max_tokens"`.
- Current Pi default model in `settings.json` is `deepseek-v4-pro`, not Gemma, so changing Gemma entries should not affect the global default unless separately requested.

## Recommendations / Recommended Plan Direction

Concise direction for the Planner:

1. **Standardize on `gemma4:26b`** as the local Gemma 4 MoE/A4B coding model.
2. **Remove or hide the forced 200K aliases from Pi config**; optionally remove their Ollama tags after backup/inventory.
3. **Do not use the 31B dense variant as the user's requested "experts" model**; keep/remove only according to storage preference after confirming no dependency.
4. **Set Pi's Gemma entry to a conservative context**: start at **32K**; optionally provide a separate **64K** long-context alias. Avoid 128K/200K by default.
5. **Keep weight quant at `Q4_K_M` first**. Consider Q5_K_M/Q6_K only in a second pass via custom GGUF if Q4 quality is inadequate.
6. **Keep KV cache at `q8_0` with Flash Attention enabled**. Consider `q4_0` only for explicit long-context/memory-pressure mode.
7. Verify with a small Ollama/Pi generation after config changes and ensure llama/LM Studio remain untouched.

## Unknowns Remaining

- Actual tokens/sec for `gemma4:26b` under Pi was not benchmarked in this research phase to avoid loading/running heavy models unnecessarily.
- Whether Ollama is currently using CPU, Vulkan, HIP/ROCm, or another backend during Gemma inference was not proven from current logs because no model was loaded during inspection; logs show `OLLAMA_VULKAN:false` and no NVIDIA GPU.
- Exact Windows/AMD unified-memory split may require AMD tooling for deeper VRAM diagnostics; Windows reports 128 GB installed but ~63.65 GB visible to OS.
- The user's intended meaning of "llama installed" remains ambiguous: llama.cpp CLI was not found, but Ollama and LM Studio are installed/running.
