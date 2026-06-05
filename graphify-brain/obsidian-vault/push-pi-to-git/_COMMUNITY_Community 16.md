---
type: community
cohesion: 0.12
members: 30
---

# Community 16

**Cohesion:** 0.12 - loosely connected
**Members:** 30 nodes

## Members
- [[Append a chunk result into the running merged accumulator.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Call Anthropic Claude directly (not via OpenAI compat layer).]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Call any OpenAI-compatible API (Kimi, OpenAI, etc.) and return parsed JSON.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Estimate USD cost for a given token count using published pricing.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Estimate the prompt-token cost of a single file under `_read_files` rules.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Extract a chunk; if the response is truncated (`finish_reason=length`),     s]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Extract a corpus in chunks, merging results.      Chunking strategy]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Extract semantic nodesedges from a list of files using the given backend.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Greedily pack files into chunks that fit a token budget.      Files are first]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Honour GRAPHIFY_MAX_OUTPUT_TOKENS env var override, else use backend default.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Return a tiktoken encoder for accurate token counts, or None if tiktoken     is]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Return file contents formatted for the extraction prompt.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Return the name of whichever backend has an API key set, or None.      Priorit]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[Strip optional markdown fences and parse JSON. Returns empty fragment on failure]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_call_claude()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_call_openai_compat()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_estimate_file_tokens()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_extract_with_adaptive_retry()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_get_tokenizer()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_merge_into()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_pack_chunks_by_tokens()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_parse_llm_json()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_read_files()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[_resolve_max_tokens()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[detect_backend()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[estimate_cost()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[extract_corpus_parallel()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[extract_files_direct()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py
- [[llm.py]] - code - backups/RUN_20260505-205658/sources/graphify/graphify/llm.py
- [[llm.py_1]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/graphify/llm.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_16
SORT file.name ASC
```
