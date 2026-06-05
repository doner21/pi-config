---
type: community/narrative
community_id: 7
label: "test_chunking (23 functions + 21 concepts)"
size: 44
cohesion: 0.07
character: mixed
---

# Community 7: test_chunking (23 functions + 21 concepts)

> **44 nodes** | **Cohesion: 0.07** (loosely connected — these functions share a file but do different things) | **Character: mixed**

## For Humans

Community 7 is the **test suite for the LLM chunking engine** — the module that decides how to slice a codebase into bite-sized pieces for AI consumption. If graphify's LLM integration (Community 16) is the chef cooking the meal, this community is the team testing whether the portions are the right size. Living in `test_chunking.py`, it's a mixed community of 23 functions and 21 concepts.

The hub is `test_chunking.py` (22 connections), organizing tests for the `_pack_chunks_by_tokens()` function and its relatives. Each test has exactly 3 connections — focused, single-purpose assertions. `test_pack_chunks_starts_new_chunk_when_budget_would_overflow()` verifies that when a file pushes past the token budget, it gets its own chunk rather than being crammed in. `test_pack_chunks_packs_small_files_together()` checks the opposite: small files should be bundled to maximize each LLM call. `test_pack_chunks_oversized_file_gets_its_own_chunk()` handles the case where a single file exceeds the entire budget — it gets a dedicated chunk alone. `test_pack_chunks_groups_by_directory()` tests the directory-awareness feature: files in the same directory should stay together when possible, preserving locality.

Token estimation is tested through `test_estimate_file_tokens_uses_tiktoken_when_available()` (which uses OpenAI's tiktoken library for accurate counts) and `test_estimate_file_tokens_falls_back_to_chars_when_no_tokenizer()` (which falls back to a simple character-count heuristic when tiktoken isn't installed). `test_corpus_parallel_uses_adaptive_retry()` tests the resilience layer: when an LLM call fails, the system retries with backoff.

The concept nodes capture internal knowledge like "Force the chars/4 fallback so packing may split differently" — a testing technique that makes the system use the less-accurate fallback path to ensure it works even without tiktoken.

With cohesion 0.07, these are loosely connected — each test exercises a different facet of the chunking system. No cross-community connections, which is ideal for a focused test suite that shouldn't have external dependencies.

## For LLMs

### Data

- **ID:** 7
- **Label:** test_chunking (23 functions + 21 concepts)
- **Size:** 44 nodes
- **Cohesion:** 0.07
- **Character:** mixed
- **Primary file:** test_chunking.py

### Top Nodes by Connectivity

- **test_chunking.py** — 22 connections [code]
- **test_chunking.py** — 22 connections [code]
- **test_pack_chunks_starts_new_chunk_when_budget_would_overflow()** — 3 connections [code]
- **test_pack_chunks_packs_small_files_together()** — 3 connections [code]
- **test_pack_chunks_oversized_file_gets_its_own_chunk()** — 3 connections [code]
- **test_pack_chunks_groups_by_directory()** — 3 connections [code]
- **test_estimate_file_tokens_uses_tiktoken_when_available()** — 3 connections [code]
- **test_estimate_file_tokens_falls_back_to_chars_when_no_tokenizer()** — 3 connections [code]
- **test_corpus_parallel_uses_adaptive_retry()** — 3 connections [code]
- **test_corpus_parallel_token_budget_default_packs_files()** — 3 connections [code]

**No cross-community edges found — this community is self-contained.**
