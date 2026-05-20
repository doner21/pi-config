---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260511-195601
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~6%"
created_at: "2026-05-11"
project_path: "C:/Users/doner/local_model_reaserch"
---

# Intake: Rebuild Local Google Gemma Model Configuration for Pi Harness

## Raw User Prompt

> I need to do some work on the Google Gemma4 model, which is a local model we have in our list of Pi code models we can use on this harness. The current Gemma4 iterations don't work at all very well on this model, they're incredibly slow. And, yeah, there seems to be something significantly wrong. What I would like you to do is delete those models and start again. I want you to configure Gemma4 so we have the quant right and that we do anything like a turbo quant to compress the KB cache. I want Gemma4 27B, make sure of experts model to be hosted here. I already have a llama installed. So we can dock it in our llama. But I don't want you to take what I'm saying as the rule of thumb. Please spawn a research model, to go out and find the best way we should configure Gemmaform for a harness-like Pi code. Find out about turbo-quants and KV caching and what quant range we should set this to and from that research create a plan and then spawn an executor to take care of that plan.Please ensure that this prompt is made into an intake dot MD before spawning any agents to activate the plan. As the intake dot MD will hold our invariance and constraints, our intent and our project to tractors and goals.

## Task Summary

Research and rebuild the local Google Gemma/Gemma4 configuration used by this Pi coding harness because the existing Gemma4 iterations are very slow or broken. Create a research-backed plan for the correct local model variant, quantization, KV-cache compression/turbo-quant style settings, and deployment path via the existing local llama/Ollama-style runtime where appropriate. Then execute the plan safely.

## Task Type

- Local LLM/runtime configuration
- Model inventory and cleanup
- Research-backed technical planning
- Potentially destructive system operation: local model deletion/replacement
- Pi harness model configuration

## User Intent

The user wants a working, performant local Gemma-family 27B model configured for use as a Pi code model. They specifically want existing faulty Gemma4 iterations removed and replaced with a well-chosen quant/configuration based on current best practices, not on assumptions in the prompt.

## Goal Attractor

A local Gemma-family 27B model is installed/configured so Pi can use it reliably and with acceptable performance for coding-harness workflows, with appropriate quantization and KV-cache/memory settings for the host machine.

## Detractors / Failure Modes

- Blindly assuming "Gemma4" exists or is the correct official model name.
- Deleting non-Gemma models, especially the user's existing llama installation.
- Removing current models before inventorying/snapshotting the runtime state.
- Selecting an overly large/slow quantization for local hardware.
- Selecting an unsupported quant/KV-cache configuration for the installed runtime.
- Confusing model weight quantization with KV-cache quantization.
- Pulling a model that cannot fit in local RAM/VRAM or cannot run acceptably.
- Breaking Pi's model list or provider config.
- Overwriting configuration without a backup.

## Constraints

1. Create this `intake.md` before spawning any agents. (Satisfied by this file.)
2. Use research before planning/execution.
3. Treat the user-provided terms "Gemma4", "Gemmaform", "turbo quant", "KB cache" as possibly imprecise; verify terminology and available model names.
4. Preserve any existing llama install and do not delete non-Gemma models.
5. Destructive cleanup is limited to faulty Gemma/Gemma4/Gemma-family local model entries after inventory and only if replacement path is clear.
6. Prefer compatibility with the current Pi harness and local runtime over theoretical optimality.
7. Keep artifacts and decisions auditable.
8. If runtime lacks support for a desired feature such as KV-cache quantization, document fallback options rather than forcing unsupported config.

## Invariants

- Do not touch unrelated local models, especially llama.
- Do not fabricate that Gemma4 exists; verify official/current availability.
- Do not run broad destructive commands such as deleting all model blobs.
- Back up or record relevant Pi/runtime model config before editing.
- Research must explicitly cover:
  - current Google Gemma 27B availability/naming;
  - whether the relevant model is MoE or dense;
  - suitable GGUF/Ollama/llama.cpp quantization choices for coding use;
  - KV-cache quantization/compression support and tradeoffs;
  - any "turbo quant" terminology or closest real equivalent;
  - recommended context/window settings for Pi coding workflows.
- Executor must produce a report of commands run, files changed, models removed/installed, and remaining manual steps.

## Success Criteria

- Existing local Gemma/Gemma4 configuration is inventoried and diagnosed.
- Research identifies the best supported model family/variant and quantization strategy for this environment.
- A plan is produced before execution.
- The executor safely removes only obsolete/faulty Gemma-family entries when appropriate.
- A new Gemma-family 27B local model configuration is installed or prepared with clear commands if installation requires user-provided assets/network.
- Pi harness config is updated or a precise patch/command is produced.
- Final verification confirms model presence/configuration and that llama remains intact.

## Ambiguities

- "Gemma4" may refer to a future/misnamed Gemma release; official available models may be Gemma 3/Gemma 3n/etc.
- "make sure of experts model" may mean mixture-of-experts, but Gemma 27B variants may be dense rather than MoE.
- "dock it in our llama" may refer to Ollama or llama.cpp integration.
- Hardware capacity (CPU/GPU/RAM/VRAM) is unknown and must be inspected before selecting quant.

## Routing Decision

Recommended next step: `RESEARCH`, then `PLAN`, then `EXECUTE`, then `VERIFY`.
