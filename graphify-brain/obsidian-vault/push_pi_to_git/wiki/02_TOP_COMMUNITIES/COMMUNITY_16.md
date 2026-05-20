---
type: community/narrative
community_id: 16
label: "llm (16 functions + 14 concepts)"
size: 30
cohesion: 0.12
character: mixed
---

# Community 16: llm (16 functions + 14 concepts)

> **30 nodes** | **Cohesion: 0.12** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 16 is graphify's **orchestration engine** — the module that bridges raw code analysis with Large Language Models. Living in `llm.py`, this mixed community of 16 functions and 14 concepts is where graphify actually talks to Claude, GPT, and compatible APIs to extract semantic meaning from code. Think of it as the phone switchboard connecting graphify's file scanner to the AI operators who understand what the code means.

The hub is `llm.py` (14 connections). **extract_files_direct()** (8 connections) is the primary entry point: it takes a list of file contents, formats them into a prompt, sends them to the LLM, and parses the structured response into graph nodes and edges. **extract_corpus_parallel()** (5 connections) handles larger codebases by splitting work across multiple LLM calls — sending chunks in parallel and merging the results.

The API abstraction layer is handled by **_call_claude()** (5 connections) and **_call_openai_compat()** (5 connections), which wrap the Anthropic and OpenAI API calls respectively. These handle authentication, rate limiting, error handling, and response parsing. **_resolve_max_tokens()** (4 connections) determines the appropriate output token limit based on the GRAPHIFY_MAX_OUTPUT_TOKENS environment variable or sensible defaults.

The chunking and packing logic lives in **_pack_chunks_by_tokens()** (5 connections), which groups files into LLM-sized chunks respecting token budgets. **_parse_llm_json()** (5 connections) handles the notoriously tricky task of parsing JSON from LLM responses — handling trailing commas, markdown fences, truncated output, and other common failure modes. **_read_files()** (4 connections) loads file contents from disk into the pipeline.

With cohesion 0.12, this is one of the tighter communities — the LLM pipeline functions call each other (pack → call → parse) in a data flow, creating more internal connections than a flat collection of utilities. No cross-community edges, which makes sense for a module that communicates with external APIs rather than internal graph modules.

**Why it matters:** This is where graphify becomes intelligent. Without this community, graphify could only extract structural information (file contains class contains method). With the LLM layer, it can extract semantic meaning: design patterns, architectural intent, and relationships that aren't explicit in the syntax.

## For LLMs

### Data

- **ID:** 16
- **Label:** llm (16 functions + 14 concepts)
- **Size:** 30 nodes
- **Cohesion:** 0.12
- **Character:** mixed
- **Primary file:** llm.py

### Top Nodes by Connectivity

- **llm.py** — 14 connections [code]
- **llm.py** — 14 connections [code]
- **extract_files_direct()** — 8 connections [code]
- **extract_corpus_parallel()** — 5 connections [code]
- **_parse_llm_json()** — 5 connections [code]
- **_pack_chunks_by_tokens()** — 5 connections [code]
- **_call_openai_compat()** — 5 connections [code]
- **_call_claude()** — 5 connections [code]
- **_resolve_max_tokens()** — 4 connections [code]
- **_read_files()** — 4 connections [code]

**No cross-community edges found — this community is self-contained.**
