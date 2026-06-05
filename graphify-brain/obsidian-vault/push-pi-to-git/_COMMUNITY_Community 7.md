---
type: community
cohesion: 0.07
members: 44
---

# Community 7

**Cohesion:** 0.07 - loosely connected
**Members:** 44 nodes

## Members
- [[A file larger than the budget can't be split — it goes alone in a chunk.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[A single chunk raising should be logged but not abort the run.     Other chunks]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[A single file that truncates can't be split further — surface a     warning and]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Build a deterministic fake extraction result for a chunk.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Build a stub extraction result with a controllable finish_reason.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[End-to-end extract_corpus_parallel routes through adaptive retry,     so a chu]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Files in the same directory should land in the same chunk when they fit.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Force the chars4 fallback so packing math is deterministic regardless     of w]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[If everything truncates, retries stop at max_depth — partial result     kept wi]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Many small files should land in a single chunk, not one chunk per file.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[No retry when finish_reason='stop' — single call, result passes through.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Tests for token-aware chunking and parallel chunk execution in graphify.llm.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[When even the half-chunk truncates, split again. With 8 files and a     truncat]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[When the next file would push the chunk past the budget, start a new chunk.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[When tiktoken is installed, the estimator should call into it for     accurate]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[With max_concurrency  1, total wall time should be ~max(chunk times),     not]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[With the default token_budget, many tiny files pack into one chunk.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[Without tiktoken installed, the estimator falls back to chars4.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[_stub_chunk_result()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[_stub_with_finish()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[finish_reason='length' triggers split-in-half. Both halves succeed     on the s]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[max_concurrency=1 should run sequentially (no thread pool).]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[no_tokenizer()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_adaptive_retry_caps_at_max_depth()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_adaptive_retry_recurses_for_persistent_truncation()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_adaptive_retry_returns_directly_when_not_truncated()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_adaptive_retry_single_file_truncation_does_not_recurse()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_adaptive_retry_splits_when_finish_reason_length()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_chunking.py]] - code - backups/RUN_20260505-205658/sources/graphify/tests/test_chunking.py
- [[test_chunking.py_1]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_continues_after_chunk_failure()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_legacy_mode_when_token_budget_is_none()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_runs_chunks_concurrently()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_sequential_when_max_concurrency_is_one()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_token_budget_default_packs_files()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_corpus_parallel_uses_adaptive_retry()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_estimate_file_tokens_falls_back_to_chars_when_no_tokenizer()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_estimate_file_tokens_uses_tiktoken_when_available()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_pack_chunks_groups_by_directory()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_pack_chunks_oversized_file_gets_its_own_chunk()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_pack_chunks_packs_small_files_together()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_pack_chunks_rejects_non_positive_budget()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[test_pack_chunks_starts_new_chunk_when_budget_would_overflow()]] - code - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py
- [[token_budget=None should fall back to legacy fixed-count chunking.]] - rationale - nenflow-v3/runs/RUN_20260505-205658/research_tmp/graphify/tests/test_chunking.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_7
SORT file.name ASC
```
